[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / SquarePaymentError

# Class: SquarePaymentError

Defined in: [core/errors.ts:90](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L90)

Payment processing errors

## Extends

- [`SquareError`](SquareError.md)

## Constructors

### Constructor

> **new SquarePaymentError**(`message`, `code`, `paymentId?`): `SquarePaymentError`

Defined in: [core/errors.ts:93](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L93)

#### Parameters

##### message

`string`

##### code

[`SquareErrorCode`](../type-aliases/SquareErrorCode.md)

##### paymentId?

`string`

#### Returns

`SquarePaymentError`

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

### paymentId?

> `readonly` `optional` **paymentId?**: `string`

Defined in: [core/errors.ts:91](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L91)

***

### statusCode?

> `readonly` `optional` **statusCode?**: `number`

Defined in: [core/errors.ts:34](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L34)

#### Inherited from

[`SquareError`](SquareError.md).[`statusCode`](SquareError.md#statuscode)
