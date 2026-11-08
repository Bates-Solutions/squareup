[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / OAuthTokenStatus

# Interface: OAuthTokenStatus

Defined in: [core/oauth.ts:172](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L172)

Status of a merchant access token, from `square.oauth.tokenStatus()`.

## Properties

### clientId?

> `optional` **clientId?**: `string`

Defined in: [core/oauth.ts:178](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L178)

Application the token was issued to

***

### expiresAt?

> `optional` **expiresAt?**: `Date`

Defined in: [core/oauth.ts:176](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L176)

When the token expires. Absent for personal access tokens, which do not expire.

***

### merchantId?

> `optional` **merchantId?**: `string`

Defined in: [core/oauth.ts:180](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L180)

Merchant the token belongs to

***

### scopes

> **scopes**: `string`[]

Defined in: [core/oauth.ts:174](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L174)

Permissions granted to the token
