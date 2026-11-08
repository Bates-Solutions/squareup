[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / ExpressRequestHandler

# Type Alias: ExpressRequestHandler

> **ExpressRequestHandler** = (`req`, `res`, `next`) => `void` \| `Promise`\<`void`\>

Defined in: [server/middleware/express.ts:42](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/express.ts#L42)

Minimal structural stand-in for the Express `RequestHandler`.

## Parameters

### req

[`ExpressRequestLike`](../interfaces/ExpressRequestLike.md)

### res

[`ExpressResponseLike`](../interfaces/ExpressResponseLike.md)

### next

[`ExpressNextFunction`](ExpressNextFunction.md)

## Returns

`void` \| `Promise`\<`void`\>
