[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / OrderDiscountType

# Type Alias: OrderDiscountType

> **OrderDiscountType** = `"FIXED_PERCENTAGE"` \| `"FIXED_AMOUNT"` \| `"VARIABLE_PERCENTAGE"` \| `"VARIABLE_AMOUNT"`

Defined in: [core/types/index.ts:122](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L122)

Discount type. `FIXED_*` uses the exact `percentage`/`amountMoney` given;
`VARIABLE_*` is resolved from the referenced catalog discount.
