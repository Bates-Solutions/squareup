[**@bates-solutions/squareup API Reference v2.5.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / LocationsService

# Class: LocationsService

Defined in: [core/services/locations.service.ts:33](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/locations.service.ts#L33)

Locations service for reading a merchant's Square locations.

## Example

```typescript
// Derive the merchant's currency instead of configuring it
const [location] = await square.locations.list();
const currency = location?.currency; // e.g. 'CAD'
```

## Constructors

### Constructor

> **new LocationsService**(`client`): `LocationsService`

Defined in: [core/services/locations.service.ts:34](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/locations.service.ts#L34)

#### Parameters

##### client

`SquareClient`

#### Returns

`LocationsService`

## Methods

### get()

> **get**(`locationId`): `Promise`\<[`Location`](../interfaces/Location.md)\>

Defined in: [core/services/locations.service.ts:76](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/locations.service.ts#L76)

Get a single location by ID.

#### Parameters

##### locationId

`string`

Location ID

#### Returns

`Promise`\<[`Location`](../interfaces/Location.md)\>

The location

#### Throws

If Square returns an `errors` body (e.g. missing
  `MERCHANT_PROFILE_READ` scope)

#### Example

```typescript
const location = await square.locations.get('LXXX');
console.log(location.currency); // 'CAD'
```

***

### list()

> **list**(): `Promise`\<[`Location`](../interfaces/Location.md)[]\>

Defined in: [core/services/locations.service.ts:52](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/locations.service.ts#L52)

List all locations for the merchant.

The Square Locations API is not paginated — every location is returned.

#### Returns

`Promise`\<[`Location`](../interfaces/Location.md)[]\>

Array of locations

#### Throws

If Square returns an `errors` body — e.g. the
  access token lacks the `MERCHANT_PROFILE_READ` scope (`code` is
  `INSUFFICIENT_SCOPES`). An empty array always means the merchant
  genuinely has no locations.

#### Example

```typescript
const locations = await square.locations.list();
```
