[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / createIdempotencyKey

# Function: createIdempotencyKey()

> **createIdempotencyKey**(): `string`

Defined in: [core/utils.ts:105](https://github.com/Bates-Solutions/squareup/blob/main/src/core/utils.ts#L105)

Create a unique idempotency key for Square API requests

Uses `globalThis.crypto.randomUUID()`, available on Node 22+, Deno, Bun, and
Cloudflare Workers.

## Returns

`string`

UUID string

## Example

```typescript
const key = createIdempotencyKey();
// "550e8400-e29b-41d4-a716-446655440000"
```
