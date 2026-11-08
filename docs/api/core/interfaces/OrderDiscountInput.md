[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / OrderDiscountInput

# Interface: OrderDiscountInput

Defined in: [core/types/index.ts:140](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L140)

An order discount. Reference an existing `CatalogDiscount` by
`catalogObjectId` (keeps the catalog authoritative — the price tracks the
rule), or define an ad-hoc discount inline with `type` + `percentage`/`amountMoney`.

## See

https://developer.squareup.com/docs/orders-api/discounts

## Properties

### amountMoney?

> `optional` **amountMoney?**: `object`

Defined in: [core/types/index.ts:150](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L150)

Fixed amount (for amount types).

#### amount

> **amount**: `number` \| `bigint`

#### currency

> **currency**: `"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"`

***

### catalogObjectId?

> `optional` **catalogObjectId?**: `string`

Defined in: [core/types/index.ts:144](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L144)

Reference an existing `CatalogDiscount` by id.

***

### name?

> `optional` **name?**: `string`

Defined in: [core/types/index.ts:145](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L145)

***

### percentage?

> `optional` **percentage?**: `string`

Defined in: [core/types/index.ts:148](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L148)

Percentage as a string, e.g. `"7.25"` (for percentage types).

***

### scope?

> `optional` **scope?**: [`OrderDiscountScope`](../type-aliases/OrderDiscountScope.md)

Defined in: [core/types/index.ts:156](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L156)

`ORDER` applies to the whole order (Square auto-applies to every line);
`LINE_ITEM` applies only to lines that list this discount's `uid` in their
`appliedDiscounts`.

***

### type?

> `optional` **type?**: [`OrderDiscountType`](../type-aliases/OrderDiscountType.md)

Defined in: [core/types/index.ts:146](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L146)

***

### uid?

> `optional` **uid?**: `string`

Defined in: [core/types/index.ts:142](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L142)

Client-side id; reference it from a line item's `appliedDiscounts`.
