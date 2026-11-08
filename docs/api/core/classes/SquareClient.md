[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / SquareClient

# Class: SquareClient

Defined in: [core/client.ts:65](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L65)

Main Square client wrapper

## Example

```typescript
const square = createSquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: 'sandbox',
  locationId: 'LXXX',
});

// Create a payment
const payment = await square.payments.create({
  sourceId: 'cnon:card-nonce-ok',
  amount: 1000, // $10.00
});
```

## Constructors

### Constructor

> **new SquareClient**(`config`): `SquareClient`

Defined in: [core/client.ts:88](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L88)

#### Parameters

##### config

[`SquareClientConfig`](../interfaces/SquareClientConfig.md)

#### Returns

`SquareClient`

## Properties

### catalog

> `readonly` **catalog**: [`CatalogService`](CatalogService.md)

Defined in: [core/client.ts:75](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L75)

***

### checkout

> `readonly` **checkout**: [`CheckoutService`](CheckoutService.md)

Defined in: [core/client.ts:80](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L80)

***

### customerGroups

> `readonly` **customerGroups**: [`CustomerGroupsService`](CustomerGroupsService.md)

Defined in: [core/client.ts:74](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L74)

***

### customers

> `readonly` **customers**: [`CustomersService`](CustomersService.md)

Defined in: [core/client.ts:73](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L73)

***

### giftCards

> `readonly` **giftCards**: [`GiftCardsService`](GiftCardsService.md)

Defined in: [core/client.ts:81](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L81)

***

### inventory

> `readonly` **inventory**: [`InventoryService`](InventoryService.md)

Defined in: [core/client.ts:76](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L76)

***

### invoices

> `readonly` **invoices**: [`InvoicesService`](InvoicesService.md)

Defined in: [core/client.ts:78](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L78)

***

### locations

> `readonly` **locations**: [`LocationsService`](LocationsService.md)

Defined in: [core/client.ts:82](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L82)

***

### loyalty

> `readonly` **loyalty**: [`LoyaltyService`](LoyaltyService.md)

Defined in: [core/client.ts:79](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L79)

***

### oauth

> `readonly` **oauth**: [`OAuthService`](OAuthService.md)

Defined in: [core/client.ts:84](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L84)

OAuth token status for this client's access token (`oauth.tokenStatus()`)

***

### orders

> `readonly` **orders**: [`OrdersService`](OrdersService.md)

Defined in: [core/client.ts:72](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L72)

***

### payments

> `readonly` **payments**: [`PaymentsService`](PaymentsService.md)

Defined in: [core/client.ts:71](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L71)

***

### subscriptions

> `readonly` **subscriptions**: [`SubscriptionsService`](SubscriptionsService.md)

Defined in: [core/client.ts:77](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L77)

***

### webhooks

> `readonly` **webhooks**: `object`

Defined in: [core/client.ts:86](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L86)

Webhook subscription management (`webhooks.subscriptions.*`)

#### subscriptions

> **subscriptions**: [`WebhookSubscriptionsService`](WebhookSubscriptionsService.md)

## Accessors

### environment

#### Get Signature

> **get** **environment**(): [`SquareEnvironment`](../type-aliases/SquareEnvironment.md)

Defined in: [core/client.ts:151](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L151)

Get the current environment

##### Returns

[`SquareEnvironment`](../type-aliases/SquareEnvironment.md)

***

### locationId

#### Get Signature

> **get** **locationId**(): `string` \| `undefined`

Defined in: [core/client.ts:144](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L144)

Get the current location ID

##### Returns

`string` \| `undefined`

***

### sdk

#### Get Signature

> **get** **sdk**(): `SquareClient`

Defined in: [core/client.ts:137](https://github.com/Bates-Solutions/squareup/blob/main/src/core/client.ts#L137)

Get the underlying Square SDK client
Use this for advanced operations not covered by the wrapper

##### Returns

`SquareClient`
