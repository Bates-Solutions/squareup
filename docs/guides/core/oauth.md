# OAuth

OAuth lets each seller connect their own Square account to your application, so you don't have to ask them for a personal access token. This is the usual setup for multi-tenant platforms. The wrapper covers the whole [code flow](https://developer.squareup.com/docs/oauth-api/overview):

| Step                    | API                                               | Authenticates with          |
| ----------------------- | ------------------------------------------------- | --------------------------- |
| Send seller to Square   | `buildAuthorizeUrl()`                             | Nothing (no network call)   |
| Exchange the code       | `oauth.obtainToken()`                             | Application ID + secret     |
| Refresh the token       | `oauth.refreshToken()`                            | Application ID + secret     |
| Disconnect              | `oauth.revokeToken()`                             | Application ID + secret     |
| Check a connection      | `square.oauth.tokenStatus()`                      | The merchant's access token |

The code exchange, refresh and disconnect endpoints use your **application credentials**, not a merchant token. For those you create a separate client with `createSquareOAuthClient`. You don't need a dummy access token.

```typescript
import { buildAuthorizeUrl, createSquareOAuthClient, createSquareClient } from '@bates-solutions/squareup';

const oauth = createSquareOAuthClient({
  clientId: process.env.SQUARE_APP_ID!,
  clientSecret: process.env.SQUARE_APP_SECRET!,
  environment: 'production', // default: 'sandbox'
});
```

## 1. Send the seller to Square

```typescript
const state = crypto.randomUUID();
req.session.oauthState = state; // store it server side, e.g. in the session, with the tenant ID

const url = buildAuthorizeUrl({
  clientId: process.env.SQUARE_APP_ID!,
  environment: 'production',
  scopes: ['ORDERS_READ', 'ORDERS_WRITE', 'MERCHANT_PROFILE_READ'],
  state,
});
// redirect the seller to `url`
```

- `environment` picks the host: `connect.squareup.com` or `connect.squareupsandbox.com`.
- `session` defaults to `false`, which Square requires for production apps.
- `scopes` is typed as `OAuthScope`, so known permission names autocomplete and typos are caught. Other strings are accepted too, for scopes Square adds later.
- Optional: `locale` (e.g. `'fr-CA'`), and `redirectUri`, which must match the app's configured redirect URL.

Request every scope your integration calls. A missing scope only shows up at runtime, on the first call that needs it. For example, `square.locations.list()` needs `MERCHANT_PROFILE_READ`.

## 2. Exchange the code

Square redirects to your callback with `code` and `state`. Check `state` before exchanging the code. The code is valid for 5 minutes.

```typescript
// Take the stored state and delete it, so each value works only once
const storedState = req.session.oauthState;
delete req.session.oauthState;

if (!storedState) throw new Error('OAuth state missing: start the flow again');
if (typeof req.query.state !== 'string' || req.query.state !== storedState) {
  throw new Error('OAuth state mismatch');
}

const tokens = await oauth.obtainToken({ code: req.query.code });
// {
//   accessToken: 'EAAA…',
//   refreshToken: 'EQAA…',
//   expiresAt: Date,        // always set — 30 days out
//   merchantId: 'ML…',
//   tokenType: 'bearer',
// }
```

Store the tokens per merchant, encrypted at rest. Then call the API as that merchant:

```typescript
const square = createSquareClient({ accessToken: tokens.accessToken, environment: 'production' });
```

The state check is what stops a cross-site request forgery: an attacker sending your user to the callback with the attacker's own `code`. Its order matters:

- **Require a stored state.** A plain `req.query.state !== storedState` passes when both are `undefined`: a callback with no `state`, in a session that never started the flow. Reject when nothing is stored.
- **Use it once.** Delete the stored value before comparing, whether or not the check passes, so a captured callback URL can't be replayed.
- **Then compare.** The query value must be a string equal to the stored one.

If the authorize URL included `redirectUri`, pass the same value to `obtainToken({ code, redirectUri })`.

## 3. Refresh before expiry

Access tokens expire after 30 days. Square recommends refreshing **every 7 days or less**, whether or not the seller is active. Run a scheduled job keyed off `expiresAt`:

```typescript
const refreshed = await oauth.refreshToken({ refreshToken: stored.refreshToken });
// save refreshed.accessToken and refreshed.expiresAt
```

With the code flow, the refresh token doesn't expire and Square returns the same one on refresh. `refreshTokenExpiresAt` is set only when the refresh token does expire (the PKCE flow).

## 4. Disconnect

```typescript
// Revoke every token this app holds for the merchant
await oauth.revokeToken({ merchantId: tenant.squareMerchantId });

// Or revoke by token. With revokeOnlyAccessToken, only that access token is
// revoked; the refresh token and the seller's authorization stay valid.
await oauth.revokeToken({ accessToken: compromisedToken, revokeOnlyAccessToken: true });
```

This sends the `Authorization: Client <secret>` header that Square requires. If Square doesn't confirm the revocation, it throws.

## 5. Check a connection

`tokenStatus()` is on the regular client because it authenticates with the merchant's own token:

```typescript
const square = createSquareClient({ accessToken: tenant.accessToken });
const { scopes, expiresAt, merchantId } = await square.oauth.tokenStatus();

if (!scopes.includes('MERCHANT_PROFILE_READ')) {
  // prompt the seller to reconnect with the missing permission
}
```

`expiresAt` is a `Date`. It is absent for personal access tokens, which don't expire. An invalid, expired or revoked token throws `SquareAuthError`.

## Errors and secrets

- A network failure or timeout throws `SquareNetworkError`. For a scheduled refresh, `isRetryableSquareError(error)` separates "try again later" from "Square rejected this". See [Errors and Retries](./errors.md).
- HTTP errors are mapped as elsewhere in the library: `SquareAuthError` for 401, otherwise `SquareApiError` with Square's `errors`. A 200 response that carries `errors` also throws `SquareApiError`.
- Invalid inputs throw `SquareValidationError` before any request is made: an empty `code`, `refreshToken`, `clientId` or `state`; no `scopes`; or a `revokeToken()` call with both or neither of `merchantId` and `accessToken`, or with `revokeOnlyAccessToken` alongside `merchantId`.
- An unparseable timestamp from Square throws `SquareError`. You never get back an `Invalid Date`.
- The client secret lives in an ES private field. It never appears in error messages, `JSON.stringify(oauth)`, or `console.log(oauth)`. Errors are built from Square's response only, never from the request.

## Not covered

- **PKCE flow** (public clients without a secret): `code_challenge` / `code_verifier` aren't exposed yet. Use `square.sdk.oAuth` for now.
- **Migration tokens** and **short-lived tokens**: use `square.sdk.oAuth.obtainToken` directly.
