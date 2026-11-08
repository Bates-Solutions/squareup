import {
  verifySignature,
  parseWebhookEvent,
  processWebhookEvent,
  SIGNATURE_HEADER,
} from '../webhook.js';
import type { WebhookConfig, WebhookEvent } from '../types.js';

/**
 * Minimal structural stand-ins for the Express types this middleware touches.
 *
 * Express is only a peer/dev dependency, so it is deliberately kept out of the
 * published type graph. Importing `Request`/`Response`/`RequestHandler` from
 * `express` here would make the generated declaration file reach back into
 * untranspiled TypeScript source in the JSR npm tarball, breaking every
 * `/server` consumer — including ones that never touch Express (see
 * [#128](https://github.com/mbates/squareup/issues/128)). The sibling Next.js
 * and Lambda middleware already declare their own local types for the same
 * reason. These interfaces are structurally compatible with Express 4 and 5, so
 * `createExpressWebhookHandler(...)` still drops straight into
 * `app.post(path, handler)` with full type-checking.
 */
export interface ExpressRequestLike {
  /** Parsed or raw request body (Buffer, string, or parsed JSON). */
  body?: unknown;
  /** Request headers, keyed lowercase as Node/Express provide them. */
  headers: Record<string, string | string[] | undefined>;
  /** Node stream event subscription, used to capture the raw body. */
  on(event: string, listener: (...args: unknown[]) => void): unknown;
}

/** Minimal structural stand-in for the Express `Response` methods used here. */
export interface ExpressResponseLike {
  status(code: number): ExpressResponseLike;
  json(body: unknown): ExpressResponseLike;
}

/** Minimal structural stand-in for the Express `NextFunction`. */
export type ExpressNextFunction = (err?: unknown) => void;

/** Minimal structural stand-in for the Express `RequestHandler`. */
export type ExpressRequestHandler = (
  req: ExpressRequestLike,
  res: ExpressResponseLike,
  next: ExpressNextFunction
) => void | Promise<void>;

/**
 * Request object as seen by the webhook middleware, carrying the Square webhook
 * data it attaches.
 *
 * This extends the minimal {@link ExpressRequestLike} rather than Express's full
 * `Request` (see the note above), so it exposes only `body`, `headers`, `on`,
 * plus the fields below. If you type your own downstream middleware against it
 * and need Express's extras (`params`, `query`, `get(...)`, …), intersect it
 * with the real Express request: `req: SquareWebhookRequest & express.Request`.
 */
export interface SquareWebhookRequest extends ExpressRequestLike {
  /** The raw request body as a string */
  rawBody?: string;
  /** The parsed Square webhook event */
  squareEvent?: WebhookEvent;
}

/**
 * Options for the Express webhook middleware
 */
export interface ExpressWebhookOptions extends WebhookConfig {
  /**
   * Path to mount the webhook handler
   * @default '/webhook'
   */
  path?: string;
  /**
   * Whether to send response automatically
   * @default true
   */
  autoRespond?: boolean;
}

/**
 * Create Express middleware for handling Square webhooks
 *
 * This middleware:
 * 1. Captures the raw body for signature verification
 * 2. Verifies the webhook signature
 * 3. Parses the event and attaches it to the request
 * 4. Calls the appropriate handler
 *
 * @param config - Webhook configuration
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { createExpressWebhookHandler } from '@bates-solutions/squareup/server';
 *
 * const app = express();
 *
 * // IMPORTANT: Use raw body parser for webhook route
 * app.use('/webhook', express.raw({ type: 'application/json' }));
 *
 * app.post('/webhook', createExpressWebhookHandler({
 *   signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
 *   handlers: {
 *     'payment.created': async (event) => {
 *       console.log('Payment created:', event.data.id);
 *     },
 *   },
 * }));
 * ```
 */
export function createExpressWebhookHandler(
  config: ExpressWebhookOptions
): ExpressRequestHandler {
  const { autoRespond = true, ...webhookConfig } = config;

  return async (
    req: SquareWebhookRequest,
    res: ExpressResponseLike,
    next: ExpressNextFunction
  ): Promise<void> => {
    try {
      // Get raw body - Express with raw() parser stores it as Buffer
      let rawBody: string;
      if (Buffer.isBuffer(req.body)) {
        rawBody = req.body.toString('utf8');
      } else if (typeof req.body === 'string') {
        rawBody = req.body;
      } else if (req.rawBody) {
        rawBody = req.rawBody;
      } else {
        // Body might be parsed JSON, stringify it (not ideal for signature verification)
        rawBody = JSON.stringify(req.body);
      }

      // Get signature from headers
      const signature = req.headers[SIGNATURE_HEADER];
      if (!signature || Array.isArray(signature)) {
        if (autoRespond) {
          res.status(401).json({ error: 'Missing or invalid signature header' });
          return;
        }
        throw new Error('Missing or invalid signature header');
      }

      // Verify signature
      const verification = verifySignature(
        rawBody,
        signature,
        webhookConfig.signatureKey,
        webhookConfig.notificationUrl
      );

      if (!verification.valid) {
        if (autoRespond) {
          res.status(401).json({ error: verification.error });
          return;
        }
        throw new Error(verification.error);
      }

      // Parse event
      const event = parseWebhookEvent(rawBody);

      // Attach to request for downstream middleware
      req.rawBody = rawBody;
      req.squareEvent = event;

      // Process event with handlers
      await processWebhookEvent(event, webhookConfig);

      // Send success response
      if (autoRespond) {
        res.status(200).json({ received: true, eventId: event.event_id });
        return;
      }

      next();
    } catch (error) {
      if (autoRespond) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Webhook processing failed',
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Raw body parser middleware for Express
 *
 * Captures the raw body before JSON parsing for signature verification.
 * Use this if you need to parse JSON but also need the raw body.
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { rawBodyMiddleware } from '@bates-solutions/squareup/server';
 *
 * const app = express();
 * app.use('/webhook', rawBodyMiddleware);
 * app.use('/webhook', express.json());
 * ```
 */
export const rawBodyMiddleware: ExpressRequestHandler = (
  req: SquareWebhookRequest,
  _res: ExpressResponseLike,
  next: ExpressNextFunction
): void => {
  const chunks: Buffer[] = [];

  req.on('data', (chunk: unknown) => {
    chunks.push(chunk as Buffer);
  });

  req.on('end', () => {
    req.rawBody = Buffer.concat(chunks).toString('utf8');
    next();
  });

  req.on('error', next);
};
