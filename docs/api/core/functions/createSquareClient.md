[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / createSquareClient

# Function: createSquareClient()

> **createSquareClient**(`config`): [`SquareClient`](../classes/SquareClient.md)

Defined in: [core/client.ts:170](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L170)

Create a new Square client instance

## Parameters

### config

[`SquareClientConfig`](../interfaces/SquareClientConfig.md)

Client configuration

## Returns

[`SquareClient`](../classes/SquareClient.md)

Configured Square client

## Example

```typescript
const square = createSquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: 'sandbox',
});
```
