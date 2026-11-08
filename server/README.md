[**@bates-solutions/squareup API Reference v2.4.0**](../README.md)

***

[@bates-solutions/squareup API Reference](../README.md) / server

# server

`@bates-solutions/squareup/server` — webhook helpers for the Square wrapper.

Server utilities for handling Square webhooks: signature verification plus a
typed handler-map dispatch, with adapters for Express, Next.js, and AWS Lambda.

## Examples

```typescript
// Next.js App Router
import { createNextWebhookHandler } from '@bates-solutions/squareup/server';

export const POST = createNextWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  handlers: {
    'payment.created': async (event) => {
      console.log('Payment:', event.data.id);
    },
  },
});
```

```typescript
// Express
import express from 'express';
import { createExpressWebhookHandler } from '@bates-solutions/squareup/server';

const app = express();
app.use('/webhook', express.raw({ type: 'application/json' }));
app.post('/webhook', createExpressWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  handlers: {
    'payment.created': async (event) => {
      console.log('Payment:', event.data.id);
    },
  },
}));
```

## Interfaces

- [CustomerWebhookObject](interfaces/CustomerWebhookObject.md)
- [ExpressRequestLike](interfaces/ExpressRequestLike.md)
- [ExpressResponseLike](interfaces/ExpressResponseLike.md)
- [ExpressWebhookOptions](interfaces/ExpressWebhookOptions.md)
- [LambdaProxyEvent](interfaces/LambdaProxyEvent.md)
- [LambdaProxyResult](interfaces/LambdaProxyResult.md)
- [LambdaWebhookConfig](interfaces/LambdaWebhookConfig.md)
- [OrderWebhookObject](interfaces/OrderWebhookObject.md)
- [ParsedWebhookRequest](interfaces/ParsedWebhookRequest.md)
- [PaymentWebhookObject](interfaces/PaymentWebhookObject.md)
- [RefundWebhookObject](interfaces/RefundWebhookObject.md)
- [SquareWebhookRequest](interfaces/SquareWebhookRequest.md)
- [WebhookConfig](interfaces/WebhookConfig.md)
- [WebhookEvent](interfaces/WebhookEvent.md)
- [WebhookEventContext](interfaces/WebhookEventContext.md)
- [WebhookLogger](interfaces/WebhookLogger.md)
- [WebhookResponse](interfaces/WebhookResponse.md)
- [WebhookVerificationResult](interfaces/WebhookVerificationResult.md)

## Type Aliases

- [CatalogEventType](type-aliases/CatalogEventType.md)
- [CustomerEventType](type-aliases/CustomerEventType.md)
- [CustomerWebhookEvent](type-aliases/CustomerWebhookEvent.md)
- [ExpressNextFunction](type-aliases/ExpressNextFunction.md)
- [ExpressRequestHandler](type-aliases/ExpressRequestHandler.md)
- [InventoryEventType](type-aliases/InventoryEventType.md)
- [InvoiceEventType](type-aliases/InvoiceEventType.md)
- [LaborEventType](type-aliases/LaborEventType.md)
- [LambdaWebhookHandler](type-aliases/LambdaWebhookHandler.md)
- [LambdaWebhookHandlers](type-aliases/LambdaWebhookHandlers.md)
- [LoyaltyEventType](type-aliases/LoyaltyEventType.md)
- [OrderEventType](type-aliases/OrderEventType.md)
- [OrderWebhookEvent](type-aliases/OrderWebhookEvent.md)
- [PaymentEventType](type-aliases/PaymentEventType.md)
- [PaymentWebhookEvent](type-aliases/PaymentWebhookEvent.md)
- [RefundEventType](type-aliases/RefundEventType.md)
- [RefundWebhookEvent](type-aliases/RefundWebhookEvent.md)
- [SubscriptionEventType](type-aliases/SubscriptionEventType.md)
- [TeamEventType](type-aliases/TeamEventType.md)
- [WebhookEventType](type-aliases/WebhookEventType.md)
- [WebhookHandler](type-aliases/WebhookHandler.md)
- [WebhookHandlers](type-aliases/WebhookHandlers.md)

## Variables

- [rawBodyMiddleware](variables/rawBodyMiddleware.md)
- [SIGNATURE\_HEADER](variables/SIGNATURE_HEADER.md)

## Functions

- [createExpressWebhookHandler](functions/createExpressWebhookHandler.md)
- [createLambdaWebhookHandler](functions/createLambdaWebhookHandler.md)
- [createNextPagesWebhookHandler](functions/createNextPagesWebhookHandler.md)
- [createNextWebhookHandler](functions/createNextWebhookHandler.md)
- [createWebhookProcessor](functions/createWebhookProcessor.md)
- [getCustomerId](functions/getCustomerId.md)
- [getOrderId](functions/getOrderId.md)
- [getPaymentId](functions/getPaymentId.md)
- [parseAndVerifyWebhook](functions/parseAndVerifyWebhook.md)
- [parseNextWebhook](functions/parseNextWebhook.md)
- [parseWebhookEvent](functions/parseWebhookEvent.md)
- [processWebhookEvent](functions/processWebhookEvent.md)
- [verifySignature](functions/verifySignature.md)
