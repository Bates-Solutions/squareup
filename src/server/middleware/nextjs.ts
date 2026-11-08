import {
  verifySignature,
  parseWebhookEvent,
  processWebhookEvent,
  SIGNATURE_HEADER,
} from '../webhook.js';
import type { WebhookConfig, WebhookEvent } from '../types.js';

/**
 * Response type for Next.js webhook handlers
 */
export interface WebhookResponse {
  status: number;
  body: Record<string, unknown>;
}

/**
 * Node.js readable stream interface for raw body reading
 */
interface NodeReadable {
  on(event: 'data', listener: (chunk: Buffer) => void): void;
  on(event: 'end', listener: () => void): void;
  on(event: 'error', listener: (err: Error) => void): void;
}

/**
 * Next.js Pages Router request type
 */
interface NextPagesRequest extends NodeReadable {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

/**
 * Next.js Pages Router response type
 */
interface NextPagesResponse {
  status: (code: number) => { json: (body: unknown) => void };
}

/**
 * Create a Next.js App Router webhook handler
 *
 * @param config - Webhook configuration
 * @returns Route handler for POST requests
 *
 * @example
 * ```typescript
 * // app/api/webhook/route.ts
 * import { createNextWebhookHandler } from '@bates-solutions/squareup/server';
 *
 * export const POST = createNextWebhookHandler({
 *   signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
 *   handlers: {
 *     'payment.created': async (event) => {
 *       console.log('Payment created:', event.data.id);
 *     },
 *     'order.fulfillment.updated': async (event) => {
 *       await notifyCustomer(event.data.object);
 *     },
 *   },
 * });
 * ```
 */
export function createNextWebhookHandler(
  config: WebhookConfig
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    try {
      // Get raw body
      const rawBody = await request.text();

      // Get signature from headers
      const signature = request.headers.get(SIGNATURE_HEADER);
      if (!signature) {
        return Response.json(
          { error: 'Missing signature header' },
          { status: 401 }
        );
      }

      // Verify signature
      const verification = verifySignature(
        rawBody,
        signature,
        config.signatureKey,
        config.notificationUrl
      );

      if (!verification.valid) {
        return Response.json(
          { error: verification.error },
          { status: 401 }
        );
      }

      // Parse and process event
      const event = parseWebhookEvent(rawBody);
      await processWebhookEvent(event, config);

      return Response.json(
        { received: true, eventId: event.event_id },
        { status: 200 }
      );
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : 'Webhook processing failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Create a Next.js Pages Router API handler
 *
 * @param config - Webhook configuration
 * @returns API route handler
 *
 * @example
 * ```typescript
 * // pages/api/webhook.ts
 * import { createNextPagesWebhookHandler } from '@bates-solutions/squareup/server';
 *
 * export const config = {
 *   api: { bodyParser: false }, // Required for raw body
 * };
 *
 * export default createNextPagesWebhookHandler({
 *   signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
 *   handlers: {
 *     'payment.created': async (event) => {
 *       console.log('Payment:', event.data.id);
 *     },
 *   },
 * });
 * ```
 */
export function createNextPagesWebhookHandler(
  config: WebhookConfig
): (req: NextPagesRequest, res: NextPagesResponse) => Promise<void> {
  return async (req: NextPagesRequest, res: NextPagesResponse): Promise<void> => {
    // Only allow POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      // Get raw body
      const rawBody = await getRawBody(req);

      // Get signature
      const signatureHeader = req.headers[SIGNATURE_HEADER];
      const signature = Array.isArray(signatureHeader)
        ? signatureHeader[0]
        : signatureHeader;

      if (!signature) {
        res.status(401).json({ error: 'Missing signature header' });
        return;
      }

      // Verify signature
      const verification = verifySignature(
        rawBody,
        signature,
        config.signatureKey,
        config.notificationUrl
      );

      if (!verification.valid) {
        res.status(401).json({ error: verification.error });
        return;
      }

      // Parse and process event
      const event = parseWebhookEvent(rawBody);
      await processWebhookEvent(event, config);

      res.status(200).json({ received: true, eventId: event.event_id });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      });
    }
  };
}

/**
 * Read raw body from Node.js request stream
 */
function getRawBody(req: NodeReadable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    req.on('error', reject);
  });
}

/**
 * Utility to parse webhook event from Next.js request
 *
 * Use this for custom handling when you don't want automatic processing
 *
 * @param request - The incoming request
 * @param signatureKey - Your webhook signature key
 * @param notificationUrl - Optional URL for signature verification
 * @returns Parsed webhook event
 * @throws Error if verification fails
 *
 * @example
 * ```typescript
 * // app/api/webhook/route.ts
 * import { parseNextWebhook } from '@bates-solutions/squareup/server';
 *
 * export async function POST(request: Request) {
 *   const event = await parseNextWebhook(
 *     request,
 *     process.env.SQUARE_WEBHOOK_KEY!
 *   );
 *
 *   // Custom handling
 *   switch (event.type) {
 *     case 'payment.created':
 *       // ...
 *   }
 *
 *   return Response.json({ received: true });
 * }
 * ```
 */
export async function parseNextWebhook(
  request: Request,
  signatureKey: string,
  notificationUrl?: string
): Promise<WebhookEvent> {
  const rawBody = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER);

  if (!signature) {
    throw new Error('Missing signature header');
  }

  const verification = verifySignature(
    rawBody,
    signature,
    signatureKey,
    notificationUrl
  );

  if (!verification.valid) {
    throw new Error(verification.error ?? 'Signature verification failed');
  }

  return parseWebhookEvent(rawBody);
}
