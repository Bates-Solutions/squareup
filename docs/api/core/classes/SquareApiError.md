[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / SquareApiError

# Class: SquareApiError

Defined in: [core/errors.ts:57](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L57)

API-level errors from Square

## Extends

- [`SquareError`](SquareError.md)

## Constructors

### Constructor

> **new SquareApiError**(`message`, `code`, `statusCode`, `errors`): `SquareApiError`

Defined in: [core/errors.ts:65](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L65)

#### Parameters

##### message

`string`

##### code

[`SquareErrorCode`](../type-aliases/SquareErrorCode.md)

##### statusCode

`number`

##### errors

`object`[]

#### Returns

`SquareApiError`

#### Overrides

[`SquareError`](SquareError.md).[`constructor`](SquareError.md#constructor)

## Properties

### code

> `readonly` **code**: [`SquareErrorCode`](../type-aliases/SquareErrorCode.md)

Defined in: [core/errors.ts:33](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L33)

#### Inherited from

[`SquareError`](SquareError.md).[`code`](SquareError.md#code)

***

### details?

> `readonly` `optional` **details?**: `unknown`

Defined in: [core/errors.ts:35](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L35)

#### Inherited from

[`SquareError`](SquareError.md).[`details`](SquareError.md#details)

***

### errors

> `readonly` **errors**: `object`[]

Defined in: [core/errors.ts:58](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L58)

#### category

> **category**: `string`

#### code

> **code**: `string`

#### detail?

> `optional` **detail?**: `string`

#### field?

> `optional` **field?**: `string`

***

### statusCode?

> `readonly` `optional` **statusCode?**: `number`

Defined in: [core/errors.ts:34](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L34)

#### Inherited from

[`SquareError`](SquareError.md).[`statusCode`](SquareError.md#statuscode)
