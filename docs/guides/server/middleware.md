# Framework Middleware

This guide covers webhook adapters for Web/edge runtimes, Express, Next.js and AWS Lambda with `@bates-solutions/squareup`.

## Import paths

Every helper is available from the `@bates-solutions/squareup/server` barrel (used
throughout this guide). Each framework adapter is **also** exported from its own
subpath, so an app pulls in only the adapter it uses — a Lambda or Next.js app
never drags Express's types into its type-check, and vice versa:

| Adapter | Barrel | Dedicated subpath |
| --- | --- | --- |
| Web / edge | `@bates-solutions/squareup/server` | `@bates-solutions/squareup/server/web` |
| Express | `@bates-solutions/squareup/server` | `@bates-solutions/squareup/server/express` |
| Next.js | `@bates-solutions/squareup/server` | `@bates-solutions/squareup/server/nextjs` |
| Lambda  | `@bates-solutions/squareup/server` | `@bates-solutions/squareup/server/lambda` |

The framework-agnostic core (`verifySignature`, `parseWebhookEvent`,
`processWebhookEvent`, the typed event objects, the id extractors) lives on the
barrel and carries no framework dependency.

## Prerequisites

- Square account with webhook configured
- Webhook signature key from Square Developer Dashboard
- Express or Next.js application, or a Fetch API runtime (Deno, Supabase Edge Functions, Cloudflare Workers, Bun)

## Web / Edge Handler

`createWebhookHandler(config)` returns `(request: Request) => Promise<Response>`.
It verifies with `verifySignatureAsync` (WebCrypto) and uses only Web APIs
(`request.text()`, `Response.json`), so the same handler runs on Deno, Supabase
Edge Functions, Cloudflare Workers, Bun and Vercel/Netlify edge. Import it from
the `./server/web` subpath: that entry point imports no Node built-in, while the
`./server` barrel also loads the Node adapters.

```typescript
// supabase/functions/square-webhook/index.ts
import { createWebhookHandler } from 'jsr:@bates-solutions/squareup/server/web';

Deno.serve(createWebhookHandler({
  signatureKey: Deno.env.get('SQUARE_WEBHOOK_KEY')!,
  // Square signs notificationUrl + body: use the exact subscription URL
  notificationUrl: 'https://example.supabase.co/functions/v1/square-webhook',
  handlers: {
    'payment.updated': async (event) => {
      console.log('Payment updated:', event.data.id);
    },
  },
}));
```

```typescript
// Cloudflare Workers
import { createWebhookHandler } from '@bates-solutions/squareup/server/web';

export default {
  fetch(request: Request, env: { SQUARE_WEBHOOK_KEY: string }) {
    return createWebhookHandler({
      signatureKey: env.SQUARE_WEBHOOK_KEY,
      notificationUrl: 'https://example.com/webhook',
      handlers: {},
    })(request);
  },
};
```

Responses: `405` for a non-POST method, `401` for a missing or invalid
signature, `500` when the body is not JSON or a handler throws, and `200` with
`{ received: true, eventId }` after the handler has run.

`./server/web` also exports `verifySignatureAsync`, `parseWebhookEvent`,
`processWebhookEvent` and `SIGNATURE_HEADER` for custom edge handling. The
Express, Next.js and Lambda adapters below are unchanged and keep using the
synchronous, Node `crypto` based `verifySignature`.

## Express Middleware

### Basic Setup

```typescript
import express from 'express';
import { createExpressWebhookHandler } from '@bates-solutions/squareup/server';

const app = express();

// IMPORTANT: Use raw body parser for webhook route
app.use('/webhook', express.raw({ type: 'application/json' }));

// Create webhook handler
app.post('/webhook', createExpressWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  handlers: {
    'payment.created': async (event) => {
      console.log('Payment created:', event.data.id);
    },
    'order.updated': async (event) => {
      console.log('Order updated:', event.data.id);
    },
  },
}));

app.listen(3000);
```

### Configuration Options

```typescript
createExpressWebhookHandler({
  // Required
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,

  // Event handlers
  handlers: {
    'payment.created': async (event) => { /* ... */ },
    'payment.updated': async (event) => { /* ... */ },
    'order.created': async (event) => { /* ... */ },
  },

  // Optional
  notificationUrl: 'https://myapp.com/webhook', // For signature verification
  autoRespond: true, // Default: true - send response automatically
  throwOnInvalidSignature: true, // Default: true
});
```

### Accessing Event in Downstream Middleware

Set `autoRespond: false` to handle the response yourself:

```typescript
app.post('/webhook',
  createExpressWebhookHandler({
    signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
    handlers: {}, // Process manually
    autoRespond: false,
  }),
  (req, res) => {
    // Event is attached to request
    const event = req.squareEvent;
    console.log('Event type:', event?.type);

    // Custom response
    res.json({ processed: true, eventId: event?.event_id });
  }
);
```

### Raw Body Middleware

If you need JSON parsing but also need the raw body:

```typescript
import express from 'express';
import {
  rawBodyMiddleware,
  createExpressWebhookHandler,
} from '@bates-solutions/squareup/server';

const app = express();

// For webhook routes - capture raw body, then parse JSON
app.use('/webhook', rawBodyMiddleware);
app.use('/webhook', express.json());

app.post('/webhook', createExpressWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  handlers: {
    'payment.created': async (event) => {
      // Handle payment
    },
  },
}));

// Regular routes use normal JSON parsing
app.use(express.json());
```

### Complete Express Example

```typescript
import express from 'express';
import { createExpressWebhookHandler } from '@bates-solutions/squareup/server';
import { createSquareClient } from '@bates-solutions/squareup';

const app = express();
const square = createSquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: 'sandbox',
});

// Webhook route (raw body needed)
app.use('/webhook', express.raw({ type: 'application/json' }));

app.post('/webhook', createExpressWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  handlers: {
    'payment.created': async (event) => {
      const paymentId = event.data.id;
      console.log('New payment:', paymentId);

      // Fetch full payment details
      const payment = await square.payments.get(paymentId);
      console.log('Amount:', payment.amountMoney?.amount);
    },

    'order.fulfillment.updated': async (event) => {
      const order = event.data.object;
      await sendFulfillmentEmail(order);
    },
  },
}));

// Other routes use JSON
app.use(express.json());

app.post('/api/payments', async (req, res) => {
  const payment = await square.payments.create({
    sourceId: req.body.sourceId,
    amount: req.body.amount,
  });
  res.json(payment);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Next.js App Router

### Basic Setup

```typescript
// app/api/webhook/route.ts
import { createNextWebhookHandler } from '@bates-solutions/squareup/server';

export const POST = createNextWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  handlers: {
    'payment.created': async (event) => {
      console.log('Payment created:', event.data.id);
    },
    'order.updated': async (event) => {
      console.log('Order updated:', event.data.id);
    },
  },
});
```

### Custom Handling

For more control, use `parseNextWebhook`:

```typescript
// app/api/webhook/route.ts
import { parseNextWebhook } from '@bates-solutions/squareup/server';

export async function POST(request: Request) {
  try {
    const event = await parseNextWebhook(
      request,
      process.env.SQUARE_WEBHOOK_KEY!
    );

    // Custom event handling
    switch (event.type) {
      case 'payment.created':
        await handlePaymentCreated(event);
        break;

      case 'order.fulfillment.updated':
        await handleFulfillment(event);
        break;

      default:
        console.log('Unhandled event:', event.type);
    }

    return Response.json({
      received: true,
      eventId: event.event_id,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: error instanceof Error && error.message.includes('signature') ? 401 : 500 }
    );
  }
}

async function handlePaymentCreated(event: WebhookEvent) {
  // Your custom logic
}

async function handleFulfillment(event: WebhookEvent) {
  // Your custom logic
}
```

### With Database

```typescript
// app/api/webhook/route.ts
import { createNextWebhookHandler } from '@bates-solutions/squareup/server';
import { prisma } from '@/lib/prisma';

export const POST = createNextWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  handlers: {
    'payment.created': async (event) => {
      // Check for duplicate
      const existing = await prisma.webhookEvent.findUnique({
        where: { eventId: event.event_id },
      });

      if (existing) {
        console.log('Duplicate event, skipping');
        return;
      }

      // Process payment
      const payment = event.data.object.payment;
      await prisma.$transaction([
        // Record the webhook
        prisma.webhookEvent.create({
          data: {
            eventId: event.event_id,
            type: event.type,
            processedAt: new Date(),
          },
        }),
        // Update order status
        prisma.order.update({
          where: { squareOrderId: payment.order_id },
          data: { status: 'PAID', squarePaymentId: payment.id },
        }),
      ]);
    },
  },
});
```

## Next.js Pages Router

### Basic Setup

```typescript
// pages/api/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createNextPagesWebhookHandler } from '@bates-solutions/squareup/server';

// Disable body parsing - we need raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default createNextPagesWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  handlers: {
    'payment.created': async (event) => {
      console.log('Payment created:', event.data.id);
    },
  },
});
```

### Custom Handling in Pages Router

```typescript
// pages/api/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySignature, parseWebhookEvent, SIGNATURE_HEADER } from '@bates-solutions/squareup/server';

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await getRawBody(req);
  const signature = req.headers[SIGNATURE_HEADER] as string;

  // Verify signature
  const verification = verifySignature(
    rawBody,
    signature,
    process.env.SQUARE_WEBHOOK_KEY!
  );

  if (!verification.valid) {
    return res.status(401).json({ error: verification.error });
  }

  // Parse and handle event
  const event = parseWebhookEvent(rawBody);

  switch (event.type) {
    case 'payment.created':
      // Handle payment
      break;
    default:
      console.log('Unhandled:', event.type);
  }

  res.status(200).json({ received: true });
}
```

## Request Types

### Express Extended Request

```typescript
import type { SquareWebhookRequest } from '@bates-solutions/squareup/server';

// Access Square-specific properties
app.post('/webhook', handler, (req: SquareWebhookRequest, res) => {
  console.log('Raw body:', req.rawBody);
  console.log('Event:', req.squareEvent);
});
```

> `SquareWebhookRequest` extends a **minimal structural** request type (so the
> package carries no Express dependency in its published types — see
> [#128](https://github.com/mbates/squareup/issues/128)). It exposes `body`,
> `headers`, `on`, `rawBody`, and `squareEvent`. If your downstream handler also
> needs Express extras like `req.params`, `req.query`, or `req.get(...)`, type the
> parameter as an intersection with the real Express request:
>
> ```typescript
> import type { Request } from 'express';
>
> app.post('/webhook', handler, (req: SquareWebhookRequest & Request, res) => {
>   console.log('Event:', req.squareEvent); // from squareup
>   console.log('Query:', req.query);        // from express
> });
> ```

### Next.js Webhook Response

```typescript
interface WebhookResponse {
  status: number;
  body: Record<string, unknown>;
}
```

## Error Responses

The middleware returns standard error responses:

| Status | Reason |
|--------|--------|
| 200 | Success |
| 401 | Missing/invalid signature |
| 405 | Wrong HTTP method (Web handler, Pages Router) |
| 500 | Handler error |

## Testing Locally

### Using ngrok

```bash
# Terminal 1: Start your server
npm run dev

# Terminal 2: Expose to internet
ngrok http 3000
```

Configure the ngrok URL in Square Developer Dashboard > Webhooks.

### Mock Webhook Tests

```typescript
import { verifySignature } from '@bates-solutions/squareup/server';
import crypto from 'crypto';

function createTestWebhook(event: object, key: string) {
  const rawBody = JSON.stringify(event);
  const signature = crypto
    .createHmac('sha256', key)
    .update(rawBody)
    .digest('base64');

  return { rawBody, signature };
}

// In your test
test('webhook handler', async () => {
  const { rawBody, signature } = createTestWebhook(
    {
      event_id: 'test-123',
      type: 'payment.created',
      data: { id: 'PAYMENT_123', object: {} },
    },
    'test-key'
  );

  const response = await fetch('/api/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-square-hmacsha256-signature': signature,
    },
    body: rawBody,
  });

  expect(response.status).toBe(200);
});
```

## Best Practices

1. **Raw body parsing** - Always disable JSON parsing for webhook routes
2. **Verify first** - Check signature before any processing
3. **Idempotency** - Store and check `event_id` to prevent duplicates
4. **Quick response** - Return 200 quickly, process async if needed
5. **Error handling** - Catch errors to prevent 500s (Square will retry)
6. **Logging** - Log all received webhooks for debugging

## Next Steps

- [Webhooks Guide](./webhooks.md) - Webhook concepts and event types
- [Payments Guide](../core/payments.md) - Handle payment events
