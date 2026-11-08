[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / BuildAuthorizeUrlOptions

# Interface: BuildAuthorizeUrlOptions

Defined in: [core/oauth.ts:65](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L65)

Options for [buildAuthorizeUrl](../functions/buildAuthorizeUrl.md)

## Properties

### clientId

> **clientId**: `string`

Defined in: [core/oauth.ts:67](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L67)

Application ID (sandbox IDs start with `sandbox-`)

***

### environment?

> `optional` **environment?**: [`SquareEnvironment`](../type-aliases/SquareEnvironment.md)

Defined in: [core/oauth.ts:73](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L73)

Selects the authorize host: `connect.squareup.com` (production) or
`connect.squareupsandbox.com` (sandbox).

#### Default

```ts
'sandbox'
```

***

### locale?

> `optional` **locale?**: `string`

Defined in: [core/oauth.ts:90](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L90)

Authorization page language, e.g. `en-US`, `en-CA`, `es-US`, `fr-CA`, `ja-JP`

***

### redirectUri?

> `optional` **redirectUri?**: `string`

Defined in: [core/oauth.ts:92](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L92)

Must match the redirect URL configured for the application, if set

***

### scopes

> **scopes**: [`OAuthScope`](../type-aliases/OAuthScope.md)[]

Defined in: [core/oauth.ts:75](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L75)

Permissions to request from the seller. Must not be empty.

***

### session?

> `optional` **session?**: `boolean`

Defined in: [core/oauth.ts:88](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L88)

Whether an existing Square Dashboard session may be reused. Square
requires `false` for production apps so the seller explicitly picks the
account. Ignored by Square in sandbox.

#### Default

```ts
false
```

***

### state

> **state**: `string`

Defined in: [core/oauth.ts:81](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L81)

Unguessable CSRF token, returned unchanged on the redirect. Verify it in
your callback before exchanging the code. You can also use it to carry
which tenant started the flow.
