[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / OrderPricingOptions

# Interface: OrderPricingOptions

Defined in: [core/types/index.ts:99](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L99)

Pricing options for an order. Controls automatic application of discounts
(pricing rules) and taxes.

## Properties

### autoApplyDiscounts?

> `optional` **autoApplyDiscounts?**: `boolean`

Defined in: [core/types/index.ts:111](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L111)

Apply catalog pricing rules (incl. customer-group-gated wholesale rules)
automatically at calculation time.

⚠️ **Not for subscription order templates.** Square rejects a subscription
template that sets this (`The order template amount must not have
auto_apply_discounts set to true`). For a template, carry prices explicitly
via each line's `basePriceMoney`, or reference discounts explicitly via the
order's `discounts` — either keeps the amount well-defined without
auto-application.

***

### autoApplyTaxes?

> `optional` **autoApplyTaxes?**: `boolean`

Defined in: [core/types/index.ts:115](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L115)

Apply all enabled taxes at the location automatically.
