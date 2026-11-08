[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / isRetryableSquareError

# Function: isRetryableSquareError()

> **isRetryableSquareError**(`error`): `boolean`

Defined in: [core/errors.ts:208](https://github.com/Bates-Solutions/squareup/blob/main/src/core/errors.ts#L208)

Whether retrying the failed call could succeed: a network failure or
timeout, a request timeout (408), rate limiting (429), or a Square server
error (5xx). Validation,
auth and other 4xx errors return `false`.

For a mutating call, retry with the **same** `idempotencyKey`. Otherwise a
request that reached Square before the failure can be applied twice.

## Parameters

### error

`unknown`

## Returns

`boolean`

## Example

```typescript
const idempotencyKey = createIdempotencyKey();
try {
  await square.payments.create({ sourceId, amount, idempotencyKey });
} catch (error) {
  if (isRetryableSquareError(error)) {
    await square.payments.create({ sourceId, amount, idempotencyKey }); // same key
  } else {
    throw error;
  }
}
```
