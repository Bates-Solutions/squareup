[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / OrdersService

# Class: OrdersService

Defined in: [core/services/orders.service.ts:30](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/orders.service.ts#L30)

Orders service for managing Square orders

## Example

```typescript
// Using the builder (recommended)
const order = await square.orders
  .builder()
  .addItem({ name: 'Latte', amount: 450 })
  .withCustomer('CUST_123')
  .build();

// Or create directly
const order = await square.orders.create({
  lineItems: [{ name: 'Latte', amount: 450 }],
});
```

## Constructors

### Constructor

> **new OrdersService**(`client`, `defaultLocationId?`, `defaultCurrency?`): `OrdersService`

Defined in: [core/services/orders.service.ts:31](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/orders.service.ts#L31)

#### Parameters

##### client

`SquareClient`

##### defaultLocationId?

`string`

##### defaultCurrency?

`"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"` = `'USD'`

#### Returns

`OrdersService`

## Methods

### builder()

> **builder**(`locationId?`): [`OrderBuilder`](OrderBuilder.md)

Defined in: [core/services/orders.service.ts:53](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/orders.service.ts#L53)

Create a new order builder

#### Parameters

##### locationId?

`string`

Optional location ID (uses default if not provided)

#### Returns

[`OrderBuilder`](OrderBuilder.md)

Order builder instance

#### Example

```typescript
const order = await square.orders
  .builder()
  .addItem({ name: 'Coffee', amount: 350 })
  .addItem({ name: 'Muffin', amount: 250 })
  .withTip(100)
  .build();
```

***

### create()

> **create**(`options`, `locationId?`): `Promise`\<[`Order`](../interfaces/Order.md)\>

Defined in: [core/services/orders.service.ts:82](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/orders.service.ts#L82)

Create an order directly (without builder)

#### Parameters

##### options

[`CreateOrderOptions`](../interfaces/CreateOrderOptions.md)

Order creation options

##### locationId?

`string`

Optional location ID

#### Returns

`Promise`\<[`Order`](../interfaces/Order.md)\>

Created order

#### Example

```typescript
const order = await square.orders.create({
  lineItems: [
    { name: 'Coffee', amount: 350 },
    { catalogObjectId: 'ITEM_123', quantity: 2 },
  ],
  customerId: 'CUST_123',
});
```

***

### get()

> **get**(`orderId`): `Promise`\<[`Order`](../interfaces/Order.md)\>

Defined in: [core/services/orders.service.ts:140](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/orders.service.ts#L140)

Get an order by ID

#### Parameters

##### orderId

`string`

Order ID

#### Returns

`Promise`\<[`Order`](../interfaces/Order.md)\>

Order details

#### Example

```typescript
const order = await square.orders.get('ORDER_123');
```

***

### pay()

> **pay**(`orderId`, `paymentIds`, `options?`): `Promise`\<[`Order`](../interfaces/Order.md)\>

Defined in: [core/services/orders.service.ts:215](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/orders.service.ts#L215)

Pay for an order

#### Parameters

##### orderId

`string`

Order ID

##### paymentIds

`string`[]

Payment IDs to apply

##### options?

###### idempotencyKey?

`string`

Reuse the same key when retrying

#### Returns

`Promise`\<[`Order`](../interfaces/Order.md)\>

Updated order

#### Example

```typescript
const order = await square.orders.pay('ORDER_123', ['PAYMENT_456']);
```

***

### search()

> **search**(`options?`): `Promise`\<\{ `cursor?`: `string`; `data`: [`Order`](../interfaces/Order.md)[]; \}\>

Defined in: [core/services/orders.service.ts:278](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/orders.service.ts#L278)

Search for orders

#### Parameters

##### options?

[`SearchOrdersOptions`](../interfaces/SearchOrdersOptions.md)

Search options including query filters and sort

#### Returns

`Promise`\<\{ `cursor?`: `string`; `data`: [`Order`](../interfaces/Order.md)[]; \}\>

Paginated list of orders

#### Example

```typescript
// Simple search
const { data, cursor } = await square.orders.search({
  locationIds: ['LXXX'],
  limit: 10,
});

// Search with filters
const { data } = await square.orders.search({
  locationIds: ['LXXX'],
  query: {
    filter: {
      dateTimeFilter: {
        createdAt: {
          startAt: '2024-01-01T00:00:00Z',
          endAt: '2024-12-31T23:59:59Z',
        },
      },
      stateFilter: {
        states: ['OPEN', 'COMPLETED'],
      },
      fulfillmentFilter: {
        fulfillmentTypes: ['PICKUP', 'SHIPMENT'],
      },
    },
    sort: {
      sortField: 'CREATED_AT',
      sortOrder: 'DESC',
    },
  },
});
```

***

### searchRecent()

> **searchRecent**(`options?`): `Promise`\<\{ `cursor?`: `string`; `data`: [`Order`](../interfaces/Order.md)[]; \}\>

Defined in: [core/services/orders.service.ts:333](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/orders.service.ts#L333)

Search for recent orders with simplified filter options

#### Parameters

##### options?

[`SearchRecentOrdersOptions`](../interfaces/SearchRecentOrdersOptions.md)

Simplified search options

#### Returns

`Promise`\<\{ `cursor?`: `string`; `data`: [`Order`](../interfaces/Order.md)[]; \}\>

Paginated list of orders

#### Example

```typescript
// Get completed orders from the last hour
const { data } = await square.orders.searchRecent({
  states: ['COMPLETED'],
  since: new Date(Date.now() - 60 * 60 * 1000),
});

// Get first page of orders from a date range
const { data, cursor } = await square.orders.searchRecent({
  since: new Date('2024-01-01'),
  until: new Date('2024-01-31'),
  limit: 50,
});

// Fetch next page
const page2 = await square.orders.searchRecent({
  since: new Date('2024-01-01'),
  until: new Date('2024-01-31'),
  cursor,
  limit: 50,
});
```

***

### update()

> **update**(`orderId`, `updates`, `locationId?`): `Promise`\<[`Order`](../interfaces/Order.md)\>

Defined in: [core/services/orders.service.ts:163](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/orders.service.ts#L163)

Update an order

#### Parameters

##### orderId

`string`

Order ID to update

##### updates

Update fields. Pass `idempotencyKey` and reuse it when
  retrying so Square deduplicates the request.

###### idempotencyKey?

`string`

###### referenceId?

`string`

###### version

`number`

##### locationId?

`string`

#### Returns

`Promise`\<[`Order`](../interfaces/Order.md)\>

Updated order
