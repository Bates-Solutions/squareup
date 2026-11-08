[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / buildAuthorizeUrl

# Function: buildAuthorizeUrl()

> **buildAuthorizeUrl**(`options`): `string`

Defined in: [core/oauth.ts:110](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L110)

Build the URL that sends a seller to Square to authorize your application
(OAuth code flow). Pure function — no network call.

## Parameters

### options

[`BuildAuthorizeUrlOptions`](../interfaces/BuildAuthorizeUrlOptions.md)

## Returns

`string`

## Example

```typescript
const url = buildAuthorizeUrl({
  clientId: process.env.SQUARE_APP_ID!,
  environment: 'production',
  scopes: ['ORDERS_READ', 'MERCHANT_PROFILE_READ'],
  state: csrfToken,
});
// redirect the seller to `url`
```
