[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / GiftCardsService

# Class: GiftCardsService

Defined in: [core/services/gift-cards.service.ts:391](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L391)

Service for managing Square gift cards — issuance, lookup, customer linking.

Activities (activate, load, redeem, deactivate, etc.) are accessed via
`square.giftCards.activities`. Convenience helpers (`activate`, `load`,
`redeem`, `deactivate`) are also exposed directly on this service for the
common cases.

## Example

```typescript
// Issue a digital card and activate it with $25
const card = await square.giftCards.create({ type: 'DIGITAL' });
await square.giftCards.activate(card.id!, 2500);
```

## Constructors

### Constructor

> **new GiftCardsService**(`client`, `defaultLocationId?`, `defaultCurrency?`): `GiftCardsService`

Defined in: [core/services/gift-cards.service.ts:394](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L394)

#### Parameters

##### client

`SquareClient`

##### defaultLocationId?

`string`

##### defaultCurrency?

`"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"`

#### Returns

`GiftCardsService`

## Properties

### activities

> `readonly` **activities**: [`GiftCardActivitiesService`](GiftCardActivitiesService.md)

Defined in: [core/services/gift-cards.service.ts:392](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L392)

## Methods

### activate()

> **activate**(`giftCardId`, `amount`, `options?`): `Promise`\<[`GiftCardActivity`](../interfaces/GiftCardActivity.md)\>

Defined in: [core/services/gift-cards.service.ts:596](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L596)

Activate a `PENDING` gift card with an initial balance. Convenience
wrapper over `activities.create({ type: 'ACTIVATE' })`.

#### Parameters

##### giftCardId

`string`

##### amount

`number` \| `bigint`

##### options?

###### currency?

`"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"`

###### idempotencyKey?

`string`

###### lineItemUid?

`string`

###### locationId?

`string`

###### orderId?

`string`

###### referenceId?

`string`

#### Returns

`Promise`\<[`GiftCardActivity`](../interfaces/GiftCardActivity.md)\>

***

### create()

> **create**(`options`): `Promise`\<[`GiftCard`](../interfaces/GiftCard.md)\>

Defined in: [core/services/gift-cards.service.ts:409](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L409)

Create (issue) a new gift card.

New cards are created in `PENDING` state. Call `activate()` (or
`activities.create({ type: 'ACTIVATE' })`) to set an initial balance
before redemption.

#### Parameters

##### options

[`CreateGiftCardOptions`](../interfaces/CreateGiftCardOptions.md)

#### Returns

`Promise`\<[`GiftCard`](../interfaces/GiftCard.md)\>

***

### deactivate()

> **deactivate**(`giftCardId`, `reason?`, `options?`): `Promise`\<[`GiftCardActivity`](../interfaces/GiftCardActivity.md)\>

Defined in: [core/services/gift-cards.service.ts:683](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L683)

Deactivate a gift card permanently.

#### Parameters

##### giftCardId

`string`

##### reason?

[`GiftCardDeactivateReason`](../type-aliases/GiftCardDeactivateReason.md) = `'UNKNOWN_REASON'`

##### options?

###### idempotencyKey?

`string`

###### locationId?

`string`

#### Returns

`Promise`\<[`GiftCardActivity`](../interfaces/GiftCardActivity.md)\>

***

### get()

> **get**(`giftCardId`): `Promise`\<[`GiftCard`](../interfaces/GiftCard.md)\>

Defined in: [core/services/gift-cards.service.ts:448](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L448)

Get a gift card by ID.

#### Parameters

##### giftCardId

`string`

#### Returns

`Promise`\<[`GiftCard`](../interfaces/GiftCard.md)\>

***

### getFromGan()

> **getFromGan**(`gan`): `Promise`\<[`GiftCard`](../interfaces/GiftCard.md)\>

Defined in: [core/services/gift-cards.service.ts:466](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L466)

Get a gift card by GAN (gift card account number).

#### Parameters

##### gan

`string`

#### Returns

`Promise`\<[`GiftCard`](../interfaces/GiftCard.md)\>

***

### getFromNonce()

> **getFromNonce**(`nonce`): `Promise`\<[`GiftCard`](../interfaces/GiftCard.md)\>

Defined in: [core/services/gift-cards.service.ts:485](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L485)

Get a gift card from a payment-source nonce (e.g. produced by the
Square Web Payments SDK at checkout).

#### Parameters

##### nonce

`string`

#### Returns

`Promise`\<[`GiftCard`](../interfaces/GiftCard.md)\>

***

### linkCustomer()

> **linkCustomer**(`giftCardId`, `customerId`): `Promise`\<[`GiftCard`](../interfaces/GiftCard.md)\>

Defined in: [core/services/gift-cards.service.ts:539](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L539)

Link a gift card to a customer profile. Returns the updated card with the
customer ID added to `customerIds`.

#### Parameters

##### giftCardId

`string`

##### customerId

`string`

#### Returns

`Promise`\<[`GiftCard`](../interfaces/GiftCard.md)\>

***

### list()

> **list**(`options?`): `Promise`\<\{ `cursor?`: `string`; `giftCards`: [`GiftCard`](../interfaces/GiftCard.md)[]; \}\>

Defined in: [core/services/gift-cards.service.ts:503](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L503)

List gift cards, optionally filtered by type, state, or linked customer.

#### Parameters

##### options?

[`ListGiftCardsOptions`](../interfaces/ListGiftCardsOptions.md)

#### Returns

`Promise`\<\{ `cursor?`: `string`; `giftCards`: [`GiftCard`](../interfaces/GiftCard.md)[]; \}\>

***

### load()

> **load**(`giftCardId`, `amount`, `options?`): `Promise`\<[`GiftCardActivity`](../interfaces/GiftCardActivity.md)\>

Defined in: [core/services/gift-cards.service.ts:625](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L625)

Load (top up) an active gift card.

#### Parameters

##### giftCardId

`string`

##### amount

`number` \| `bigint`

##### options?

###### currency?

`"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"`

###### idempotencyKey?

`string`

###### lineItemUid?

`string`

###### locationId?

`string`

###### orderId?

`string`

###### referenceId?

`string`

#### Returns

`Promise`\<[`GiftCardActivity`](../interfaces/GiftCardActivity.md)\>

***

### redeem()

> **redeem**(`giftCardId`, `amount`, `options?`): `Promise`\<[`GiftCardActivity`](../interfaces/GiftCardActivity.md)\>

Defined in: [core/services/gift-cards.service.ts:656](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L656)

Redeem from a gift card (deduct funds). For payments processed through
the Square Payments API, Square creates the REDEEM activity automatically;
use this only with a custom payment processor.

#### Parameters

##### giftCardId

`string`

##### amount

`number` \| `bigint`

##### options?

###### currency?

`"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"`

###### idempotencyKey?

`string`

###### locationId?

`string`

###### paymentId?

`string`

###### referenceId?

`string`

#### Returns

`Promise`\<[`GiftCardActivity`](../interfaces/GiftCardActivity.md)\>

***

### search()

> **search**(`options?`): `Promise`\<\{ `cursor?`: `string`; `data`: [`GiftCard`](../interfaces/GiftCard.md)[]; \}\>

Defined in: [core/services/gift-cards.service.ts:528](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L528)

Alias for `list()`. Maintained for parity with the issue's proposed shape.

#### Parameters

##### options?

[`ListGiftCardsOptions`](../interfaces/ListGiftCardsOptions.md)

#### Returns

`Promise`\<\{ `cursor?`: `string`; `data`: [`GiftCard`](../interfaces/GiftCard.md)[]; \}\>

***

### unlinkCustomer()

> **unlinkCustomer**(`giftCardId`, `customerId`): `Promise`\<[`GiftCard`](../interfaces/GiftCard.md)\>

Defined in: [core/services/gift-cards.service.ts:567](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L567)

Unlink a customer from a gift card. Returns the updated card.

#### Parameters

##### giftCardId

`string`

##### customerId

`string`

#### Returns

`Promise`\<[`GiftCard`](../interfaces/GiftCard.md)\>
