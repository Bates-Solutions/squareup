import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  WebhookConfig,
  WebhookEvent,
  WebhookVerificationResult,
  ParsedWebhookRequest,
  PaymentWebhookObject,
  RefundWebhookObject,
} from './types.js';
import { SIGNATURE_HEADER, parseWebhookEvent, processWebhookEvent } from './events.js';

// Defined in the Node-free events module so the edge entry point can share them.
export { SIGNATURE_HEADER, parseWebhookEvent, processWebhookEvent };

/**
 * Verify a Square webhook signature using HMAC-SHA256
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
 * const result = verifySignature(
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
export function verifySignature(
  rawBody: string,
  signature: string,
  signatureKey: string,
  notificationUrl?: string
): WebhookVerificationResult {
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

    // Generate HMAC-SHA256 signature
    const expectedSignature = createHmac('sha256', signatureKey)
      .update(stringToSign)
      .digest('base64');

    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'base64');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64');

    // Buffers must be same length for timingSafeEqual
    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Invalid signature' };
    }

    const isValid = timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isValid) {
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
 * const { event } = parseAndVerifyWebhook(
 *   rawBody,
 *   signature,
 *   process.env.SQUARE_WEBHOOK_KEY!
 * );
 * ```
 */
export function parseAndVerifyWebhook(
  rawBody: string,
  signature: string,
  signatureKey: string,
  notificationUrl?: string
): ParsedWebhookRequest {
  const verification = verifySignature(rawBody, signature, signatureKey, notificationUrl);

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
      const verification = verifySignature(
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
