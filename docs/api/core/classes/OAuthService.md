[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / OAuthService

# Class: OAuthService

Defined in: [core/services/oauth.service.ts:17](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/oauth.service.ts#L17)

OAuth operations authenticated with the client's merchant access token.

Code exchange, refresh and revocation use application credentials instead.
They live on [SquareOAuthClient](SquareOAuthClient.md) (`createSquareOAuthClient`).

## Example

```typescript
const square = createSquareClient({ accessToken: tenant.accessToken });
const status = await square.oauth.tokenStatus();
```

## Constructors

### Constructor

> **new OAuthService**(`client`): `OAuthService`

Defined in: [core/services/oauth.service.ts:18](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/oauth.service.ts#L18)

#### Parameters

##### client

`SquareClient`

#### Returns

`OAuthService`

## Methods

### tokenStatus()

> **tokenStatus**(): `Promise`\<[`OAuthTokenStatus`](../interfaces/OAuthTokenStatus.md)\>

Defined in: [core/services/oauth.service.ts:35](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/oauth.service.ts#L35)

Get the scopes, expiry and merchant of this client's access token. Use it
as a connection health check, or to confirm a required scope was granted.

#### Returns

`Promise`\<[`OAuthTokenStatus`](../interfaces/OAuthTokenStatus.md)\>

Token status

#### Throws

If the token is invalid, expired or revoked

#### Example

```typescript
const { scopes, expiresAt } = await square.oauth.tokenStatus();
if (!scopes.includes('MERCHANT_PROFILE_READ')) {
  // ask the seller to reconnect with the missing permission
}
```
