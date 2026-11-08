<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white&style=for-the-badge" alt="Node.js" height="28">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white&style=for-the-badge" alt="TypeScript" height="28">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Square-Payments-0066CC?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNjZDQyIvPgo8cGF0aCBkPSJNOC41IDEySDE1LjVWMTMuNUgxMC41VjE1SDE1LjVWMTYuNUgxMC41VjE4SDE1LjVWMTlIMFYxMkg4LjVWMTJIMFYxMkg4LjVWMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K&style=for-the-badge" alt="Square" height="28">
</p>

<h1 align="center">@bates-solutions/squareup</h1>

<p align="center">
  <strong>The modern TypeScript SDK for Square payments</strong><br>
  Build payment backends with type-safe APIs, fluent builders, and webhook support.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0+-blue.svg" alt="TypeScript"></a>
</p>

---

Stop wrestling with Square's low-level APIs. **squareup** gives you a simplified client API and fluent builders that make payment integration straightforward. Process payments, manage orders, handle webhooks. All with full TypeScript support and zero boilerplate.

## Features

- **Simplified APIs** - Less boilerplate, more productivity
- **Type-Safe** - Full TypeScript support with strict types
- **Fluent Builders** - Chainable order and payment construction
- **Webhook Support** - Signature verification and middleware for Express/Next.js
- **OAuth** - Authorize URL, code exchange, refresh, revoke and token status for multi-tenant apps ([guide](./docs/guides/core/oauth.md))
- **Service Classes** - Payments, Orders, Customers, Customer Groups, Catalog (incl. pricing rules and subscription plan listing), Inventory, Subscriptions, Invoices, Loyalty, Gift Cards

## Requirements

| Dependency | Version |
| ---------- | ------- |
| Square SDK | `>=45.0.1 <47` (`square@45` or `square@46`) |
| Node.js    | 22+     |
| TypeScript | 5.0+    |

> **Upgrading from 1.x?** 2.x requires `square@45` or later, which changed the Inventory API. Your wrapper code keeps working. See [Upgrading from 1.x](./docs/guides/core/inventory.md#upgrading-from-1x). Deploying on AWS Lambda? See [Bundle Size & Memory](./docs/guides/deployment/lambda-bundle-size.md).

## Installation

This package is published on [JSR](https://jsr.io/@bates-solutions/squareup).

```bash
# npm / pnpm / yarn (via JSR's npm compatibility)
npx jsr add @bates-solutions/squareup

# Deno
deno add jsr:@bates-solutions/squareup
```

Then install the Square SDK, which is a peer dependency:

```bash
npm install square
```

> Previously published on npm as `@bates-solutions/squareup`; that package is
> deprecated in favor of JSR.

### TypeScript module resolution

JSR's npm tarball ships with `exports` only (no legacy `main`/`types`). Set your
`tsconfig.json` to a modern resolver so both entry points resolve:

```jsonc
{
  "compilerOptions": {
    // "Bundler" or "Node16"/"NodeNext" — the legacy "Node" (node10) resolver
    // cannot read the "exports" map and will report TS2307 for both `.` and `./server`.
    "moduleResolution": "Bundler"
  }
}
```

### Importing the server webhook helpers

`@bates-solutions/squareup/server` re-exports every helper — signature
verification, the typed dispatcher, and the Express, Next.js, and Lambda
adapters. Framework adapters are **also** available as their own subpaths, so a
Lambda or Next.js app never pulls Express's types (or vice versa):

```ts
import { createLambdaWebhookHandler } from '@bates-solutions/squareup/server/lambda';
import { createNextWebhookHandler }   from '@bates-solutions/squareup/server/nextjs';
import { createExpressWebhookHandler } from '@bates-solutions/squareup/server/express';
```

## Quick Start

### Basic Usage

```typescript
import { createSquareClient } from '@bates-solutions/squareup';

const client = createSquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: 'sandbox',
});

// Process a payment
const payment = await client.payments.create({
  sourceId: 'cnon:card-nonce',
  amount: 1000, // $10.00
  currency: 'USD',
});

// Create an order with the fluent builder
const order = await client.orders.create(
  client.orders
    .builder()
    .addItem({ name: 'Coffee', quantity: 2, amount: 450 })
    .addItem({ name: 'Muffin', quantity: 1, amount: 350 })
    .build()
);

// Search recent completed orders
const { data: orders } = await client.orders.searchRecent({
  states: ['COMPLETED'],
  since: new Date(Date.now() - 60 * 60 * 1000), // last hour
});

// Manage customers
const customer = await client.customers.create({
  givenName: 'John',
  familyName: 'Doe',
  emailAddress: 'john@example.com',
});

// List customers with pagination
const page1 = await client.customers.list({ limit: 50 });
const page2 = await client.customers.list({ cursor: page1.cursor, limit: 50 });

// List customers sorted by creation time, newest first
const recent = await client.customers.list({ sortField: 'CREATED_AT', sortOrder: 'DESC' });

// Search customers by name, email, company, or city
const results = await client.customers.search({ query: 'john doe' });
```

### Webhook Handling (Express)

```typescript
import express from 'express';
import { createWebhookHandler, rawBodyMiddleware } from '@bates-solutions/squareup/server';

const app = express();

// Use raw body middleware before JSON parsing for webhook routes
app.use('/webhooks/square', rawBodyMiddleware);
app.use(express.json());

const webhookHandler = createWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
});

app.post('/webhooks/square', (req, res) => {
  const event = webhookHandler.verifyAndParse(req);

  switch (event.type) {
    case 'payment.completed':
      console.log('Payment completed:', event.data);
      break;
    case 'order.created':
      console.log('Order created:', event.data);
      break;
  }

  res.sendStatus(200);
});
```

### Webhook Handling (Next.js)

```typescript
// app/api/webhooks/square/route.ts
import { createWebhookHandler } from '@bates-solutions/squareup/server';

const webhookHandler = createWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-square-hmacsha256-signature')!;

  const event = webhookHandler.verifyAndParse(body, signature);

  // Handle the event
  console.log('Received event:', event.type);

  return new Response('OK', { status: 200 });
}
```

### Typed Webhook Payloads

```typescript
import type { PaymentWebhookEvent } from '@bates-solutions/squareup/server';
import { getOrderId, getCustomerId } from '@bates-solutions/squareup/server';

// Cast to typed event for full payload types — no `as any` needed
const event = webhookHandler.verifyAndParse(req) as PaymentWebhookEvent;
const payment = event.data.object.payment;
console.log(payment.status, payment.amount_money);

// Or use helpers to extract entity IDs from any event type
const orderId = getOrderId(event);     // works on payment, order, and refund events
const customerId = getCustomerId(event); // works on payment and customer events
```

### Webhook Handling (AWS Lambda)

```typescript
import { createLambdaWebhookHandler } from '@bates-solutions/squareup/server';

export const handler = createLambdaWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
  handlers: {
    'payment.completed': async (event, context) => {
      // context.orderId, context.customerId auto-extracted
      await processPayment(event.data.id, context.orderId!);
    },
  },
});
```

## Available Services

| Service          | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| `payments`       | Process and manage payments                                    |
| `orders`         | Create and manage orders, incl. DRAFT templates for subscriptions |
| `customers`      | Customer management                                            |
| `customerGroups` | Customer groups + group membership (gates pricing rules)       |
| `catalog`        | Product catalog ops, incl. pricing rules and wholesale pricing |
| `inventory`      | Stock counts, adjustments and transfers between locations      |
| `subscriptions`  | Subscription management, incl. phases backed by order templates |
| `invoices`       | Invoice operations                                             |
| `loyalty`        | Loyalty program management                                     |
| `checkout`       | Hosted checkout sessions                                       |
| `giftCards`      | Gift card lifecycle (issue, activate, load, redeem, deactivate) + activities |
| `locations`      | List/get merchant locations (derive currency, country, status) |
| `oauth`          | Token status for the client's access token (`tokenStatus()`). Code exchange, refresh and revoke are on `createSquareOAuthClient` |
| `webhooks`       | Webhook subscription management (`webhooks.subscriptions`: create/list/update/delete/test/rotate key) |

## Error Handling

Every call throws a typed `SquareError` subclass: `SquareValidationError`, `SquareAuthError`, `SquarePaymentError`, `SquareApiError`, or `SquareNetworkError` when no response arrived (connection failure or timeout). `isRetryableSquareError(error)` tells you whether a retry could succeed. When retrying a mutating call, pass the same `idempotencyKey`. See [Errors and Retries](./docs/guides/core/errors.md).

## Utilities

```typescript
import { toCents, fromCents, formatMoney } from '@bates-solutions/squareup';

toCents(10.99);           // 1099
fromCents(1099);          // 10.99
formatMoney(1099, 'USD'); // "$10.99"
```

## Related libraries

This library is one of three sibling payment-API wrappers from Bates Solutions that deliberately share the same design — learn one and you know all three:

| Library | Wraps | Install (JSR) | Source |
| --- | --- | --- | --- |
| [`@bates-solutions/stripe`](https://jsr.io/@bates-solutions/stripe) | Stripe | `jsr:@bates-solutions/stripe` | [GitHub](https://github.com/Bates-Solutions/stripe) |
| **[`@bates-solutions/squareup`](https://jsr.io/@bates-solutions/squareup)** _(this package)_ | Square | `jsr:@bates-solutions/squareup` | [GitHub](https://github.com/Bates-Solutions/squareup) |
| [`@bates-solutions/clover`](https://jsr.io/@bates-solutions/clover) | Clover | `jsr:@bates-solutions/clover` | [GitHub](https://github.com/Bates-Solutions/clover) |

### How they're related

All three follow one architecture, so the mental model transfers directly:

- **Same client shape** — a `create<Vendor>Client({ ... })` factory returns a client exposing one readonly service per API domain (e.g. `client.customers`, `client.payments`).
- **One service class per domain** (`src/core/services/<name>.service.ts`): input validation throws a `<Vendor>ValidationError`, every API call is wrapped `try/catch → parse<Vendor>Error`, mutating calls accept an `idempotencyKey`, and money is passed as integer minor units.
- **Normalized error hierarchy** — a `<Vendor>Error` base with `…ApiError` / `…AuthError` / `…PaymentError` / `…ValidationError` subclasses and a single `parse<Vendor>Error` mapper.
- **Standalone `./server` webhook module** — signature verification plus a typed handler-map dispatch, with adapters for **Express** and **AWS Lambda** (plus **Next.js** on stripe & squareup, and a framework-neutral **Web/edge** handler on stripe & clover).
- **ESM + TypeScript source**, dual subpath exports (`.` for the client, `./server` for webhooks), Vitest tests against mocked I/O, and published to **JSR** via GitHub OIDC.

The differences are only where the underlying platform forces them:

- **stripe** wraps the official [`stripe`](https://www.npmjs.com/package/stripe) SDK (a peer dependency) and verifies webhooks with WebCrypto, so `./server` also runs on edge runtimes (Deno, Cloudflare Workers, Supabase Edge Functions).
- **squareup** wraps the official [`square`](https://www.npmjs.com/package/square) SDK (a peer dependency) and verifies webhooks with Node's `crypto`.
- **clover** ships no vendor SDK — it calls Clover over a small fetch-based REST client that targets both Clover hosts (Ecommerce and Platform) — and verifies webhooks with WebCrypto (edge-ready).

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT - see [LICENSE](./LICENSE) for details.
