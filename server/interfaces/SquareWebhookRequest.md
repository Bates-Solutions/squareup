[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / SquareWebhookRequest

# Interface: SquareWebhookRequest

Defined in: [server/middleware/express.ts:58](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/express.ts#L58)

Request object as seen by the webhook middleware, carrying the Square webhook
data it attaches.

This extends the minimal [ExpressRequestLike](ExpressRequestLike.md) rather than Express's full
`Request` (see the note above), so it exposes only `body`, `headers`, `on`,
plus the fields below. If you type your own downstream middleware against it
and need Express's extras (`params`, `query`, `get(...)`, …), intersect it
with the real Express request: `req: SquareWebhookRequest & express.Request`.

## Extends

- [`ExpressRequestLike`](ExpressRequestLike.md)

## Properties

### body?

> `optional` **body?**: `unknown`

Defined in: [server/middleware/express.ts:25](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/express.ts#L25)

Parsed or raw request body (Buffer, string, or parsed JSON).

#### Inherited from

[`ExpressRequestLike`](ExpressRequestLike.md).[`body`](ExpressRequestLike.md#body)

***

### headers

> **headers**: `Record`\<`string`, `string` \| `string`[] \| `undefined`\>

Defined in: [server/middleware/express.ts:27](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/express.ts#L27)

Request headers, keyed lowercase as Node/Express provide them.

#### Inherited from

[`ExpressRequestLike`](ExpressRequestLike.md).[`headers`](ExpressRequestLike.md#headers)

***

### rawBody?

> `optional` **rawBody?**: `string`

Defined in: [server/middleware/express.ts:60](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/express.ts#L60)

The raw request body as a string

***

### squareEvent?

> `optional` **squareEvent?**: [`WebhookEvent`](WebhookEvent.md)\<`unknown`\>

Defined in: [server/middleware/express.ts:62](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/express.ts#L62)

The parsed Square webhook event

## Methods

### on()

> **on**(`event`, `listener`): `unknown`

Defined in: [server/middleware/express.ts:29](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/express.ts#L29)

Node stream event subscription, used to capture the raw body.

#### Parameters

##### event

`string`

##### listener

(...`args`) => `void`

#### Returns

`unknown`

#### Inherited from

[`ExpressRequestLike`](ExpressRequestLike.md).[`on`](ExpressRequestLike.md#on)
