[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / createExpressWebhookHandler

# Function: createExpressWebhookHandler()

> **createExpressWebhookHandler**(`config`): [`ExpressRequestHandler`](../type-aliases/ExpressRequestHandler.md)

Defined in: [server/middleware/express.ts:113](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/express.ts#L113)

Create Express middleware for handling Square webhooks

This middleware:
1. Captures the raw body for signature verification
2. Verifies the webhook signature
3. Parses the event and attaches it to the request
4. Calls the appropriate handler

## Parameters

### config

[`ExpressWebhookOptions`](../interfaces/ExpressWebhookOptions.md)

Webhook configuration

## Returns

[`ExpressRequestHandler`](../type-aliases/ExpressRequestHandler.md)

Express middleware function

## Example

```typescript
import express from 'express';
import { createExpressWebhookHandler } from '@bates-solutions/squareup/server';

const app = express();

// IMPORTANT: Use raw body parser for webhook route
app.use('/webhook', express.raw({ type: 'application/json' }));

app.post('/webhook', createExpressWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  handlers: {
    'payment.created': async (event) => {
      console.log('Payment created:', event.data.id);
    },
  },
}));
```
