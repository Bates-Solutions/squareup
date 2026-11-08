[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / CreateWebhookSubscriptionOptions

# Interface: CreateWebhookSubscriptionOptions

Defined in: [core/services/webhook-subscriptions.service.ts:31](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L31)

Options for creating a webhook subscription.

## Properties

### apiVersion?

> `optional` **apiVersion?**: `string`

Defined in: [core/services/webhook-subscriptions.service.ts:39](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L39)

Square API version used to serialize events (defaults to the app's version)

***

### enabled?

> `optional` **enabled?**: `boolean`

Defined in: [core/services/webhook-subscriptions.service.ts:41](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L41)

Whether the subscription is enabled (default `true`)

***

### eventTypes

> **eventTypes**: `string`[]

Defined in: [core/services/webhook-subscriptions.service.ts:35](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L35)

Event types to subscribe to, e.g. `['payment.updated', 'order.updated']`

***

### idempotencyKey?

> `optional` **idempotencyKey?**: `string`

Defined in: [core/services/webhook-subscriptions.service.ts:42](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L42)

***

### name

> **name**: `string`

Defined in: [core/services/webhook-subscriptions.service.ts:33](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L33)

A name for the subscription

***

### notificationUrl

> **notificationUrl**: `string`

Defined in: [core/services/webhook-subscriptions.service.ts:37](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L37)

The URL Square will POST events to
