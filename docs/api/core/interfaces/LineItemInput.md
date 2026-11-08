[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / LineItemInput

# Interface: LineItemInput

Defined in: [core/types/index.ts:57](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L57)

Line item for orders

## Properties

### amount?

> `optional` **amount?**: `number`

Defined in: [core/types/index.ts:61](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L61)

***

### appliedDiscounts?

> `optional` **appliedDiscounts?**: `object`[]

Defined in: [core/types/index.ts:76](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L76)

References to order-level `discounts` (by their `uid`) that apply to this
line item. Required for `LINE_ITEM`-scoped discounts — Square only applies
a line-item discount to a line that lists it here.

#### discountUid

> **discountUid**: `string`

***

### basePriceMoney?

> `optional` **basePriceMoney?**: `object`

Defined in: [core/types/index.ts:67](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L67)

Explicit money override. When set, takes precedence over `amount` + the
builder's default currency. Useful for order templates where the base
price must include an explicit currency.

#### amount

> **amount**: `number` \| `bigint`

#### currency

> **currency**: `"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"`

***

### catalogObjectId?

> `optional` **catalogObjectId?**: `string`

Defined in: [core/types/index.ts:59](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L59)

***

### name?

> `optional` **name?**: `string`

Defined in: [core/types/index.ts:58](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L58)

***

### note?

> `optional` **note?**: `string`

Defined in: [core/types/index.ts:77](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L77)

***

### quantity?

> `optional` **quantity?**: `number`

Defined in: [core/types/index.ts:60](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L60)
