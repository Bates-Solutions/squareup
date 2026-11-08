[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / CheckoutService

# Class: CheckoutService

Defined in: [core/services/checkout.service.ts:395](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/checkout.service.ts#L395)

Checkout service for Square Checkout API

## Example

```typescript
const square = createSquareClient({ ... });

// Create a payment link
const link = await square.checkout.paymentLinks.create({
  quickPay: {
    name: 'Auto Detailing',
    priceMoney: { amount: BigInt(5000), currency: 'USD' },
    locationId: 'LXXX',
  },
  checkoutOptions: {
    redirectUrl: 'https://example.com/confirmation',
    askForShippingAddress: true,
  },
  prePopulatedData: {
    buyerEmail: 'customer@example.com',
  },
});

console.log('Checkout URL:', link.url);
```

## Constructors

### Constructor

> **new CheckoutService**(`client`): `CheckoutService`

Defined in: [core/services/checkout.service.ts:398](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/checkout.service.ts#L398)

#### Parameters

##### client

`SquareClient`

#### Returns

`CheckoutService`

## Properties

### paymentLinks

> `readonly` **paymentLinks**: `PaymentLinksService`

Defined in: [core/services/checkout.service.ts:396](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/checkout.service.ts#L396)
