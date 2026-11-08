[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / InventoryService

# Class: InventoryService

Defined in: [core/services/inventory.service.ts:143](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/inventory.service.ts#L143)

Inventory service for managing Square inventory

## Example

```typescript
// Get inventory count for an item
const counts = await square.inventory.getCounts('ITEM_VAR_123');

// Adjust inventory
await square.inventory.adjust({
  catalogObjectId: 'ITEM_VAR_123',
  locationId: 'LXXX',
  quantity: 10,
});
```

## Constructors

### Constructor

> **new InventoryService**(`client`, `defaultLocationId?`): `InventoryService`

Defined in: [core/services/inventory.service.ts:144](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/inventory.service.ts#L144)

#### Parameters

##### client

`SquareClient`

##### defaultLocationId?

`string`

#### Returns

`InventoryService`

## Methods

### adjust()

> **adjust**(`options`): `Promise`\<`InventoryCount`[]\>

Defined in: [core/services/inventory.service.ts:305](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/inventory.service.ts#L305)

Adjust inventory (add or remove stock)

#### Parameters

##### options

Adjustment options

###### catalogObjectId

`string`

###### idempotencyKey?

`string`

###### locationId?

`string`

###### quantity

`number`

###### reason?

`string`

#### Returns

`Promise`\<`InventoryCount`[]\>

Updated inventory counts

#### Example

```typescript
// Add 10 items to stock
await square.inventory.adjust({
  catalogObjectId: 'ITEM_VAR_123',
  locationId: 'LXXX',
  quantity: 10,
});

// Remove 5 items (negative quantity)
await square.inventory.adjust({
  catalogObjectId: 'ITEM_VAR_123',
  locationId: 'LXXX',
  quantity: -5,
});
```

***

### batchChange()

> **batchChange**(`changes`, `idempotencyKey?`): `Promise`\<`InventoryCount`[]\>

Defined in: [core/services/inventory.service.ts:426](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/inventory.service.ts#L426)

Batch apply multiple inventory changes

#### Parameters

##### changes

`InventoryChange`[]

Array of inventory changes

##### idempotencyKey?

`string`

Optional idempotency key

#### Returns

`Promise`\<`InventoryCount`[]\>

Updated inventory counts

#### Example

```typescript
await square.inventory.batchChange([
  {
    type: 'ADJUSTMENT',
    adjustment: {
      catalogObjectId: 'ITEM_1',
      fromState: 'NONE',
      toState: 'IN_STOCK',
      fromLocationId: 'LXXX',
      toLocationId: 'LXXX',
      quantity: '10',
    },
  },
]);
```

***

### batchGetCounts()

> **batchGetCounts**(`catalogObjectIds`, `locationIds?`): `Promise`\<`InventoryCount`[]\>

Defined in: [core/services/inventory.service.ts:199](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/inventory.service.ts#L199)

Batch retrieve inventory counts for multiple objects

#### Parameters

##### catalogObjectIds

`string`[]

Array of catalog object IDs

##### locationIds?

`string`[]

Optional array of location IDs

#### Returns

`Promise`\<`InventoryCount`[]\>

Array of inventory counts

#### Example

```typescript
const counts = await square.inventory.batchGetCounts(
  ['ITEM_VAR_1', 'ITEM_VAR_2'],
  ['LOCATION_1']
);
```

***

### getCounts()

> **getCounts**(`catalogObjectId`, `locationId?`): `Promise`\<`InventoryCount`[]\>

Defined in: [core/services/inventory.service.ts:162](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/inventory.service.ts#L162)

Get inventory counts for a catalog object

#### Parameters

##### catalogObjectId

`string`

Catalog object ID (usually item variation)

##### locationId?

`string`

Optional location ID filter

#### Returns

`Promise`\<`InventoryCount`[]\>

Array of inventory counts

#### Example

```typescript
const counts = await square.inventory.getCounts('ITEM_VAR_123');
console.log(`In stock: ${counts[0].quantity}`);
```

***

### setCount()

> **setCount**(`options`): `Promise`\<`InventoryCount`[]\>

Defined in: [core/services/inventory.service.ts:243](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/inventory.service.ts#L243)

Set the inventory count for an item (physical count)

#### Parameters

##### options

Physical count options

###### catalogObjectId

`string`

###### idempotencyKey?

`string`

###### locationId?

`string`

###### occurredAt?

`string`

###### quantity

`number`

#### Returns

`Promise`\<`InventoryCount`[]\>

Updated inventory counts

#### Example

```typescript
await square.inventory.setCount({
  catalogObjectId: 'ITEM_VAR_123',
  locationId: 'LXXX',
  quantity: 50,
});
```

***

### transfer()

> **transfer**(`options`): `Promise`\<`InventoryCount`[]\>

Defined in: [core/services/inventory.service.ts:365](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/inventory.service.ts#L365)

Transfer inventory between locations

#### Parameters

##### options

Transfer options

###### catalogObjectId

`string`

###### fromLocationId

`string`

###### idempotencyKey?

`string`

###### quantity

`number`

###### toLocationId

`string`

#### Returns

`Promise`\<`InventoryCount`[]\>

Updated inventory counts

#### Example

```typescript
await square.inventory.transfer({
  catalogObjectId: 'ITEM_VAR_123',
  fromLocationId: 'LOCATION_A',
  toLocationId: 'LOCATION_B',
  quantity: 5,
});
```
