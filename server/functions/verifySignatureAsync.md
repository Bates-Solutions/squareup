[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / verifySignatureAsync

# Function: verifySignatureAsync()

> **verifySignatureAsync**(`rawBody`, `signature`, `signatureKey`, `notificationUrl?`): `Promise`\<[`WebhookVerificationResult`](../interfaces/WebhookVerificationResult.md)\>

Defined in: [server/webcrypto.ts:78](https://github.com/Bates-Solutions/squareup/blob/main/src/server/webcrypto.ts#L78)

Verify a Square webhook signature with WebCrypto (edge-safe, async).

The same check as [verifySignature](verifySignature.md), HMAC-SHA256 over
`notificationUrl + rawBody` compared in constant time, but computed with
`globalThis.crypto.subtle` instead of `node:crypto`. Use it on Deno,
Supabase Edge Functions, Cloudflare Workers or Bun, where `node:crypto` may
be missing. WebCrypto is promise-based, so this returns a `Promise`.

On Node, the synchronous [verifySignature](verifySignature.md) is still available and is
what the Express, Next.js and Lambda adapters use.

## Parameters

### rawBody

`string`

The raw request body as a string

### signature

`string`

The signature from the x-square-hmacsha256-signature header

### signatureKey

`string`

Your webhook signature key from Square

### notificationUrl?

`string`

The URL registered on the webhook subscription (Square signs it)

## Returns

`Promise`\<[`WebhookVerificationResult`](../interfaces/WebhookVerificationResult.md)\>

Verification result with valid flag and optional error

## Example

```typescript
import { verifySignatureAsync, SIGNATURE_HEADER } from '@bates-solutions/squareup/server/web';

const rawBody = await request.text();
const result = await verifySignatureAsync(
  rawBody,
  request.headers.get(SIGNATURE_HEADER) ?? '',
  Deno.env.get('SQUARE_WEBHOOK_KEY')!,
  'https://example.com/webhook'
);

if (!result.valid) {
  return Response.json({ error: result.error }, { status: 401 });
}
```
