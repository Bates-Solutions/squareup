[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / OrderBuilder

# Class: OrderBuilder

Defined in: [core/builders/order.builder.ts:75](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L75)

Fluent builder for creating Square orders

## Example

```typescript
const order = await square.orders
  .builder()
  .addItem({ name: 'Latte', amount: 450 })
  .addItem({ catalogObjectId: 'ITEM_123', quantity: 2 })
  .withTip(100)
  .withCustomer('CUST_123')
  .build();
```

## Constructors

### Constructor

> **new OrderBuilder**(`client`, `locationId`, `defaultCurrency?`): `OrderBuilder`

Defined in: [core/builders/order.builder.ts:86](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L86)

#### Parameters

##### client

`SquareClient`

##### locationId

`string`

##### defaultCurrency?

`"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"` = `'USD'`

#### Returns

`OrderBuilder`

## Methods

### addDiscount()

> **addDiscount**(`discount`): `this`

Defined in: [core/builders/order.builder.ts:188](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L188)

Add an order discount. Reference an existing `CatalogDiscount` by
`catalogObjectId` (price tracks the catalog), or define one inline. For a
`LINE_ITEM`-scoped discount, give it a `uid` and reference that from each
line's `appliedDiscounts`.

#### Parameters

##### discount

[`OrderDiscountInput`](../interfaces/OrderDiscountInput.md)

#### Returns

`this`

#### Example

```typescript
builder
  .addItem({ catalogObjectId: 'ITEM_1', quantity: 1, appliedDiscounts: [{ discountUid: 'wholesale' }] })
  .addDiscount({ uid: 'wholesale', catalogObjectId: 'DISCOUNT_1', scope: 'LINE_ITEM' });
```

***

### addDiscounts()

> **addDiscounts**(`discounts`): `this`

Defined in: [core/builders/order.builder.ts:210](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L210)

Add multiple order discounts at once.

#### Parameters

##### discounts

[`OrderDiscountInput`](../interfaces/OrderDiscountInput.md)[]

#### Returns

`this`

***

### addItem()

> **addItem**(`item`): `this`

Defined in: [core/builders/order.builder.ts:118](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L118)

Add a line item to the order

#### Parameters

##### item

[`LineItemInput`](../interfaces/LineItemInput.md)

Line item details

#### Returns

`this`

Builder instance for chaining

#### Example

```typescript
builder
  .addItem({ name: 'Coffee', amount: 350 })
  .addItem({ catalogObjectId: 'ITEM_123', quantity: 2 })
```

***

### addItems()

> **addItems**(`items`): `this`

Defined in: [core/builders/order.builder.ts:168](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L168)

Add multiple line items at once

#### Parameters

##### items

[`LineItemInput`](../interfaces/LineItemInput.md)[]

Array of line items

#### Returns

`this`

Builder instance for chaining

***

### asTemplate()

> **asTemplate**(): `this`

Defined in: [core/builders/order.builder.ts:291](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L291)

Shorthand for a DRAFT order with `autoApplyDiscounts: true`.

⚠️ **Not valid for a subscription order template** — Square rejects
`auto_apply_discounts` there (`The order template amount must not have
auto_apply_discounts set to true`). For a subscription template, use
`withState('DRAFT')` and make the amount explicit via `addDiscount(...)`
(catalog-authoritative) or per-line `basePriceMoney`. This helper remains
for non-subscription DRAFT orders that do want auto-applied pricing rules.

#### Returns

`this`

***

### build()

> **build**(): `Promise`\<[`Order`](../interfaces/Order.md)\>

Defined in: [core/builders/order.builder.ts:347](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L347)

Build and create the order

#### Returns

`Promise`\<[`Order`](../interfaces/Order.md)\>

Created order

#### Throws

When validation fails

#### Throws

When API call fails

***

### preview()

> **preview**(): `object`

Defined in: [core/builders/order.builder.ts:382](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L382)

Preview the order without creating it
Returns the order configuration that would be sent

#### Returns

`object`

##### currency

> **currency**: `"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"`

##### customerId?

> `optional` **customerId?**: `string`

##### discounts

> **discounts**: `OrderDiscount`[]

##### idempotencyKey?

> `optional` **idempotencyKey?**: `string`

##### lineItems

> **lineItems**: `OrderLineItem`[]

##### locationId

> **locationId**: `string`

##### pricingOptions?

> `optional` **pricingOptions?**: [`OrderPricingOptions`](../interfaces/OrderPricingOptions.md)

##### referenceId?

> `optional` **referenceId?**: `string`

##### state?

> `optional` **state?**: `OrderState`

##### tipAmount?

> `optional` **tipAmount?**: `bigint`

***

### reset()

> **reset**(): `this`

Defined in: [core/builders/order.builder.ts:411](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L411)

Reset the builder to start fresh

#### Returns

`this`

***

### withCurrency()

> **withCurrency**(`currency`): `this`

Defined in: [core/builders/order.builder.ts:100](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L100)

Set the currency for the order

#### Parameters

##### currency

`"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"`

Currency code

#### Returns

`this`

Builder instance for chaining

***

### withCustomer()

> **withCustomer**(`customerId`): `this`

Defined in: [core/builders/order.builder.ts:234](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L234)

Associate a customer with the order

#### Parameters

##### customerId

`string`

Square customer ID

#### Returns

`this`

Builder instance for chaining

***

### withIdempotencyKey()

> **withIdempotencyKey**(`key`): `this`

Defined in: [core/builders/order.builder.ts:299](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L299)

Provide an explicit idempotency key. Useful for retrying subscription
template creation without producing duplicate orders.

#### Parameters

##### key

`string`

#### Returns

`this`

***

### withNote()

> **withNote**(`_note`): `this`

Defined in: [core/builders/order.builder.ts:256](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L256)

Add a note to the order

#### Parameters

##### \_note

`string`

#### Returns

`this`

Builder instance for chaining

***

### withPricingOptions()

> **withPricingOptions**(`options`): `this`

Defined in: [core/builders/order.builder.ts:276](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L276)

Set pricing options. `autoApplyDiscounts: true` is required for templates
that should pick up customer-group pricing rules (wholesale tiers) at each
subscription billing cycle.

#### Parameters

##### options

[`OrderPricingOptions`](../interfaces/OrderPricingOptions.md)

#### Returns

`this`

***

### withReference()

> **withReference**(`referenceId`): `this`

Defined in: [core/builders/order.builder.ts:245](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L245)

Add a reference ID for external tracking

#### Parameters

##### referenceId

`string`

External reference ID

#### Returns

`this`

Builder instance for chaining

***

### withState()

> **withState**(`state`): `this`

Defined in: [core/builders/order.builder.ts:266](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L266)

Set the order state. Use `'DRAFT'` when creating an order template that
will back a subscription phase.

#### Parameters

##### state

`OrderState`

#### Returns

`this`

***

### withTip()

> **withTip**(`amount`): `this`

Defined in: [core/builders/order.builder.ts:223](https://github.com/Bates-Solutions/squareup/blob/main/src/core/builders/order.builder.ts#L223)

Add a tip to the order

#### Parameters

##### amount

`number`

Tip amount in cents

#### Returns

`this`

Builder instance for chaining
