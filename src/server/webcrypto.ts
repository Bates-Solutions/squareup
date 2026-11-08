import type { WebhookVerificationResult } from './types.js';

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
 * Verify a Square webhook signature with WebCrypto (edge-safe, async).
 *
 * The same check as {@link verifySignature}, HMAC-SHA256 over
 * `notificationUrl + rawBody` compared in constant time, but computed with
 * `globalThis.crypto.subtle` instead of `node:crypto`. Use it on Deno,
 * Supabase Edge Functions, Cloudflare Workers or Bun, where `node:crypto` may
 * be missing. WebCrypto is promise-based, so this returns a `Promise`.
 *
 * On Node, the synchronous {@link verifySignature} is still available and is
 * what the Express, Next.js and Lambda adapters use.
 *
 * @param rawBody - The raw request body as a string
 * @param signature - The signature from the x-square-hmacsha256-signature header
 * @param signatureKey - Your webhook signature key from Square
 * @param notificationUrl - The URL registered on the webhook subscription (Square signs it)
 * @returns Verification result with valid flag and optional error
 *
 * @example
 * ```typescript
 * import { verifySignatureAsync, SIGNATURE_HEADER } from '@bates-solutions/squareup/server/web';
 *
 * const rawBody = await request.text();
 * const result = await verifySignatureAsync(
 *   rawBody,
 *   request.headers.get(SIGNATURE_HEADER) ?? '',
 *   Deno.env.get('SQUARE_WEBHOOK_KEY')!,
 *   'https://example.com/webhook'
 * );
 *
 * if (!result.valid) {
 *   return Response.json({ error: result.error }, { status: 401 });
 * }
 * ```
 */
export async function verifySignatureAsync(
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
    const stringToSign = notificationUrl ? notificationUrl + rawBody : rawBody;
    const expectedSignature = await hmacSha256Base64(signatureKey, stringToSign);

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
