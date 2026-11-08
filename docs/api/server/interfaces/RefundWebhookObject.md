[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / RefundWebhookObject

# Interface: RefundWebhookObject

Defined in: [server/types.ts:183](https://github.com/Bates-Solutions/squareup/blob/main/src/server/types.ts#L183)

Refund object in a webhook event payload

## Properties

### refund

> **refund**: `object`

Defined in: [server/types.ts:184](https://github.com/Bates-Solutions/squareup/blob/main/src/server/types.ts#L184)

#### amount\_money?

> `optional` **amount\_money?**: `object`

##### amount\_money.amount

> **amount**: `number`

##### amount\_money.currency

> **currency**: `string`

#### id

> **id**: `string`

#### order\_id?

> `optional` **order\_id?**: `string`

#### payment\_id

> **payment\_id**: `string`

#### status

> **status**: `string`
