[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / SquareOAuthClientConfig

# Interface: SquareOAuthClientConfig

Defined in: [core/oauth.ts:138](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L138)

Configuration for [SquareOAuthClient](../classes/SquareOAuthClient.md). Uses the application's
credentials, not a merchant access token.

## Properties

### clientId

> **clientId**: `string`

Defined in: [core/oauth.ts:140](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L140)

Application ID

***

### clientSecret

> **clientSecret**: `string`

Defined in: [core/oauth.ts:142](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L142)

Application secret (Developer Console → OAuth). Never logged or put in errors.

***

### environment?

> `optional` **environment?**: [`SquareEnvironment`](../type-aliases/SquareEnvironment.md)

Defined in: [core/oauth.ts:144](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L144)

#### Default

```ts
'sandbox'
```
