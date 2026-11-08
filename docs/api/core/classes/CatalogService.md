[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / CatalogService

# Class: CatalogService

Defined in: [core/services/catalog.service.ts:305](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L305)

Catalog service for managing Square catalog items

## Example

```typescript
// Create an item with variations
const item = await square.catalog.createItem({
  name: 'Coffee',
  variations: [
    { name: 'Small', price: 350 },
    { name: 'Large', price: 450 },
  ],
});

// Search items
const results = await square.catalog.search({
  objectTypes: ['ITEM'],
  query: 'coffee',
});
```

## Constructors

### Constructor

> **new CatalogService**(`client`, `defaultCurrency?`): `CatalogService`

Defined in: [core/services/catalog.service.ts:306](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L306)

#### Parameters

##### client

`SquareClient`

##### defaultCurrency?

`"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"`

#### Returns

`CatalogService`

## Methods

### batchGet()

> **batchGet**(`objectIds`): `Promise`\<`CatalogObject`[]\>

Defined in: [core/services/catalog.service.ts:972](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L972)

Batch retrieve multiple catalog objects

#### Parameters

##### objectIds

`string`[]

Array of object IDs to retrieve

#### Returns

`Promise`\<`CatalogObject`[]\>

Array of catalog objects

#### Example

```typescript
const items = await square.catalog.batchGet(['ITEM_1', 'ITEM_2', 'ITEM_3']);
```

***

### createCategory()

> **createCategory**(`options`): `Promise`\<`CatalogObject`\>

Defined in: [core/services/catalog.service.ts:393](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L393)

Create a category

#### Parameters

##### options

`CreateCategoryOptions`

Category creation options

#### Returns

`Promise`\<`CatalogObject`\>

Created category

#### Example

```typescript
const category = await square.catalog.createCategory({
  name: 'Beverages',
});
```

***

### createItem()

> **createItem**(`options`): `Promise`\<`CatalogObject`\>

Defined in: [core/services/catalog.service.ts:330](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L330)

Create a catalog item with variations

#### Parameters

##### options

`CreateCatalogItemOptions`

Item creation options

#### Returns

`Promise`\<`CatalogObject`\>

Created catalog object

#### Example

```typescript
const item = await square.catalog.createItem({
  name: 'Latte',
  description: 'Espresso with steamed milk',
  variations: [
    { name: 'Small', price: 400, sku: 'LATTE-S' },
    { name: 'Medium', price: 500, sku: 'LATTE-M' },
    { name: 'Large', price: 600, sku: 'LATTE-L' },
  ],
});
```

***

### createPricingRule()

> **createPricingRule**(`options`): `Promise`\<`CatalogObject`\>

Defined in: [core/services/catalog.service.ts:494](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L494)

Create a pricing rule that applies a discount to a product set, optionally
restricted to members of given customer groups.

#### Parameters

##### options

`CreatePricingRuleOptions`

#### Returns

`Promise`\<`CatalogObject`\>

#### Example

```typescript
const rule = await square.catalog.createPricingRule({
  name: 'Wholesale 20% off',
  matchProductsId: productSet.id,
  discountId: discount.id,
  customerGroupIdsAny: [wholesaleGroup.id],
});
```

***

### createProductSet()

> **createProductSet**(`options`): `Promise`\<`CatalogObject`\>

Defined in: [core/services/catalog.service.ts:433](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L433)

Create a product set — a named collection of catalog objects used as the
match target of a pricing rule.

#### Parameters

##### options

`CreateProductSetOptions`

#### Returns

`Promise`\<`CatalogObject`\>

#### Example

```typescript
const set = await square.catalog.createProductSet({
  name: 'Wholesale items',
  productIdsAny: ['VAR_1', 'VAR_2'],
});
```

***

### createTimePeriod()

> **createTimePeriod**(`options`): `Promise`\<`CatalogObject`\>

Defined in: [core/services/catalog.service.ts:556](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L556)

Create a time period (RFC 5545 iCalendar VEVENT) for use in time-bounded
pricing rules, e.g. happy-hour discounts.

#### Parameters

##### options

`CreateTimePeriodOptions`

#### Returns

`Promise`\<`CatalogObject`\>

#### Example

```typescript
const happyHour = await square.catalog.createTimePeriod({
  event: 'DTSTART:20260101T170000\nDURATION:PT2H\nRRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
});
```

***

### createWholesalePricing()

> **createWholesalePricing**(`options`): `Promise`\<`WholesalePricingResult`\>

Defined in: [core/services/catalog.service.ts:604](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L604)

Create a complete wholesale pricing configuration in a single atomic
batch upsert: a product set, a discount, and a pricing rule that links
them to the given customer group.

The three objects are created together with temporary IDs so the pricing
rule can reference the just-created product set and discount. The customer
group must already exist — create it via `square.customerGroups.create`.

#### Parameters

##### options

`CreateWholesalePricingOptions`

#### Returns

`Promise`\<`WholesalePricingResult`\>

#### Example

```typescript
const group = await square.customerGroups.create({ name: 'Wholesale' });
const result = await square.catalog.createWholesalePricing({
  name: 'Wholesale 20% off',
  customerGroupId: group.id!,
  itemVariationIds: ['VAR_1', 'VAR_2'],
  discount: { percentage: '20' },
});
```

***

### delete()

> **delete**(`objectId`): `Promise`\<`void`\>

Defined in: [core/services/catalog.service.ts:783](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L783)

Delete a catalog object

#### Parameters

##### objectId

`string`

Catalog object ID to delete

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await square.catalog.delete('ITEM_123');
```

***

### findVariationsByCode()

> **findVariationsByCode**(`options`): `Promise`\<[`FindVariationsByCodeResult`](../interfaces/FindVariationsByCodeResult.md)\>

Defined in: [core/services/catalog.service.ts:861](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L861)

Find item variations by UPC (barcode) or SKU, without listing the whole
catalog. Pages through every match, and returns the parent items too.

Codes are matched exactly, not normalized: a UPC-A `012345678905` won't
find the same barcode stored as EAN-13 `0012345678905`. Pass both forms if
the catalog may hold either.

#### Parameters

##### options

[`FindVariationsByCodeOptions`](../interfaces/FindVariationsByCodeOptions.md)

UPCs and/or SKUs to match (exact, case insensitive)

#### Returns

`Promise`\<[`FindVariationsByCodeResult`](../interfaces/FindVariationsByCodeResult.md)\>

The matching variations and their parent items

#### Example

```typescript
const { variations, items } = await square.catalog.findVariationsByCode({
  upcs: ['012345678905'],
  skus: ['PICKLE-DILL-500'],
});
for (const v of variations) {
  const item = items.find((i) => i.id === v.itemVariationData?.itemId);
  console.log(item?.itemData?.name, v.itemVariationData?.upc);
}
```

***

### get()

> **get**(`objectId`): `Promise`\<`CatalogObject`\>

Defined in: [core/services/catalog.service.ts:755](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L755)

Get a catalog object by ID

#### Parameters

##### objectId

`string`

Catalog object ID

#### Returns

`Promise`\<`CatalogObject`\>

Catalog object

#### Example

```typescript
const item = await square.catalog.get('ITEM_123');
```

***

### list()

> **list**(`objectType`, `options?`): `Promise`\<`CatalogObject`[]\>

Defined in: [core/services/catalog.service.ts:927](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L927)

List all catalog objects of a specific type

#### Parameters

##### objectType

`CatalogObjectType`

Type of objects to list

##### options?

List options

###### limit?

`number`

#### Returns

`Promise`\<`CatalogObject`[]\>

Array of catalog objects

#### Example

```typescript
const items = await square.catalog.list('ITEM', { limit: 50 });
```

***

### search()

> **search**(`options?`): `Promise`\<\{ `cursor?`: `string`; `data`: `CatalogObject`[]; \}\>

Defined in: [core/services/catalog.service.ts:811](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L811)

Search the catalog

#### Parameters

##### options?

`SearchCatalogOptions`

Search options

#### Returns

`Promise`\<\{ `cursor?`: `string`; `data`: `CatalogObject`[]; \}\>

Matching catalog objects with pagination

#### Example

```typescript
// Search for items
const results = await square.catalog.search({
  objectTypes: ['ITEM'],
  query: 'coffee',
});

// Get all categories
const categories = await square.catalog.search({
  objectTypes: ['CATEGORY'],
});
```

***

### upsert()

> **upsert**(`catalogObject`, `idempotencyKey?`): `Promise`\<`CatalogObject`\>

Defined in: [core/services/catalog.service.ts:723](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/catalog.service.ts#L723)

Upsert (create or update) a catalog object

#### Parameters

##### catalogObject

`CatalogObject`

The catalog object to upsert

##### idempotencyKey?

`string`

Optional idempotency key

#### Returns

`Promise`\<`CatalogObject`\>

The upserted catalog object

#### Example

```typescript
// Update an existing item's custom attributes
const updatedItem = await square.catalog.upsert({
  type: 'ITEM',
  id: 'EXISTING_ITEM_ID',
  version: existingItem.version,
  customAttributeValues: {
    'Square:some-key': { stringValue: 'new value' }
  },
  itemData: existingItem.itemData,
});

// Update a variation price
const updatedVariation = await square.catalog.upsert({
  type: 'ITEM_VARIATION',
  id: 'EXISTING_VARIATION_ID',
  version: existingVariation.version,
  itemVariationData: {
    ...existingVariation.itemVariationData,
    priceMoney: { amount: BigInt(500), currency: 'USD' },
  },
});
```
