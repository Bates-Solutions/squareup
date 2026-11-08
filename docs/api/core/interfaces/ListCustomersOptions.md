[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / ListCustomersOptions

# Interface: ListCustomersOptions

Defined in: [core/services/customers.service.ts:94](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/customers.service.ts#L94)

Options for listing customers

## Properties

### cursor?

> `optional` **cursor?**: `string`

Defined in: [core/services/customers.service.ts:96](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/customers.service.ts#L96)

***

### limit?

> `optional` **limit?**: `number`

Defined in: [core/services/customers.service.ts:95](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/customers.service.ts#L95)

***

### sortField?

> `optional` **sortField?**: [`CustomerSortField`](../type-aliases/CustomerSortField.md)

Defined in: [core/services/customers.service.ts:103](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/customers.service.ts#L103)

Field to sort by. Defaults to `DEFAULT` when omitted.

A valid value is always sent to avoid an empty `sort_field=` query
parameter, which the Square API rejects with a 400.

***

### sortOrder?

> `optional` **sortOrder?**: [`CustomerSortOrder`](../type-aliases/CustomerSortOrder.md)

Defined in: [core/services/customers.service.ts:110](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/customers.service.ts#L110)

Sort direction. Defaults to `DESC` when omitted.

A valid value is always sent alongside `sort_field` to avoid an empty
`sort_order=` query parameter, which the Square API rejects with a 400.
