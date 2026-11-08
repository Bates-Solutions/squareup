[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / createWebhookProcessor

# Function: createWebhookProcessor()

> **createWebhookProcessor**(`config`): (`rawBody`, `signature`) => `Promise`\<\{ `error?`: `string`; `event?`: [`WebhookEvent`](../interfaces/WebhookEvent.md)\<`unknown`\>; `success`: `boolean`; \}\>

Defined in: [server/webhook.ts:155](https://github.com/Bates-Solutions/squareup/blob/main/src/server/webhook.ts#L155)

Create a webhook handler function that verifies and processes events

## Parameters

### config

[`WebhookConfig`](../interfaces/WebhookConfig.md)

Webhook configuration

## Returns

Handler function that processes raw webhook requests

(`rawBody`, `signature`) => `Promise`\<\{ `error?`: `string`; `event?`: [`WebhookEvent`](../interfaces/WebhookEvent.md)\<`unknown`\>; `success`: `boolean`; \}\>

## Example

```typescript
const handleWebhook = createWebhookProcessor({
  signatureKey: process.env.SQUARE_WEBHOOK_KEY!,
  handlers: {
    'payment.created': async (event) => {
      await sendReceipt(event.data.object.payment);
    },
    'order.updated': async (event) => {
      await updateOrderStatus(event.data.object.order);
    },
  },
});

// Use in your route handler
const result = await handleWebhook(rawBody, signature);
```
