[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / CreateOrderOptions

# Interface: CreateOrderOptions

Defined in: [core/types/index.ts:162](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L162)

Create order options

## Properties

### customerId?

> `optional` **customerId?**: `string`

Defined in: [core/types/index.ts:164](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L164)

***

### discounts?

> `optional` **discounts?**: [`OrderDiscountInput`](OrderDiscountInput.md)[]

Defined in: [core/types/index.ts:173](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L173)

Order-level and line-level discounts. Reference `CatalogDiscount` ids to
keep pricing authoritative (the number tracks the catalog rather than being
copied into the order). For a subscription order template, carry discounts
(or explicit `basePriceMoney`) here rather than relying on
`pricingOptions.autoApplyDiscounts` — see [OrderPricingOptions](OrderPricingOptions.md).

***

### idempotencyKey?

> `optional` **idempotencyKey?**: `string`

Defined in: [core/types/index.ts:184](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L184)

***

### lineItems

> **lineItems**: [`LineItemInput`](LineItemInput.md)[]

Defined in: [core/types/index.ts:163](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L163)

***

### locationId?

> `optional` **locationId?**: `string`

Defined in: [core/types/index.ts:183](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L183)

Override the client's default location for this order.

***

### pricingOptions?

> `optional` **pricingOptions?**: [`OrderPricingOptions`](OrderPricingOptions.md)

Defined in: [core/types/index.ts:179](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L179)

***

### referenceId?

> `optional` **referenceId?**: `string`

Defined in: [core/types/index.ts:165](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L165)

***

### state?

> `optional` **state?**: `"DRAFT"` \| `"OPEN"`

Defined in: [core/types/index.ts:178](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L178)

Order state. Use `'DRAFT'` when creating an order template that will back
a subscription phase (`subscriptions.create({ phases: [...] })`).
