[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / UpdateOrderOptions

# Interface: UpdateOrderOptions

Defined in: [core/types/index.ts:213](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L213)

Options for `orders.update()`. Square applies them as a sparse update: only
the fields you set change.

## Properties

### fieldsToClear?

> `optional` **fieldsToClear?**: `string`[]

Defined in: [core/types/index.ts:228](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L228)

Fields to remove, as Square dot paths, e.g.
`'fulfillments[FULFILLMENT_UID].shipment_details.tracking_url'`.

***

### fulfillments?

> `optional` **fulfillments?**: [`UpdateOrderFulfillmentInput`](UpdateOrderFulfillmentInput.md)[]

Defined in: [core/types/index.ts:223](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L223)

Fulfillments to change, each matched on `uid`.

***

### idempotencyKey?

> `optional` **idempotencyKey?**: `string`

Defined in: [core/types/index.ts:233](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L233)

Reuse it only when resending the identical request; a retry with a new
`version` needs a new key.

***

### referenceId?

> `optional` **referenceId?**: `string`

Defined in: [core/types/index.ts:219](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L219)

***

### state?

> `optional` **state?**: `OrderState`

Defined in: [core/types/index.ts:221](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L221)

Order state, e.g. `'CANCELED'` to cancel an open order or DRAFT template.

***

### version

> **version**: `number`

Defined in: [core/types/index.ts:218](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L218)

The order's current version. Square rejects a stale one, which is how a
concurrent change is detected.
