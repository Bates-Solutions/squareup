[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / LambdaWebhookConfig

# Interface: LambdaWebhookConfig

Defined in: [server/middleware/lambda.ts:70](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L70)

Configuration for Lambda webhook handling

## Properties

### corsHeaders?

> `optional` **corsHeaders?**: `Record`\<`string`, `string`\>

Defined in: [server/middleware/lambda.ts:78](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L78)

Custom CORS headers (merged with defaults)

***

### handlers

> **handlers**: [`LambdaWebhookHandlers`](../type-aliases/LambdaWebhookHandlers.md)

Defined in: [server/middleware/lambda.ts:74](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L74)

Event handlers by type

***

### logger?

> `optional` **logger?**: `false` \| [`WebhookLogger`](WebhookLogger.md)

Defined in: [server/middleware/lambda.ts:80](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L80)

Logger instance (defaults to console)

***

### notificationUrl?

> `optional` **notificationUrl?**: `string`

Defined in: [server/middleware/lambda.ts:76](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L76)

URL where webhooks are received (for signature verification)

***

### onUnhandledEvent?

> `optional` **onUnhandledEvent?**: (`event`, `context`) => `void` \| `Promise`\<`void`\>

Defined in: [server/middleware/lambda.ts:82](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L82)

Callback for events with no registered handler

#### Parameters

##### event

[`WebhookEvent`](WebhookEvent.md)

##### context

[`WebhookEventContext`](WebhookEventContext.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### signatureKey

> **signatureKey**: `string`

Defined in: [server/middleware/lambda.ts:72](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L72)

Square webhook signature key
