import type {
  WebhookConfig,
  WebhookEvent,
  WebhookVerificationResult,
  ParsedWebhookRequest,
  PaymentWebhookObject,
  RefundWebhookObject,
} from './types.js';

/**
 * Header name for Square webhook signature
 */
export const SIGNATURE_HEADER = 'x-square-hmacsha256-signature';

/**
 * Compute an HMAC-SHA256 base64 digest using WebCrypto.
 *
 * Uses `globalThis.crypto.subtle` so verification runs on any modern runtime
 * (Node 22+, Deno, Bun, Cloudflare Workers) with no Node built-ins.
 */
async function hmacSha256Base64(key: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const digest = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload));
  let binary = '';
  for (const byte of new Uint8Array(digest)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Constant-time comparison of two strings.
 *
 * Pure JS (no `node:crypto`) so it works on edge runtimes. Returns `false` for
 * unequal lengths or empty input without comparing characters.
 */
function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length || a.length === 0) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Verify a Square webhook signature using HMAC-SHA256
 *
 * Computes the digest with WebCrypto (`globalThis.crypto.subtle`), so it needs
 * no Node built-in and runs on Node 22+, Deno, Bun, and Cloudflare Workers.
 * Because WebCrypto is promise-based, this function is async: `await` it.
 *
 * @param rawBody - The raw request body as a string
 * @param signature - The signature from the x-square-hmacsha256-signature header
 * @param signatureKey - Your webhook signature key from Square
 * @param notificationUrl - The URL where the webhook was sent (optional, for additional verification)
 * @returns Verification result with valid flag and optional error
 *
 * @example
 * ```typescript
 * import { verifySignature } from '@bates-solutions/squareup/server';
 *
 * const result = await verifySignature(
 *   rawBody,
 *   req.headers['x-square-hmacsha256-signature'],
 *   process.env.SQUARE_WEBHOOK_KEY!
 * );
 *
 * if (!result.valid) {
 *   return res.status(401).json({ error: result.error });
 * }
 * ```
 */
export async function verifySignature(
  rawBody: string,
  signature: string,
  signatureKey: string,
  notificationUrl?: string
): Promise<WebhookVerificationResult> {
  if (!rawBody) {
    return { valid: false, error: 'Missing request body' };
  }

  if (!signature) {
    return { valid: false, error: 'Missing signature header' };
  }

  if (!signatureKey) {
    return { valid: false, error: 'Missing signature key' };
  }

  try {
    // Build the string to sign
    // Square uses: notificationUrl + rawBody (if URL provided) or just rawBody
    const stringToSign = notificationUrl ? notificationUrl + rawBody : rawBody;

    const expectedSignature = await hmacSha256Base64(signatureKey, stringToSign);

    // Constant-time comparison to prevent timing attacks
    if (!timingSafeEqualString(signature, expectedSignature)) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Signature verification failed',
    };
  }
}

/**
 * Parse a webhook request body into a typed event
 *
 * @param rawBody - The raw request body string
 * @returns Parsed webhook event
 * @throws Error if parsing fails
 *
 * @example
 * ```typescript
 * const event = parseWebhookEvent(rawBody);
 * console.log(event.type); // 'payment.completed'
 * ```
 */
export function parseWebhookEvent(rawBody: string): WebhookEvent {
  try {
    return JSON.parse(rawBody) as WebhookEvent;
  } catch {
    throw new Error('Invalid webhook payload: failed to parse JSON');
  }
}

/**
 * Parse and verify a webhook request
 *
 * @param rawBody - The raw request body string
 * @param signature - The signature from headers
 * @param signatureKey - Your webhook signature key
 * @param notificationUrl - Optional notification URL for verification
 * @returns Parsed and verified webhook request
 * @throws Error if verification or parsing fails
 *
 * @example
 * ```typescript
 * const { event } = await parseAndVerifyWebhook(
 *   rawBody,
 *   signature,
 *   process.env.SQUARE_WEBHOOK_KEY!
 * );
 * ```
 */
export async function parseAndVerifyWebhook(
  rawBody: string,
  signature: string,
  signatureKey: string,
  notificationUrl?: string
): Promise<ParsedWebhookRequest> {
  const verification = await verifySignature(rawBody, signature, signatureKey, notificationUrl);

  if (!verification.valid) {
    throw new Error(verification.error ?? 'Signature verification failed');
  }

  const event = parseWebhookEvent(rawBody);

  return {
    rawBody,
    signature,
    event,
  };
}

/**
 * Process a webhook event by calling the appropriate handler
 *
 * @param event - The parsed webhook event
 * @param config - Webhook configuration with handlers
 * @returns Promise that resolves when handler completes
 *
 * @example
 * ```typescript
 * await processWebhookEvent(event, {
 *   signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
 *   handlers: {
 *     'payment.created': async (event) => {
 *       console.log('Payment created:', event.data.id);
 *     },
 *   },
 * });
 * ```
 */
export async function processWebhookEvent(
  event: WebhookEvent,
  config: WebhookConfig
): Promise<void> {
  const handler = config.handlers[event.type];

  if (handler) {
    await handler(event);
  }
}

/**
 * Create a webhook handler function that verifies and processes events
 *
 * @param config - Webhook configuration
 * @returns Handler function that processes raw webhook requests
 *
 * @example
 * ```typescript
 * const handleWebhook = createWebhookProcessor({
 *   signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
 *   handlers: {
 *     'payment.created': async (event) => {
 *       await sendReceipt(event.data.object.payment);
 *     },
 *     'order.updated': async (event) => {
 *       await updateOrderStatus(event.data.object.order);
 *     },
 *   },
 * });
 *
 * // Use in your route handler
 * const result = await handleWebhook(rawBody, signature);
 * ```
 */
export function createWebhookProcessor(
  config: WebhookConfig
): (rawBody: string, signature: string) => Promise<{ success: boolean; event?: WebhookEvent; error?: string }> {
  return async (
    rawBody: string,
    signature: string
  ): Promise<{ success: boolean; event?: WebhookEvent; error?: string }> => {
    try {
      const verification = await verifySignature(
        rawBody,
        signature,
        config.signatureKey,
        config.notificationUrl
      );

      // Never dispatch on an invalid signature. `throwOnInvalidSignature` only
      // controls throw-vs-return semantics — both stop before dispatch.
      if (!verification.valid) {
        if (config.throwOnInvalidSignature !== false) {
          throw new Error(verification.error ?? 'Signature verification failed');
        }
        return { success: false, error: verification.error };
      }

      const event = parseWebhookEvent(rawBody);
      await processWebhookEvent(event, config);

      return { success: true, event };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
}

/**
 * Extract the payment ID from a webhook event
 */
export function getPaymentId(event: WebhookEvent): string | undefined {
  if (event.type.startsWith('payment.')) {
    return event.data.id;
  }
  if (event.type.startsWith('refund.')) {
    const obj = event.data.object as Partial<RefundWebhookObject>;
    return obj.refund?.payment_id;
  }
  return undefined;
}

/**
 * Extract the order ID from a webhook event
 */
export function getOrderId(event: WebhookEvent): string | undefined {
  if (event.type.startsWith('payment.')) {
    const obj = event.data.object as Partial<PaymentWebhookObject>;
    return obj.payment?.order_id;
  }
  if (event.type.startsWith('order.')) {
    return event.data.id;
  }
  if (event.type.startsWith('refund.')) {
    const obj = event.data.object as Partial<RefundWebhookObject>;
    return obj.refund?.order_id;
  }
  return undefined;
}

/**
 * Extract the customer ID from a webhook event
 */
export function getCustomerId(event: WebhookEvent): string | undefined {
  if (event.type.startsWith('payment.')) {
    const obj = event.data.object as Partial<PaymentWebhookObject>;
    return obj.payment?.customer_id;
  }
  if (event.type.startsWith('customer.')) {
    return event.data.id;
  }
  return undefined;
}
