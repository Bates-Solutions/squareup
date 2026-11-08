[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / WebhookLogger

# Interface: WebhookLogger

Defined in: [server/middleware/lambda.ts:57](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L57)

Logger interface for Lambda webhook handler

## Properties

### error

> **error**: (`message`, `data?`) => `void`

Defined in: [server/middleware/lambda.ts:59](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L59)

#### Parameters

##### message

`string`

##### data?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### info

> **info**: (`message`, `data?`) => `void`

Defined in: [server/middleware/lambda.ts:58](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/lambda.ts#L58)

#### Parameters

##### message

`string`

##### data?

`Record`\<`string`, `unknown`\>

#### Returns

`void`
