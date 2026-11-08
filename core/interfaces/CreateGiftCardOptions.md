[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / CreateGiftCardOptions

# Interface: CreateGiftCardOptions

Defined in: [core/services/gift-cards.service.ts:160](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L160)

Options for creating a gift card.

GAN handling:
- Omit `gan` and `ganSource` to let Square generate a 16-digit GAN.
- Set `ganSource: 'OTHER'` and provide a custom `gan` (8–20 alphanumeric
  characters) for application-supplied GANs.
- For unactivated physical cards previously ordered from Square, provide
  only `gan` (the printed value); leave `ganSource` unset.

## Properties

### gan?

> `optional` **gan?**: `string`

Defined in: [core/services/gift-cards.service.ts:167](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L167)

***

### ganSource?

> `optional` **ganSource?**: [`GiftCardGanSource`](../type-aliases/GiftCardGanSource.md)

Defined in: [core/services/gift-cards.service.ts:168](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L168)

***

### idempotencyKey?

> `optional` **idempotencyKey?**: `string`

Defined in: [core/services/gift-cards.service.ts:169](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L169)

***

### locationId?

> `optional` **locationId?**: `string`

Defined in: [core/services/gift-cards.service.ts:166](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L166)

Location to register the card under. Defaults to the client's configured
location ID.

***

### type

> **type**: [`GiftCardType`](../type-aliases/GiftCardType.md)

Defined in: [core/services/gift-cards.service.ts:161](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/gift-cards.service.ts#L161)
