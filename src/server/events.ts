import type { WebhookConfig, WebhookEvent } from './types.js';

/**
 * Header name for Square webhook signature
 */
export const SIGNATURE_HEADER = 'x-square-hmacsha256-signature';

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
