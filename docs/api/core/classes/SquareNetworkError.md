[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / SquareNetworkError

# Class: SquareNetworkError

Defined in: [core/errors.ts:121](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L121)

The request never got an HTTP response: a connection failure (DNS, reset,
`fetch failed`) or a client-side timeout. Square may or may not have
processed the request. `statusCode` is always undefined.

`cause` holds the SDK error. It never contains the request, so secrets
such as an OAuth `client_secret` are not exposed.

## Extends

- [`SquareError`](SquareError.md)

## Constructors

### Constructor

> **new SquareNetworkError**(`message`, `code`, `options?`): `SquareNetworkError`

Defined in: [core/errors.ts:124](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L124)

#### Parameters

##### message

`string`

##### code

`"NETWORK_ERROR"` \| `"TIMEOUT"`

##### options?

###### cause?

`unknown`

#### Returns

`SquareNetworkError`

#### Overrides

[`SquareError`](SquareError.md).[`constructor`](SquareError.md#constructor)

## Properties

### code

> `readonly` **code**: `"NETWORK_ERROR"` \| `"TIMEOUT"`

Defined in: [core/errors.ts:122](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L122)

#### Overrides

[`SquareError`](SquareError.md).[`code`](SquareError.md#code)

***

### details?

> `readonly` `optional` **details?**: `unknown`

Defined in: [core/errors.ts:35](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L35)

#### Inherited from

[`SquareError`](SquareError.md).[`details`](SquareError.md#details)

***

### statusCode?

> `readonly` `optional` **statusCode?**: `number`

Defined in: [core/errors.ts:34](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L34)

#### Inherited from

[`SquareError`](SquareError.md).[`statusCode`](SquareError.md#statuscode)
