[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / WebhookSubscriptionsService

# Class: WebhookSubscriptionsService

Defined in: [core/services/webhook-subscriptions.service.ts:84](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L84)

Manage Square webhook subscriptions (create / list / get / update / delete /
test / rotate signature key). Exposed as `square.webhooks.subscriptions`.

## Example

```typescript
// Idempotent create: list first, don't duplicate by URL
const { data } = await square.webhooks.subscriptions.list();
const existing = data.find((s) => s.notificationUrl === url);

const created = await square.webhooks.subscriptions.create({
  name: 'platform-order-events',
  eventTypes: ['payment.updated', 'order.updated', 'refund.updated'],
  notificationUrl: url,
});
created.signatureKey; // present here ONLY — persist it now
```

## Constructors

### Constructor

> **new WebhookSubscriptionsService**(`client`): `WebhookSubscriptionsService`

Defined in: [core/services/webhook-subscriptions.service.ts:85](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L85)

#### Parameters

##### client

`SquareClient`

#### Returns

`WebhookSubscriptionsService`

## Methods

### create()

> **create**(`options`): `Promise`\<[`CreatedWebhookSubscription`](../type-aliases/CreatedWebhookSubscription.md)\>

Defined in: [core/services/webhook-subscriptions.service.ts:95](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L95)

Create a webhook subscription.

#### Parameters

##### options

[`CreateWebhookSubscriptionOptions`](../interfaces/CreateWebhookSubscriptionOptions.md)

#### Returns

`Promise`\<[`CreatedWebhookSubscription`](../type-aliases/CreatedWebhookSubscription.md)\>

The created subscription, **including its `signatureKey`** — which
Square returns only here. Persist it immediately.

#### Throws

When required fields are missing

***

### delete()

> **delete**(`subscriptionId`): `Promise`\<`void`\>

Defined in: [core/services/webhook-subscriptions.service.ts:205](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L205)

Delete a webhook subscription.

#### Parameters

##### subscriptionId

`string`

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`subscriptionId`): `Promise`\<[`WebhookSubscription`](../type-aliases/WebhookSubscription.md)\>

Defined in: [core/services/webhook-subscriptions.service.ts:158](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L158)

Get a webhook subscription by ID. The result never includes `signatureKey`.

#### Parameters

##### subscriptionId

`string`

#### Returns

`Promise`\<[`WebhookSubscription`](../type-aliases/WebhookSubscription.md)\>

***

### list()

> **list**(`options?`): `Promise`\<\{ `cursor?`: `string`; `data`: [`WebhookSubscription`](../type-aliases/WebhookSubscription.md)[]; \}\>

Defined in: [core/services/webhook-subscriptions.service.ts:133](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L133)

List webhook subscriptions with cursor-based pagination.

#### Parameters

##### options?

[`ListWebhookSubscriptionsOptions`](../interfaces/ListWebhookSubscriptionsOptions.md)

#### Returns

`Promise`\<\{ `cursor?`: `string`; `data`: [`WebhookSubscription`](../type-aliases/WebhookSubscription.md)[]; \}\>

***

### rotateSignatureKey()

> **rotateSignatureKey**(`subscriptionId`, `options?`): `Promise`\<\{ `signatureKey?`: `string`; \}\>

Defined in: [core/services/webhook-subscriptions.service.ts:253](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L253)

Rotate a subscription's signature key, returning a **new** key.

Useful when the original key (returned only from [create](#create)) wasn't
persisted — rotate to obtain a usable key without deleting/recreating the
subscription. Rotating invalidates the previous key, so deploy the new key
before Square signs the next delivery with it.

#### Parameters

##### subscriptionId

`string`

##### options?

###### idempotencyKey?

`string`

#### Returns

`Promise`\<\{ `signatureKey?`: `string`; \}\>

***

### test()

> **test**(`subscriptionId`, `options?`): `Promise`\<`SubscriptionTestResult`\>

Defined in: [core/services/webhook-subscriptions.service.ts:219](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L219)

Send a test event to a subscription to verify the endpoint.

#### Parameters

##### subscriptionId

`string`

Subscription to test

##### options?

Optional specific event type to send

###### eventType?

`string`

#### Returns

`Promise`\<`SubscriptionTestResult`\>

***

### update()

> **update**(`subscriptionId`, `options`): `Promise`\<[`WebhookSubscription`](../type-aliases/WebhookSubscription.md)\>

Defined in: [core/services/webhook-subscriptions.service.ts:176](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L176)

Update a webhook subscription (name, URL, event set, or enabled state).

#### Parameters

##### subscriptionId

`string`

##### options

[`UpdateWebhookSubscriptionOptions`](../interfaces/UpdateWebhookSubscriptionOptions.md)

#### Returns

`Promise`\<[`WebhookSubscription`](../type-aliases/WebhookSubscription.md)\>
