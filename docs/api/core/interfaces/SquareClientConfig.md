[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / SquareClientConfig

# Interface: SquareClientConfig

Defined in: [core/client.ts:23](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L23)

Configuration options for the Square client

## Properties

### accessToken

> **accessToken**: `string`

Defined in: [core/client.ts:27](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L27)

Square API access token

***

### defaultCurrency?

> `optional` **defaultCurrency?**: `string`

Defined in: [core/client.ts:44](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L44)

Default currency code

#### Default

```ts
'USD'
```

***

### environment?

> `optional` **environment?**: [`SquareEnvironment`](../type-aliases/SquareEnvironment.md)

Defined in: [core/client.ts:33](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L33)

Square environment (sandbox or production)

#### Default

```ts
'sandbox'
```

***

### locationId?

> `optional` **locationId?**: `string`

Defined in: [core/client.ts:38](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L38)

Default location ID for operations that require it
