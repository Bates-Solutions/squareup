# Webhook Handling

This guide covers handling Square webhooks with `@bates-solutions/squareup`.

## Prerequisites

- Square account with webhook configured
- Webhook signature key from Square Developer Dashboard
- A server runtime: Node.js 22+ (Express, Next.js, Lambda) or any Fetch API runtime (Deno, Supabase Edge Functions, Cloudflare Workers, Bun). Verification uses WebCrypto, so no Node built-in is needed

## Overview

Square sends webhooks to notify your application of events like:
- Payment completed
- Order updated
- Customer created
- Refund processed

The library provides utilities for:
1. Signature verification (security)
2. Event parsing (type safety)
3. Event handling (routing)

## Basic Setup

```typescript
import {
  verifySignature,
  parseWebhookEvent,
  SIGNATURE_HEADER,
} from '@bates-solutions/squareup/server';

// Verify and parse a webhook
async function handleWebhook(rawBody: string, signature: string) {
  // 1. Verify signature (async: WebCrypto)
  const result = await verifySignature(
    rawBody,
    signature,
    process.env.SQUARE_WEBHOOK_KEY!
  );

  if (!result.valid) {
    throw new Error(result.error);
  }

  // 2. Parse event
  const event = parseWebhookEvent(rawBody);

  // 3. Handle event
  switch (event.type) {
    case 'payment.created':
      console.log('Payment created:', event.data.id);
      break;
    case 'order.updated':
      console.log('Order updated:', event.data.id);
      break;
    default:
      console.log('Unhandled event:', event.type);
  }
}
```

## Signature Verification

Square signs every webhook request using HMAC-SHA256 over `notificationUrl + rawBody`. Always verify signatures to ensure requests are authentic.

`verifySignature` computes the digest with WebCrypto (`globalThis.crypto.subtle`), so it runs on Node 22+, Deno, Bun, and Cloudflare Workers. WebCrypto is promise-based, so `verifySignature` returns a `Promise` and must be awaited.

```typescript
import { verifySignature } from '@bates-solutions/squareup/server';

const result = await verifySignature(
  rawBody,              // Raw request body as string
  signature,            // From x-square-hmacsha256-signature header
  signatureKey,         // Your webhook signature key
  notificationUrl       // The URL registered on the subscription (Square signs it)
);

if (!result.valid) {
  console.error('Invalid signature:', result.error);
  return { status: 401 };
}
```

### Security Notes

- The signature key is found in Square Developer Dashboard > Webhooks
- Always use timing-safe comparison (the library handles this with a constant-time compare, no Node built-in)

### Migrating from 2.x synchronous `verifySignature`

Before this change `verifySignature` and `parseAndVerifyWebhook` returned their result directly. They now return a `Promise`. Code that called them directly needs an `await`:

```typescript
// before
const result = verifySignature(rawBody, signature, key);
// after
const result = await verifySignature(rawBody, signature, key);
```

Without the `await`, `result.valid` is `undefined` and every request looks invalid (TypeScript flags this). The bundled adapters (`createWebhookHandler`, Express, Next.js, Lambda, `createWebhookProcessor`) already await it, so code that only uses them needs no change.
- Verify before parsing to prevent processing malicious payloads
- Use HTTPS for your webhook endpoint

## Event Types

### Payment Events

```typescript
import type { WebhookEvent } from '@bates-solutions/squareup/server';

// payment.created - New payment started
// payment.updated - Payment status changed (completed, failed, etc.)

interface PaymentData {
  payment: {
    id: string;
    status: string;
    amount_money: { amount: number; currency: string };
    order_id?: string;
    customer_id?: string;
  };
}

function handlePaymentEvent(event: WebhookEvent<PaymentData>) {
  const payment = event.data.object.payment;
  console.log(`Payment ${payment.id}: ${payment.status}`);
}
```

### Order Events

```typescript
// order.created - New order created
// order.updated - Order modified
// order.fulfillment.updated - Fulfillment status changed

interface OrderData {
  order: {
    id: string;
    state: string;
    total_money: { amount: number; currency: string };
  };
}

function handleOrderEvent(event: WebhookEvent<OrderData>) {
  const order = event.data.object.order;
  console.log(`Order ${order.id}: ${order.state}`);
}
```

### Customer Events

```typescript
// customer.created - New customer added
// customer.updated - Customer info changed
// customer.deleted - Customer removed

interface CustomerData {
  customer: {
    id: string;
    email_address?: string;
    given_name?: string;
    family_name?: string;
  };
}

function handleCustomerEvent(event: WebhookEvent<CustomerData>) {
  const customer = event.data.object.customer;
  console.log(`Customer ${customer.id}: ${customer.email_address}`);
}
```

### Refund Events

```typescript
// refund.created - Refund initiated
// refund.updated - Refund status changed

interface RefundData {
  refund: {
    id: string;
    status: string;
    payment_id: string;
    amount_money: { amount: number; currency: string };
  };
}
```

### All Event Types

| Category | Event Types |
|----------|-------------|
| Payment | `payment.created`, `payment.updated` |
| Refund | `refund.created`, `refund.updated` |
| Order | `order.created`, `order.updated`, `order.fulfillment.updated` |
| Customer | `customer.created`, `customer.updated`, `customer.deleted` |
| Subscription | `subscription.created`, `subscription.updated` |
| Invoice | `invoice.created`, `invoice.updated`, `invoice.published`, `invoice.payment_made`, `invoice.canceled` |
| Loyalty | `loyalty.account.created`, `loyalty.account.updated`, `loyalty.program.created`, `loyalty.promotion.created` |
| Catalog | `catalog.version.updated` |
| Inventory | `inventory.count.updated` |
| Team | `team_member.created`, `team_member.updated` |
| Labor | `labor.timecard.created`, `labor.timecard.updated` |

## Using createWebhookProcessor

For a streamlined approach, use the webhook processor:

```typescript
import { createWebhookProcessor } from '@bates-solutions/squareup/server';

const handleWebhook = createWebhookProcessor({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  notificationUrl: 'https://myapp.com/webhook', // Optional

  handlers: {
    'payment.created': async (event) => {
      console.log('New payment:', event.data.id);
      await sendReceipt(event.data.object);
    },

    'payment.updated': async (event) => {
      const payment = event.data.object;
      if (payment.status === 'COMPLETED') {
        await fulfillOrder(payment.order_id);
      }
    },

    'order.updated': async (event) => {
      await syncOrderStatus(event.data.object);
    },

    'customer.created': async (event) => {
      await welcomeEmail(event.data.object);
    },
  },
});

// Use in your route handler
async function webhookEndpoint(rawBody: string, signature: string) {
  const result = await handleWebhook(rawBody, signature);

  if (!result.success) {
    console.error('Webhook failed:', result.error);
    return { status: 400, body: { error: result.error } };
  }

  return { status: 200, body: { received: true } };
}
```

## parseAndVerifyWebhook

Combine verification and parsing in one step:

```typescript
import { parseAndVerifyWebhook } from '@bates-solutions/squareup/server';

try {
  const { event, rawBody, signature } = await parseAndVerifyWebhook(
    rawBody,
    signature,
    process.env.SQUARE_WEBHOOK_KEY!
  );

  console.log('Verified event:', event.type);
} catch (error) {
  console.error('Webhook error:', error.message);
}
```

## Idempotency

Square may send the same webhook multiple times. Use the `event_id` to prevent duplicate processing:

```typescript
import { createWebhookProcessor } from '@bates-solutions/squareup/server';

const processedEvents = new Set<string>();

const handleWebhook = createWebhookProcessor({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  handlers: {
    'payment.created': async (event) => {
      // Check if already processed
      if (processedEvents.has(event.event_id)) {
        console.log('Duplicate event, skipping:', event.event_id);
        return;
      }

      // Process the event
      await processPayment(event.data.object);

      // Mark as processed
      processedEvents.add(event.event_id);
    },
  },
});
```

For production, store processed event IDs in a database:

```typescript
async function handlePaymentCreated(event: WebhookEvent) {
  // Check database
  const existing = await db.webhookEvents.findUnique({
    where: { eventId: event.event_id },
  });

  if (existing) {
    return; // Already processed
  }

  // Process
  await processPayment(event.data.object);

  // Record
  await db.webhookEvents.create({
    data: {
      eventId: event.event_id,
      type: event.type,
      processedAt: new Date(),
    },
  });
}
```

## Error Handling

```typescript
const handleWebhook = createWebhookProcessor({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  throwOnInvalidSignature: true, // Default

  handlers: {
    'payment.created': async (event) => {
      try {
        await processPayment(event);
      } catch (error) {
        // Log error but don't throw
        // Square will retry if you return non-2xx
        console.error('Processing error:', error);

        // Optionally store for retry
        await saveFailedWebhook(event, error);
      }
    },
  },
});
```

## Testing Webhooks

### Using Square's Webhook Tester

1. Go to Square Developer Dashboard > Webhooks
2. Click "Send Test Webhook"
3. Select event type and click "Send"

### Local Development with ngrok

```bash
# Start your server
npm run dev

# In another terminal
ngrok http 3000

# Use the ngrok URL in Square Dashboard
# e.g., https://abc123.ngrok.io/api/webhooks/square
```

### Mock Webhook for Tests

```typescript
import { verifySignature, parseWebhookEvent } from '@bates-solutions/squareup/server';
import crypto from 'crypto';

function createMockWebhook(
  event: object,
  signatureKey: string,
  notificationUrl?: string
) {
  const rawBody = JSON.stringify(event);
  const stringToSign = notificationUrl ? notificationUrl + rawBody : rawBody;

  const signature = crypto
    .createHmac('sha256', signatureKey)
    .update(stringToSign)
    .digest('base64');

  return { rawBody, signature };
}

// In your test
const mockEvent = {
  event_id: 'test-123',
  merchant_id: 'MERCHANT_123',
  type: 'payment.created',
  created_at: new Date().toISOString(),
  data: {
    type: 'payment',
    id: 'PAYMENT_123',
    object: { payment: { id: 'PAYMENT_123', status: 'COMPLETED' } },
  },
};

const { rawBody, signature } = createMockWebhook(
  mockEvent,
  'test-signature-key'
);

const result = await verifySignature(rawBody, signature, 'test-signature-key');
expect(result.valid).toBe(true);
```

## Best Practices

1. **Always verify signatures** - Never skip verification in production
2. **Handle idempotency** - Use `event_id` to prevent duplicate processing
3. **Respond quickly** - Return 200 within seconds, process async
4. **Log everything** - Keep audit trail of received webhooks
5. **Use HTTPS** - Square requires HTTPS for production webhooks
6. **Handle retries** - Square retries failed webhooks up to 5 times

## Next Steps

- [Middleware Guide](./middleware.md) - Express and Next.js integration
- [Payments Guide](../core/payments.md) - Backend payment processing
