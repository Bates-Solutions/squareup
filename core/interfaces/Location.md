[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / Location

# Interface: Location

Defined in: [core/services/locations.service.ts:11](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/locations.service.ts#L11)

A Square location (a merchant's business location).

A location's `currency` is the currency Square processes all of that
location's transactions in — useful for deriving the right currency instead
of hardcoding or configuring it.

## Properties

### country?

> `optional` **country?**: `string`

Defined in: [core/services/locations.service.ts:16](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/locations.service.ts#L16)

Two-letter ISO 3166 country code, e.g. `US`, `CA`

***

### currency?

> `optional` **currency?**: `string`

Defined in: [core/services/locations.service.ts:18](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/locations.service.ts#L18)

ISO 4217 currency code, e.g. `USD`, `CAD`

***

### id?

> `optional` **id?**: `string`

Defined in: [core/services/locations.service.ts:12](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/locations.service.ts#L12)

***

### name?

> `optional` **name?**: `string` \| `null`

Defined in: [core/services/locations.service.ts:14](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/locations.service.ts#L14)

Location nickname shown in the Seller Dashboard

***

### status?

> `optional` **status?**: `string`

Defined in: [core/services/locations.service.ts:20](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/locations.service.ts#L20)

Location status, e.g. `ACTIVE` or `INACTIVE`
