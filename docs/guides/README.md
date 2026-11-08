# Guides

Comprehensive tutorials and examples for `@bates-solutions/squareup`.

## Core

Backend API integration guides:

- [Processing Payments](./core/payments.md) - Create, capture, and cancel payments
- [Managing Orders](./core/orders.md) - Order builder and order lifecycle
- [Managing Customers](./core/customers.md) - Customer CRUD and search
- [Managing the Catalog](./core/catalog.md) - Items, categories, and variations
- [Customer Groups](./core/customer-groups.md) - Customer groups for wholesale tiers and member pricing
- [Checkout & Payment Links](./core/checkout.md) - Create hosted checkout pages
- [Subscriptions](./core/subscriptions.md) - Recurring billing (flat-rate and product-driven via order templates)
- [Invoices](./core/invoices.md) - Create/update invoices, incl. accepted payment methods
- [Gift Cards](./core/gift-cards.md) - Gift card lifecycle: issue, activate, load, redeem, link to customers
- [Locations](./core/locations.md) - List/get merchant locations; derive currency, country, status
- [Inventory](./core/inventory.md) - Stock counts, adjustments, transfers; upgrading from 1.x
- [OAuth](./core/oauth.md) - Connect sellers' Square accounts: authorize URL, tokens, refresh, revoke
- [Errors and Retries](./core/errors.md) - Error classes, network failures, and retrying safely

## Server

Backend webhook handling:

- [Webhook Handling](./server/webhooks.md) - Signature verification and event handling
- [Webhook Subscriptions](./server/webhook-subscriptions.md) - Manage subscriptions (create/list/update/delete/test/rotate key)
- [Framework Middleware](./server/middleware.md) - Web/edge (Deno, Workers, Bun), Express, Next.js and Lambda integration

## Deployment

- [Bundle Size & Memory on AWS Lambda](./deployment/lambda-bundle-size.md) - `--external:square`, memory sizing, why RSS is upstream

## Quick Start

### 1. Install

```bash
npx jsr add @bates-solutions/squareup   # or: deno add jsr:@bates-solutions/squareup
npm install square                        # peer dependency
```

### 2. Backend Setup

```typescript
import { createSquareClient } from '@bates-solutions/squareup';

const square = createSquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: 'sandbox',
  locationId: 'YOUR_LOCATION_ID',
});

// Create a payment
const payment = await square.payments.create({
  sourceId: 'cnon:card-nonce-ok',
  amount: 1000,
});
```

### 3. Webhook Setup

```typescript
// Express
import { createExpressWebhookHandler } from '@bates-solutions/squareup/server';

app.post('/webhook', createExpressWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  handlers: {
    'payment.created': async (event) => {
      console.log('Payment:', event.data.id);
    },
  },
}));
```

## API Reference

For detailed API documentation, see [API Reference](../api-reference.md).
