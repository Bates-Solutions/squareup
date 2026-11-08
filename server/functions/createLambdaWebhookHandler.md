[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / createLambdaWebhookHandler

# Function: createLambdaWebhookHandler()

> **createLambdaWebhookHandler**(`config`): (`proxyEvent`) => `Promise`\<[`LambdaProxyResult`](../interfaces/LambdaProxyResult.md)\>

Defined in: [server/middleware/lambda.ts:126](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L126)

Create an AWS Lambda handler for Square webhooks

Handles CORS preflight, signature verification, event parsing,
routing to handlers, and entity ID extraction.

## Parameters

### config

[`LambdaWebhookConfig`](../interfaces/LambdaWebhookConfig.md)

Lambda webhook configuration

## Returns

Lambda handler function

(`proxyEvent`) => `Promise`\<[`LambdaProxyResult`](../interfaces/LambdaProxyResult.md)\>

## Example

```typescript
import { createLambdaWebhookHandler } from '@bates-solutions/squareup/server';

export const handler = createLambdaWebhookHandler({
  signatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
  handlers: {
    'payment.completed': async (event, context) => {
      await processPayment(event.data.id, context.orderId);
    },
  },
});
```
