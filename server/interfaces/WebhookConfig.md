[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / WebhookConfig

# Interface: WebhookConfig

Defined in: [server/types.ts:111](https://github.com/Bates-Solutions/squareup/blob/main/src/server/types.ts#L111)

Configuration for webhook handling

## Extended by

- [`ExpressWebhookOptions`](ExpressWebhookOptions.md)

## Properties

### handlers

> **handlers**: [`WebhookHandlers`](../type-aliases/WebhookHandlers.md)

Defined in: [server/types.ts:115](https://github.com/Bates-Solutions/squareup/blob/main/src/server/types.ts#L115)

Event handlers by type

***

### notificationUrl?

> `optional` **notificationUrl?**: `string`

Defined in: [server/types.ts:117](https://github.com/Bates-Solutions/squareup/blob/main/src/server/types.ts#L117)

URL where webhooks are received (for signature verification)

***

### signatureKey

> **signatureKey**: `string`

Defined in: [server/types.ts:113](https://github.com/Bates-Solutions/squareup/blob/main/src/server/types.ts#L113)

Square webhook signature key

***

### throwOnInvalidSignature?

> `optional` **throwOnInvalidSignature?**: `boolean`

Defined in: [server/types.ts:125](https://github.com/Bates-Solutions/squareup/blob/main/src/server/types.ts#L125)

How `createWebhookProcessor` reports an invalid signature. When `true`
(default) it throws (surfaced as `{ success: false, error }`); when `false`
it returns `{ success: false, error }` without throwing. Either way an
invalid signature is **never dispatched to handlers**.

#### Default

```ts
true
```
