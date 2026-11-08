[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / GiftCardActivity

# Interface: GiftCardActivity

Defined in: [core/services/gift-cards.service.ts:97](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L97)

Gift card activity returned by the Activities API.

The `*ActivityDetails` fields are populated based on `type`.

## Properties

### activateActivityDetails?

> `optional` **activateActivityDetails?**: [`ActivateActivityDetails`](ActivateActivityDetails.md)

Defined in: [core/services/gift-cards.service.ts:108](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L108)

***

### adjustDecrementActivityDetails?

> `optional` **adjustDecrementActivityDetails?**: [`AdjustDecrementActivityDetails`](AdjustDecrementActivityDetails.md)

Defined in: [core/services/gift-cards.service.ts:114](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L114)

***

### adjustIncrementActivityDetails?

> `optional` **adjustIncrementActivityDetails?**: [`AdjustIncrementActivityDetails`](AdjustIncrementActivityDetails.md)

Defined in: [core/services/gift-cards.service.ts:113](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L113)

***

### clearBalanceActivityDetails?

> `optional` **clearBalanceActivityDetails?**: `object`

Defined in: [core/services/gift-cards.service.ts:111](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L111)

#### reason?

> `optional` **reason?**: `string`

***

### createdAt?

> `optional` **createdAt?**: `string`

Defined in: [core/services/gift-cards.service.ts:101](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L101)

***

### deactivateActivityDetails?

> `optional` **deactivateActivityDetails?**: `object`

Defined in: [core/services/gift-cards.service.ts:112](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L112)

#### reason?

> `optional` **reason?**: [`GiftCardDeactivateReason`](../type-aliases/GiftCardDeactivateReason.md)

***

### giftCardBalanceMoney?

> `optional` **giftCardBalanceMoney?**: `object`

Defined in: [core/services/gift-cards.service.ts:104](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L104)

#### amount?

> `optional` **amount?**: `bigint`

#### currency?

> `optional` **currency?**: `string`

***

### giftCardGan?

> `optional` **giftCardGan?**: `string`

Defined in: [core/services/gift-cards.service.ts:103](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L103)

***

### giftCardId?

> `optional` **giftCardId?**: `string`

Defined in: [core/services/gift-cards.service.ts:102](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L102)

***

### id?

> `optional` **id?**: `string`

Defined in: [core/services/gift-cards.service.ts:98](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L98)

***

### loadActivityDetails?

> `optional` **loadActivityDetails?**: [`LoadActivityDetails`](LoadActivityDetails.md)

Defined in: [core/services/gift-cards.service.ts:109](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L109)

***

### locationId?

> `optional` **locationId?**: `string`

Defined in: [core/services/gift-cards.service.ts:100](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L100)

***

### redeemActivityDetails?

> `optional` **redeemActivityDetails?**: [`RedeemActivityDetails`](RedeemActivityDetails.md)

Defined in: [core/services/gift-cards.service.ts:110](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L110)

***

### type?

> `optional` **type?**: [`GiftCardActivityType`](../type-aliases/GiftCardActivityType.md)

Defined in: [core/services/gift-cards.service.ts:99](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L99)
