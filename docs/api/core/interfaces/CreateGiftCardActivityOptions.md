[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / CreateGiftCardActivityOptions

# Interface: CreateGiftCardActivityOptions

Defined in: [core/services/gift-cards.service.ts:190](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L190)

Options for creating a gift card activity.

Specify exactly one of `giftCardId` or `giftCardGan` to identify the card.
Provide the corresponding `*ActivityDetails` field for the chosen `type`
(e.g. `activateActivityDetails` for `'ACTIVATE'`).

## Properties

### activateActivityDetails?

> `optional` **activateActivityDetails?**: [`ActivateActivityDetails`](ActivateActivityDetails.md)

Defined in: [core/services/gift-cards.service.ts:199](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L199)

***

### adjustDecrementActivityDetails?

> `optional` **adjustDecrementActivityDetails?**: [`AdjustDecrementActivityDetails`](AdjustDecrementActivityDetails.md)

Defined in: [core/services/gift-cards.service.ts:205](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L205)

***

### adjustIncrementActivityDetails?

> `optional` **adjustIncrementActivityDetails?**: [`AdjustIncrementActivityDetails`](AdjustIncrementActivityDetails.md)

Defined in: [core/services/gift-cards.service.ts:204](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L204)

***

### clearBalanceActivityDetails?

> `optional` **clearBalanceActivityDetails?**: `object`

Defined in: [core/services/gift-cards.service.ts:202](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L202)

#### reason?

> `optional` **reason?**: `string`

***

### deactivateActivityDetails?

> `optional` **deactivateActivityDetails?**: `object`

Defined in: [core/services/gift-cards.service.ts:203](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L203)

#### reason?

> `optional` **reason?**: [`GiftCardDeactivateReason`](../type-aliases/GiftCardDeactivateReason.md)

***

### giftCardGan?

> `optional` **giftCardGan?**: `string`

Defined in: [core/services/gift-cards.service.ts:198](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L198)

***

### giftCardId?

> `optional` **giftCardId?**: `string`

Defined in: [core/services/gift-cards.service.ts:197](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L197)

***

### idempotencyKey?

> `optional` **idempotencyKey?**: `string`

Defined in: [core/services/gift-cards.service.ts:206](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L206)

***

### loadActivityDetails?

> `optional` **loadActivityDetails?**: [`LoadActivityDetails`](LoadActivityDetails.md)

Defined in: [core/services/gift-cards.service.ts:200](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L200)

***

### locationId?

> `optional` **locationId?**: `string`

Defined in: [core/services/gift-cards.service.ts:196](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L196)

Location where the activity occurred. Defaults to the client's configured
location ID.

***

### redeemActivityDetails?

> `optional` **redeemActivityDetails?**: [`RedeemActivityDetails`](RedeemActivityDetails.md)

Defined in: [core/services/gift-cards.service.ts:201](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L201)

***

### type

> **type**: [`GiftCardActivityType`](../type-aliases/GiftCardActivityType.md)

Defined in: [core/services/gift-cards.service.ts:191](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L191)
