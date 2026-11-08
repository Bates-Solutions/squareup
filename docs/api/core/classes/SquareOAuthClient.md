[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / SquareOAuthClient

# Class: SquareOAuthClient

Defined in: [core/oauth.ts:207](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L207)

OAuth client for the application-credential endpoints: exchanging an
authorization code, refreshing, and revoking tokens.

These endpoints authenticate with the application's `clientId` /
`clientSecret`, not a merchant token — which is why this is separate from
[SquareClient](SquareClient.md). To check a merchant token's status, use
`createSquareClient({ accessToken }).oauth.tokenStatus()`.

## Example

```typescript
const oauth = createSquareOAuthClient({
  clientId: process.env.SQUARE_APP_ID!,
  clientSecret: process.env.SQUARE_APP_SECRET!,
  environment: 'production',
});

// In the redirect handler, after verifying `state`: require a stored value,
// delete it (one use), then compare it with the query value. Then handle a
// deny (`error=access_denied`, no `code`) and require `code` to be a string.
// See docs/guides/core/oauth.md.
const tokens = await oauth.obtainToken({ code });
```

## Constructors

### Constructor

> **new SquareOAuthClient**(`config`): `SquareOAuthClient`

Defined in: [core/oauth.ts:213](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L213)

#### Parameters

##### config

[`SquareOAuthClientConfig`](../interfaces/SquareOAuthClientConfig.md)

#### Returns

`SquareOAuthClient`

## Methods

### obtainToken()

> **obtainToken**(`options`): `Promise`\<[`OAuthTokens`](../interfaces/OAuthTokens.md)\>

Defined in: [core/oauth.ts:246](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L246)

Exchange the authorization `code` from the OAuth redirect for tokens.

#### Parameters

##### options

###### code

`string`

`code` query parameter from the redirect (valid for 5 minutes)

###### redirectUri?

`string`

Required if the authorize URL included one; must match

#### Returns

`Promise`\<[`OAuthTokens`](../interfaces/OAuthTokens.md)\>

#### Example

```typescript
// After the state check (see docs/guides/core/oauth.md)
if (typeof req.query.error === 'string') return res.redirect('/settings?connect=denied');
if (typeof req.query.code !== 'string') throw new Error('OAuth code missing');

const { accessToken, refreshToken, expiresAt, merchantId } =
  await oauth.obtainToken({ code: req.query.code });
```

***

### refreshToken()

> **refreshToken**(`options`): `Promise`\<[`OAuthTokens`](../interfaces/OAuthTokens.md)\>

Defined in: [core/oauth.ts:265](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L265)

Get a new access token using a refresh token. Run this on a schedule
well before `expiresAt` — Square recommends every 7 days or less.

#### Parameters

##### options

###### refreshToken

`string`

#### Returns

`Promise`\<[`OAuthTokens`](../interfaces/OAuthTokens.md)\>

#### Example

```typescript
const refreshed = await oauth.refreshToken({ refreshToken: stored.refreshToken });
```

***

### revokeToken()

> **revokeToken**(`options`): `Promise`\<`void`\>

Defined in: [core/oauth.ts:284](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L284)

Revoke this application's access to a merchant. Pass the merchant's
`merchantId` to revoke every token issued to them, or an `accessToken`
to revoke that token (and its merchant's other tokens).

#### Parameters

##### options

\{ `accessToken?`: `undefined`; `merchantId`: `string`; `revokeOnlyAccessToken?`: `undefined`; \} \| \{ `accessToken`: `string`; `merchantId?`: `undefined`; `revokeOnlyAccessToken?`: `boolean`; \}

###### Type Literal

\{ `accessToken?`: `undefined`; `merchantId`: `string`; `revokeOnlyAccessToken?`: `undefined`; \}

###### accessToken?

`undefined`

###### merchantId

`string`

###### revokeOnlyAccessToken?

`undefined`

Revoke only `accessToken`, leaving
  the refresh token and the authorization intact

***

###### Type Literal

\{ `accessToken`: `string`; `merchantId?`: `undefined`; `revokeOnlyAccessToken?`: `boolean`; \}

###### accessToken

`string`

###### merchantId?

`undefined`

###### revokeOnlyAccessToken?

`boolean`

Revoke only `accessToken`, leaving
  the refresh token and the authorization intact

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await oauth.revokeToken({ merchantId: tenant.squareMerchantId });
```
