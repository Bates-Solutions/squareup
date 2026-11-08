[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / SquareError

# Class: SquareError

Defined in: [core/errors.ts:32](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L32)

Base Square error class

## Extends

- `Error`

## Extended by

- [`SquareApiError`](SquareApiError.md)
- [`SquareAuthError`](SquareAuthError.md)
- [`SquarePaymentError`](SquarePaymentError.md)
- [`SquareValidationError`](SquareValidationError.md)
- [`SquareNetworkError`](SquareNetworkError.md)

## Constructors

### Constructor

> **new SquareError**(`message`, `code?`, `statusCode?`, `details?`): `SquareError`

Defined in: [core/errors.ts:37](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L37)

#### Parameters

##### message

`string`

##### code?

[`SquareErrorCode`](../type-aliases/SquareErrorCode.md) = `'UNKNOWN'`

##### statusCode?

`number`

##### details?

`unknown`

#### Returns

`SquareError`

#### Overrides

`Error.constructor`

## Properties

### code

> `readonly` **code**: [`SquareErrorCode`](../type-aliases/SquareErrorCode.md)

Defined in: [core/errors.ts:33](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L33)

***

### details?

> `readonly` `optional` **details?**: `unknown`

Defined in: [core/errors.ts:35](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L35)

***

### statusCode?

> `readonly` `optional` **statusCode?**: `number`

Defined in: [core/errors.ts:34](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L34)
