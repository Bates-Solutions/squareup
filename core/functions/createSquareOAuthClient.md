[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / createSquareOAuthClient

# Function: createSquareOAuthClient()

> **createSquareOAuthClient**(`config`): [`SquareOAuthClient`](../classes/SquareOAuthClient.md)

Defined in: [core/oauth.ts:370](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L370)

Create an OAuth client for the application-credential endpoints.

## Parameters

### config

[`SquareOAuthClientConfig`](../interfaces/SquareOAuthClientConfig.md)

## Returns

[`SquareOAuthClient`](../classes/SquareOAuthClient.md)

## Example

```typescript
const oauth = createSquareOAuthClient({
  clientId: process.env.SQUARE_APP_ID!,
  clientSecret: process.env.SQUARE_APP_SECRET!,
  environment: 'production',
});
```
