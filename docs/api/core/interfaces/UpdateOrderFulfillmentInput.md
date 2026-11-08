[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / UpdateOrderFulfillmentInput

# Interface: UpdateOrderFulfillmentInput

Defined in: [core/types/index.ts:193](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L193)

One fulfillment to change in `orders.update()`, matched on its `uid`.

Moving a `SHIPMENT` fulfillment to `COMPLETED` marks it shipped; Square stamps
`shipmentDetails.shippedAt` itself, so it isn't settable here.

## Properties

### shipmentDetails?

> `optional` **shipmentDetails?**: `object`

Defined in: [core/types/index.ts:198](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L198)

Writable shipment fields; only the ones you set are sent.

#### carrier?

> `optional` **carrier?**: `string`

#### expectedShippedAt?

> `optional` **expectedShippedAt?**: `string`

RFC 3339 timestamp.

#### shippingNote?

> `optional` **shippingNote?**: `string`

#### shippingType?

> `optional` **shippingType?**: `string`

#### trackingNumber?

> `optional` **trackingNumber?**: `string`

#### trackingUrl?

> `optional` **trackingUrl?**: `string`

***

### state?

> `optional` **state?**: `FulfillmentState`

Defined in: [core/types/index.ts:196](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L196)

***

### uid

> **uid**: `string`

Defined in: [core/types/index.ts:195](https://github.com/Bates-Solutions/squareup/blob/main/src/core/types/index.ts#L195)

The `uid` of a fulfillment already on the order.
