[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / createWebhookHandler

# Function: createWebhookHandler()

> **createWebhookHandler**(`config`): (`request`) => `Promise`\<`Response`\>

Defined in: [server/middleware/web.ts:65](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/web.ts#L65)

Create a framework-neutral webhook handler built on the Web platform.

Takes a standard `Request` and returns a standard `Response`, using only Web
APIs (`request.text()`, WebCrypto verification via
[verifySignatureAsync](verifySignatureAsync.md), `Response.json`). Neither this module nor
anything it imports uses a Node built-in. It runs
unchanged on any runtime that speaks the Fetch API: Deno (`Deno.serve`),
Supabase Edge Functions, Cloudflare Workers, Bun, Vercel/Netlify edge, and
the Next.js App Router.

Responses:
- `405` for any method other than `POST`
- `401` when the signature header is missing or the signature is invalid
- `500` when the body is not JSON or a handler throws
- `200` with `{ received: true, eventId }` once the handler has run

Square signs `notificationUrl + rawBody`, so set `notificationUrl` to the
exact URL registered on the webhook subscription.

## Parameters

### config

[`WebhookConfig`](../interfaces/WebhookConfig.md)

Webhook configuration

## Returns

An async handler: `(request: Request) => Promise<Response>`

(`request`) => `Promise`\<`Response`\>

## Examples

```typescript
// Supabase Edge Function / Deno
import { createWebhookHandler } from '@bates-solutions/squareup/server/web';

const handler = createWebhookHandler({
  signatureKey: Deno.env.get('SQUARE_WEBHOOK_KEY')!,
  notificationUrl: 'https://example.supabase.co/functions/v1/square-webhook',
  handlers: {
    'payment.updated': async (event) => {
      await markPaid(event.data.id);
    },
  },
});

Deno.serve(handler);
```

```typescript
// Cloudflare Workers
import { createWebhookHandler } from '@bates-solutions/squareup/server/web';

export default {
  fetch(request: Request, env: { SQUARE_WEBHOOK_KEY: string }) {
    return createWebhookHandler({
      signatureKey: env.SQUARE_WEBHOOK_KEY,
      notificationUrl: 'https://example.com/webhook',
      handlers: {},
    })(request);
  },
};
```
