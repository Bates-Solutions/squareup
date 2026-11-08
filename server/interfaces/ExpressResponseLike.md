[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / ExpressResponseLike

# Interface: ExpressResponseLike

Defined in: [server/middleware/express.ts:33](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/express.ts#L33)

Minimal structural stand-in for the Express `Response` methods used here.

## Methods

### json()

> **json**(`body`): `ExpressResponseLike`

Defined in: [server/middleware/express.ts:35](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/express.ts#L35)

#### Parameters

##### body

`unknown`

#### Returns

`ExpressResponseLike`

***

### status()

> **status**(`code`): `ExpressResponseLike`

Defined in: [server/middleware/express.ts:34](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/express.ts#L34)

#### Parameters

##### code

`number`

#### Returns

`ExpressResponseLike`
