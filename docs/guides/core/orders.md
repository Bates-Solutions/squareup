# Managing Orders

This guide covers how to create and manage orders using the Square API with `@bates-solutions/squareup`.

## Prerequisites

- Square account with API credentials
- `@bates-solutions/squareup` installed
- Access token from Square Developer Dashboard

## Setup

```typescript
import { createIdempotencyKey, createSquareClient } from '@bates-solutions/squareup';

const square = createSquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: 'sandbox',
  locationId: 'YOUR_LOCATION_ID',
});
```

## Creating Orders with the Builder

The recommended way to create orders is using the fluent builder API:

```typescript
const order = await square.orders
  .builder()
  .addItem({ name: 'Latte', amount: 450 })
  .addItem({ name: 'Croissant', amount: 350 })
  .build();

console.log('Order ID:', order.id);
console.log('Total:', order.totalMoney?.amount);
```

### Builder Methods

```typescript
const order = await square.orders
  .builder()
  // Add items (required)
  .addItem({ name: 'Coffee', amount: 350 })
  .addItem({ catalogObjectId: 'ITEM_123', quantity: 2 })

  // Optional settings
  .withCurrency('USD')           // Set currency (default: USD)
  .withTip(100)                  // Add tip ($1.00)
  .withCustomer('CUST_123')      // Associate customer
  .withReference('ext-order-1')  // External reference ID
  .build();
```

### Ad-hoc Line Items

For items without a catalog entry:

```typescript
const order = await square.orders
  .builder()
  .addItem({
    name: 'Custom Service',
    amount: 2500,      // $25.00 in cents
    quantity: 1,       // Default: 1
    note: 'Special request',
  })
  .build();
```

### Catalog Line Items

For items from your Square catalog:

```typescript
const order = await square.orders
  .builder()
  .addItem({
    catalogObjectId: 'ITEM_VARIATION_123',
    quantity: 3,
  })
  .build();
```

### Adding Multiple Items

```typescript
const items = [
  { name: 'Latte', amount: 450 },
  { name: 'Muffin', amount: 350 },
  { catalogObjectId: 'ITEM_123' },
];

const order = await square.orders
  .builder()
  .addItems(items)
  .build();
```

### Previewing Before Creating

Check the order configuration before submitting:

```typescript
const builder = square.orders
  .builder()
  .addItem({ name: 'Test Item', amount: 100 })
  .withCustomer('CUST_123');

const preview = builder.preview();
console.log('Will create:', preview);
// {
//   locationId: 'LXXX',
//   lineItems: [...],
//   customerId: 'CUST_123',
//   currency: 'USD'
// }

// If satisfied, create the order
const order = await builder.build();
```

## Creating Orders Directly

For simpler cases, create orders without the builder:

```typescript
const order = await square.orders.create({
  lineItems: [
    { name: 'Coffee', amount: 350 },
    { catalogObjectId: 'ITEM_123', quantity: 2 },
  ],
  customerId: 'CUST_123',
  referenceId: 'my-order-ref',
});
```

## Order Templates

A **DRAFT** order becomes a reusable template — most commonly the source for a subscription phase (see [Subscriptions Guide](./subscriptions.md#product-driven-subscriptions)).

> ⚠️ **A subscription order template must not set `autoApplyDiscounts`.** Square rejects it
> (`The order template amount must not have auto_apply_discounts set to true`). Make the amount
> explicit instead — reference catalog `discounts` (recommended, below) or set `basePriceMoney`
> per line. `asTemplate()` / `autoApplyDiscounts` are for **non-subscription** DRAFT orders only.

### Subscription templates: explicit `discounts` (catalog-authoritative)

Reference a `CatalogDiscount` by id so the amount **tracks the catalog** rather than being copied into the order — so changing a wholesale rate reprices existing subscriptions:

```typescript
const template = await square.orders.create({
  lineItems: [
    // Line-scoped discounts must be listed on the line they apply to.
    { catalogObjectId: 'VAR_1', quantity: 2, appliedDiscounts: [{ discountUid: 'wholesale' }] },
  ],
  discounts: [
    { uid: 'wholesale', catalogObjectId: 'DISCOUNT_1', scope: 'LINE_ITEM' },
    // An ORDER-scoped discount is auto-applied to every line:
    // { uid: 'promo', catalogObjectId: 'DISCOUNT_2', scope: 'ORDER' },
  ],
  state: 'DRAFT',
});
```

`ORDER`-scoped discounts apply to the whole order; `LINE_ITEM`-scoped discounts apply only to lines that reference the discount's `uid` in `appliedDiscounts` — the builder validates that these line up and throws a `SquareValidationError` if a reference dangles or a `LINE_ITEM` discount goes unreferenced. You can also define an ad-hoc discount inline with `type` + `percentage`/`amountMoney` instead of `catalogObjectId`.

### Subscription templates: explicit `basePriceMoney`

If you'd rather pin the price at creation (it will **not** reprice when the catalog changes):

```typescript
.addItem({ name: 'Wholesale bundle', basePriceMoney: { amount: 2499, currency: 'USD' } })
```

### Non-subscription DRAFT orders: `asTemplate()` / `autoApplyDiscounts`

For a **non-subscription** DRAFT/OPEN order, `autoApplyDiscounts: true` makes Square re-evaluate catalog pricing rules at calculation time, so customer-group-gated wholesale tiers, time-bounded promos, and other rules applied via [`catalog.createPricingRule`](./catalog.md#wholesale-pricing) fire automatically. `asTemplate()` is shorthand for `state: 'DRAFT'` + `pricingOptions.autoApplyDiscounts: true`:

```typescript
const order = await square.orders
  .builder()
  .addItem({ catalogObjectId: 'VAR_1', quantity: 2 })
  .asTemplate()
  .build();
```

### Stable Idempotency for Retries

Templates tied to specific orders (e.g. per retailer per month) benefit from deterministic idempotency keys:

```typescript
.withIdempotencyKey(`wholesale-template-${retailerId}-${yyyyMm}`)
```

## Getting Order Details

```typescript
const order = await square.orders.get('ORDER_123');

console.log('State:', order.state);
console.log('Total:', order.totalMoney?.amount);
console.log('Items:', order.lineItems?.length);
console.log('Customer:', order.customerId);
```

## Searching Orders

### Basic Search

```typescript
// Search with default location
const { data: orders, cursor } = await square.orders.search({
  limit: 20,
});

// Search specific locations
const { data: multiLocationOrders } = await square.orders.search({
  locationIds: ['LOC_1', 'LOC_2'],
  limit: 50,
});

// Paginate through results
let nextCursor: string | undefined;
do {
  const { data, cursor } = await square.orders.search({
    cursor: nextCursor,
    limit: 100,
  });

  for (const order of data) {
    console.log(order.id, order.state);
  }

  nextCursor = cursor;
} while (nextCursor);
```

### Search with Filters

Filter orders by date, state, fulfillment type, and more:

```typescript
const { data: filteredOrders } = await square.orders.search({
  locationIds: ['LXXX'],
  query: {
    filter: {
      // Filter by creation date range
      dateTimeFilter: {
        createdAt: {
          startAt: '2024-01-01T00:00:00Z',
          endAt: '2024-12-31T23:59:59Z',
        },
      },
      // Filter by order state
      stateFilter: {
        states: ['OPEN', 'COMPLETED'],
      },
      // Filter by fulfillment type
      fulfillmentFilter: {
        fulfillmentTypes: ['PICKUP', 'SHIPMENT'],
      },
    },
    // Sort results
    sort: {
      sortField: 'CREATED_AT',
      sortOrder: 'DESC',
    },
  },
});
```

### Filter Options

| Filter | Description |
|--------|-------------|
| `dateTimeFilter` | Filter by `createdAt`, `updatedAt`, or `closedAt` date ranges |
| `stateFilter` | Filter by order states: `OPEN`, `COMPLETED`, `CANCELED`, `DRAFT` |
| `fulfillmentFilter` | Filter by fulfillment types: `PICKUP`, `SHIPMENT`, `DELIVERY` |
| `sourceFilter` | Filter by order source names |
| `customerFilter` | Filter by customer IDs |

### Sort Options

| Sort Field | Description |
|------------|-------------|
| `CREATED_AT` | Sort by order creation time |
| `UPDATED_AT` | Sort by last update time |
| `CLOSED_AT` | Sort by order close time |

**Important:** When using `dateTimeFilter`, the `sortField` must match the filter field (e.g., filter by `createdAt` requires `sortField: 'CREATED_AT'`).

## Updating Orders

```typescript
// Get current order first (need version for updates)
const order = await square.orders.get('ORDER_123');

// Update the order
const updated = await square.orders.update('ORDER_123', {
  version: order.version!, // Required for concurrency control
  referenceId: 'new-reference',
  idempotencyKey: 'order-123-ref-update', // optional; reuse it on retry
});
```

The update is sparse: only the fields you pass change. `version` must be the order's current version; Square rejects a stale one, so read the order first. On a version error, re-read the order and send the update again with the new `version` and a **new** `idempotencyKey`. Reuse a key only to resend the identical request (after a timeout, say); Square rejects a reused key with a different body.

### Fulfillments

Change a fulfillment by its `uid`. Moving a `SHIPMENT` fulfillment to `COMPLETED` marks it shipped, and Square stamps `shipmentDetails.shippedAt` itself.

```typescript
await square.orders.update('ORDER_123', {
  version: order.version!,
  fulfillments: [
    {
      uid: order.fulfillments![0].uid!,
      state: 'COMPLETED',
      shipmentDetails: {
        carrier: 'Canada Post',
        shippingType: 'Expedited Parcel',
        trackingNumber: '1234567890123456',
        trackingUrl: 'https://www.canadapost-postescanada.ca/track-reperage/en#/details/1234567890123456',
      },
    },
  ],
});
```

Writable shipment fields: `carrier`, `shippingType`, `shippingNote`, `trackingNumber`, `trackingUrl`, `expectedShippedAt`. A fulfillment without a `uid` throws `SquareValidationError` before anything is sent.

### Order state and clearing fields

```typescript
// Cancel an order, or an orphaned DRAFT template
await square.orders.update('ORDER_123', { version: order.version!, state: 'CANCELED' });

// Remove a field, by Square dot path
await square.orders.update('ORDER_123', {
  version: order.version!,
  fieldsToClear: [`fulfillments[${uid}].shipment_details.tracking_url`],
});
```

## Paying for Orders

Apply payments to complete an order:

```typescript
// First, create a payment
const payment = await square.payments.create({
  sourceId: 'cnon:card-nonce-ok',
  amount: 800, // Must match order total
  orderId: 'ORDER_123',
});

// Then, mark the order as paid. Pass an idempotencyKey and reuse it if you retry.
const idempotencyKey = createIdempotencyKey();
const paidOrder = await square.orders.pay('ORDER_123', [payment.id!], { idempotencyKey });
console.log('Order state:', paidOrder.state); // 'COMPLETED'
```

### Pay with Multiple Payments

```typescript
// Split payment example
const payment1 = await square.payments.create({
  sourceId: 'cnon:card-nonce-1',
  amount: 500,
  orderId: 'ORDER_123',
});

const payment2 = await square.payments.create({
  sourceId: 'cnon:card-nonce-2',
  amount: 300,
  orderId: 'ORDER_123',
});

const paidOrder = await square.orders.pay('ORDER_123', [
  payment1.id!,
  payment2.id!,
]);
```

## Order States

| State | Description |
|-------|-------------|
| `OPEN` | Order created, awaiting payment |
| `COMPLETED` | Order paid and fulfilled |
| `CANCELED` | Order was canceled |

## Complete Checkout Flow

```typescript
import { createSquareClient } from '@bates-solutions/squareup';

async function checkout(
  items: Array<{ name: string; amount: number }>,
  paymentToken: string,
  customerId?: string
) {
  const square = createSquareClient({
    accessToken: process.env.SQUARE_ACCESS_TOKEN!,
    environment: 'sandbox',
    locationId: process.env.SQUARE_LOCATION_ID!,
  });

  // 1. Create the order
  const builder = square.orders.builder();

  for (const item of items) {
    builder.addItem(item);
  }

  if (customerId) {
    builder.withCustomer(customerId);
  }

  const order = await builder.build();

  // 2. Create payment for the order
  const payment = await square.payments.create({
    sourceId: paymentToken,
    amount: Number(order.totalMoney?.amount ?? 0),
    orderId: order.id,
    customerId,
  });

  // 3. Mark order as paid
  const paidOrder = await square.orders.pay(order.id!, [payment.id!]);

  return {
    orderId: paidOrder.id,
    paymentId: payment.id,
    total: paidOrder.totalMoney?.amount,
  };
}

// Usage
const result = await checkout(
  [
    { name: 'Latte', amount: 450 },
    { name: 'Muffin', amount: 350 },
  ],
  'cnon:card-nonce-ok',
  'CUST_123'
);
```

## Error Handling

```typescript
import {
  SquareValidationError,
  SquareApiError,
} from '@bates-solutions/squareup';

try {
  const order = await square.orders
    .builder()
    .addItem({ name: 'Item', amount: 100 })
    .build();
} catch (error) {
  if (error instanceof SquareValidationError) {
    console.error('Validation error:', error.message);
    console.error('Field:', error.field);
  } else if (error instanceof SquareApiError) {
    console.error('API error:', error.statusCode);
    console.error('Details:', error.errors);
  }
}
```

## Best Practices

1. **Use the builder** - It provides validation and a cleaner API
2. **Associate customers** - Links orders to customer profiles for tracking
3. **Use reference IDs** - Map to your internal order system
4. **Handle versions** - Use `version` field for safe concurrent updates
5. **Complete atomically** - Create payment and mark paid in one flow

## Next Steps

- [Payments Guide](./payments.md) - Process payments for orders
- [Customers Guide](./customers.md) - Associate customers with orders
- [Catalog Guide](./catalog.md) - Use catalog items in orders
