[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / SubscriptionsService

# Class: SubscriptionsService

Defined in: [core/services/subscriptions.service.ts:144](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/subscriptions.service.ts#L144)

Subscriptions service for managing Square subscriptions

## Example

```typescript
// Create a subscription
const subscription = await square.subscriptions.create({
  customerId: 'CUST_123',
  planVariationId: 'PLAN_VAR_123',
});

// Cancel a subscription
await square.subscriptions.cancel('SUB_123');
```

## Constructors

### Constructor

> **new SubscriptionsService**(`client`, `defaultLocationId?`, `defaultCurrency?`): `SubscriptionsService`

Defined in: [core/services/subscriptions.service.ts:145](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/subscriptions.service.ts#L145)

#### Parameters

##### client

`SquareClient`

##### defaultLocationId?

`string`

##### defaultCurrency?

`"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"`

#### Returns

`SubscriptionsService`

## Methods

### cancel()

> **cancel**(`subscriptionId`): `Promise`\<[`Subscription`](../interfaces/Subscription.md)\>

Defined in: [core/services/subscriptions.service.ts:316](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/subscriptions.service.ts#L316)

Cancel a subscription

#### Parameters

##### subscriptionId

`string`

Subscription ID to cancel

#### Returns

`Promise`\<[`Subscription`](../interfaces/Subscription.md)\>

Cancelled subscription

#### Example

```typescript
const subscription = await square.subscriptions.cancel('SUB_123');
```

***

### create()

> **create**(`options`): `Promise`\<[`Subscription`](../interfaces/Subscription.md)\>

Defined in: [core/services/subscriptions.service.ts:166](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/subscriptions.service.ts#L166)

Create a new subscription

#### Parameters

##### options

[`CreateSubscriptionOptions`](../interfaces/CreateSubscriptionOptions.md)

Subscription creation options

#### Returns

`Promise`\<[`Subscription`](../interfaces/Subscription.md)\>

Created subscription

#### Example

```typescript
const subscription = await square.subscriptions.create({
  customerId: 'CUST_123',
  planVariationId: 'PLAN_VAR_123',
  startDate: '2024-02-01',
});
```

***

### get()

> **get**(`subscriptionId`): `Promise`\<[`Subscription`](../interfaces/Subscription.md)\>

Defined in: [core/services/subscriptions.service.ts:242](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/subscriptions.service.ts#L242)

Get a subscription by ID

#### Parameters

##### subscriptionId

`string`

Subscription ID

#### Returns

`Promise`\<[`Subscription`](../interfaces/Subscription.md)\>

Subscription details

#### Example

```typescript
const subscription = await square.subscriptions.get('SUB_123');
```

***

### pause()

> **pause**(`subscriptionId`, `options?`): `Promise`\<[`Subscription`](../interfaces/Subscription.md)\>

Defined in: [core/services/subscriptions.service.ts:345](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/subscriptions.service.ts#L345)

Pause a subscription

#### Parameters

##### subscriptionId

`string`

Subscription ID to pause

##### options?

Pause options

###### pauseCycleDuration?

`number`

###### pauseEffectiveDate?

`string`

#### Returns

`Promise`\<[`Subscription`](../interfaces/Subscription.md)\>

Paused subscription

#### Example

```typescript
const subscription = await square.subscriptions.pause('SUB_123', {
  pauseEffectiveDate: '2024-03-01',
});
```

***

### resume()

> **resume**(`subscriptionId`, `resumeEffectiveDate?`): `Promise`\<[`Subscription`](../interfaces/Subscription.md)\>

Defined in: [core/services/subscriptions.service.ts:384](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/subscriptions.service.ts#L384)

Resume a paused subscription

#### Parameters

##### subscriptionId

`string`

Subscription ID to resume

##### resumeEffectiveDate?

`string`

Optional date to resume

#### Returns

`Promise`\<[`Subscription`](../interfaces/Subscription.md)\>

Resumed subscription

#### Example

```typescript
const subscription = await square.subscriptions.resume('SUB_123');
```

***

### search()

> **search**(`options?`): `Promise`\<\{ `cursor?`: `string`; `data`: [`Subscription`](../interfaces/Subscription.md)[]; \}\>

Defined in: [core/services/subscriptions.service.ts:415](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/subscriptions.service.ts#L415)

Search for subscriptions

#### Parameters

##### options?

Search options

###### cursor?

`string`

###### customerId?

`string`

###### limit?

`number`

###### locationIds?

`string`[]

#### Returns

`Promise`\<\{ `cursor?`: `string`; `data`: [`Subscription`](../interfaces/Subscription.md)[]; \}\>

Matching subscriptions with pagination

#### Example

```typescript
const results = await square.subscriptions.search({
  customerId: 'CUST_123',
});
```

***

### update()

> **update**(`subscriptionId`, `options`): `Promise`\<[`Subscription`](../interfaces/Subscription.md)\>

Defined in: [core/services/subscriptions.service.ts:271](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/subscriptions.service.ts#L271)

Update a subscription

#### Parameters

##### subscriptionId

`string`

Subscription ID

##### options

Update options

###### cardId?

`string`

###### priceOverride?

`number`

###### taxPercentage?

`string`

#### Returns

`Promise`\<[`Subscription`](../interfaces/Subscription.md)\>

Updated subscription

#### Example

```typescript
const subscription = await square.subscriptions.update('SUB_123', {
  priceOverride: 1500,
});
```
