// Only Node-free modules here: this file is the `./server/web` entry point.
import { SIGNATURE_HEADER, parseWebhookEvent, processWebhookEvent } from '../events.js';
import { verifySignatureAsync } from '../webcrypto.js';
import type { WebhookConfig } from '../types.js';

export { SIGNATURE_HEADER, parseWebhookEvent, processWebhookEvent, verifySignatureAsync };

/**
 * Create a framework-neutral webhook handler built on the Web platform.
 *
 * Takes a standard `Request` and returns a standard `Response`, using only Web
 * APIs (`request.text()`, WebCrypto verification via
 * {@link verifySignatureAsync}, `Response.json`). Neither this module nor
 * anything it imports uses a Node built-in. It runs
 * unchanged on any runtime that speaks the Fetch API: Deno (`Deno.serve`),
 * Supabase Edge Functions, Cloudflare Workers, Bun, Vercel/Netlify edge, and
 * the Next.js App Router.
 *
 * Responses:
 * - `405` for any method other than `POST`
 * - `401` when the signature header is missing or the signature is invalid
 * - `500` when the body is not JSON or a handler throws
 * - `200` with `{ received: true, eventId }` once the handler has run
 *
 * Square signs `notificationUrl + rawBody`, so set `notificationUrl` to the
 * exact URL registered on the webhook subscription.
 *
 * @param config - Webhook configuration
 * @returns An async handler: `(request: Request) => Promise<Response>`
 *
 * @example
 * ```typescript
 * // Supabase Edge Function / Deno
 * import { createWebhookHandler } from '@bates-solutions/squareup/server/web';
 *
 * const handler = createWebhookHandler({
 *   signatureKey: Deno.env.get('SQUARE_WEBHOOK_KEY')!,
 *   notificationUrl: 'https://example.supabase.co/functions/v1/square-webhook',
 *   handlers: {
 *     'payment.updated': async (event) => {
 *       await markPaid(event.data.id);
 *     },
 *   },
 * });
 *
 * Deno.serve(handler);
 * ```
 *
 * @example
 * ```typescript
 * // Cloudflare Workers
 * import { createWebhookHandler } from '@bates-solutions/squareup/server/web';
 *
 * export default {
 *   fetch(request: Request, env: { SQUARE_WEBHOOK_KEY: string }) {
 *     return createWebhookHandler({
 *       signatureKey: env.SQUARE_WEBHOOK_KEY,
 *       notificationUrl: 'https://example.com/webhook',
 *       handlers: {},
 *     })(request);
 *   },
 * };
 * ```
 */
export function createWebhookHandler(
  config: WebhookConfig
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
      const rawBody = await request.text();

      const signature = request.headers.get(SIGNATURE_HEADER);
      if (!signature) {
        return Response.json({ error: 'Missing signature header' }, { status: 401 });
      }

      const verification = await verifySignatureAsync(
        rawBody,
        signature,
        config.signatureKey,
        config.notificationUrl
      );
      if (!verification.valid) {
        return Response.json({ error: verification.error }, { status: 401 });
      }

      const event = parseWebhookEvent(rawBody);
      await processWebhookEvent(event, config);

      return Response.json({ received: true, eventId: event.event_id }, { status: 200 });
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : 'Webhook processing failed' },
        { status: 500 }
      );
    }
  };
}
