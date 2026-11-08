[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / LambdaProxyEvent

# Interface: LambdaProxyEvent

Defined in: [server/middleware/lambda.ts:14](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L14)

Minimal API Gateway proxy event shape (avoids aws-lambda dependency)

## Properties

### body

> **body**: `string` \| `null`

Defined in: [server/middleware/lambda.ts:17](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L17)

***

### headers?

> `optional` **headers?**: `Record`\<`string`, `string` \| `undefined`\> \| `null`

Defined in: [server/middleware/lambda.ts:16](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L16)

***

### httpMethod

> **httpMethod**: `string`

Defined in: [server/middleware/lambda.ts:15](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L15)

***

### isBase64Encoded?

> `optional` **isBase64Encoded?**: `boolean`

Defined in: [server/middleware/lambda.ts:18](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L18)
