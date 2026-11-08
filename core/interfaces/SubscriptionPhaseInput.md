[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / SubscriptionPhaseInput

# Interface: SubscriptionPhaseInput

Defined in: [core/services/subscriptions.service.ts:88](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/subscriptions.service.ts#L88)

A subscription phase that bills from an order template.

Use with `orders.create({ state: 'DRAFT', pricingOptions: { autoApplyDiscounts: true } })`
(or `orders.builder().asTemplate()`) to drive product-based recurring billing —
each cycle invoices the line items on the template, re-applying catalog
pricing rules (e.g. customer-group wholesale tiers) at calculation time.

## Properties

### orderTemplateId

> **orderTemplateId**: `string`

Defined in: [core/services/subscriptions.service.ts:99](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/subscriptions.service.ts#L99)

ID of a DRAFT order created via `square.orders.create(...)` that defines
what ships each billing cycle.

***

### ordinal?

> `optional` **ordinal?**: `number` \| `bigint`

Defined in: [core/services/subscriptions.service.ts:94](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/subscriptions.service.ts#L94)

Position of this phase in the subscription's phase sequence. Defaults to
array position when omitted. Accepts a number or bigint — coerced to
bigint at the SDK boundary.
