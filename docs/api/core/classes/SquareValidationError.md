[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / SquareValidationError

# Class: SquareValidationError

Defined in: [core/errors.ts:103](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L103)

Validation errors

## Extends

- [`SquareError`](SquareError.md)

## Constructors

### Constructor

> **new SquareValidationError**(`message`, `field?`): `SquareValidationError`

Defined in: [core/errors.ts:106](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L106)

#### Parameters

##### message

`string`

##### field?

`string`

#### Returns

`SquareValidationError`

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

### field?

> `readonly` `optional` **field?**: `string`

Defined in: [core/errors.ts:104](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L104)

***

### statusCode?

> `readonly` `optional` **statusCode?**: `number`

Defined in: [core/errors.ts:34](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L34)

#### Inherited from

[`SquareError`](SquareError.md).[`statusCode`](SquareError.md#statuscode)
