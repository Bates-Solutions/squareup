[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / GiftCardActivitiesService

# Class: GiftCardActivitiesService

Defined in: [core/services/gift-cards.service.ts:256](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L256)

Service for managing gift card activities (the Gift Card Activities API).

Activities mutate a card's balance and lifecycle state — `ACTIVATE` puts an
initial balance on a `PENDING` card, `LOAD` tops it up, `REDEEM` deducts at
checkout, `DEACTIVATE` retires the card.

Accessed via `square.giftCards.activities`.

## Example

```typescript
await square.giftCards.activities.create({
  type: 'LOAD',
  giftCardId: 'gftc:abc',
  loadActivityDetails: {
    amountMoney: { amount: 1000, currency: 'USD' },
  },
});
```

## Constructors

### Constructor

> **new GiftCardActivitiesService**(`client`, `defaultLocationId?`): `GiftCardActivitiesService`

Defined in: [core/services/gift-cards.service.ts:257](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L257)

#### Parameters

##### client

`SquareClient`

##### defaultLocationId?

`string`

#### Returns

`GiftCardActivitiesService`

## Methods

### create()

> **create**(`options`): `Promise`\<[`GiftCardActivity`](../interfaces/GiftCardActivity.md)\>

Defined in: [core/services/gift-cards.service.ts:269](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L269)

Create a gift card activity.

Idempotency keys are required by Square — auto-generated when omitted.
Always pass a stable key for retries to avoid double-applying activities
(a duplicate REDEEM would double-deduct the card).

#### Parameters

##### options

[`CreateGiftCardActivityOptions`](../interfaces/CreateGiftCardActivityOptions.md)

#### Returns

`Promise`\<[`GiftCardActivity`](../interfaces/GiftCardActivity.md)\>

***

### list()

> **list**(`options?`): `Promise`\<\{ `activities`: [`GiftCardActivity`](../interfaces/GiftCardActivity.md)[]; `cursor?`: `string`; \}\>

Defined in: [core/services/gift-cards.service.ts:350](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L350)

List gift card activities, optionally filtered by card, type, location,
or time range.

#### Parameters

##### options?

[`ListGiftCardActivitiesOptions`](../interfaces/ListGiftCardActivitiesOptions.md)

#### Returns

`Promise`\<\{ `activities`: [`GiftCardActivity`](../interfaces/GiftCardActivity.md)[]; `cursor?`: `string`; \}\>
