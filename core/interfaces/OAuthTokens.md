[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / OAuthTokens

# Interface: OAuthTokens

Defined in: [core/oauth.ts:151](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L151)

Tokens returned by [SquareOAuthClient.obtainToken](../classes/SquareOAuthClient.md#obtaintoken) and
[SquareOAuthClient.refreshToken](../classes/SquareOAuthClient.md#refreshtoken).

## Properties

### accessToken

> **accessToken**: `string`

Defined in: [core/oauth.ts:153](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L153)

Merchant access token — use as `accessToken` in `createSquareClient`

***

### expiresAt

> **expiresAt**: `Date`

Defined in: [core/oauth.ts:157](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L157)

When `accessToken` expires (30 days after issue). Refresh well before this.

***

### merchantId

> **merchantId**: `string`

Defined in: [core/oauth.ts:159](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L159)

Merchant the tokens belong to

***

### refreshToken

> **refreshToken**: `string`

Defined in: [core/oauth.ts:164](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L164)

Refresh token. For the code flow with a client secret this does not
expire, and Square returns the same value on refresh.

***

### refreshTokenExpiresAt?

> `optional` **refreshTokenExpiresAt?**: `Date`

Defined in: [core/oauth.ts:166](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L166)

Only set when the refresh token itself expires (PKCE flow)

***

### tokenType

> **tokenType**: `string`

Defined in: [core/oauth.ts:155](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L155)

Always `'bearer'`
