[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / InvoicesService

# Class: InvoicesService

Defined in: [core/services/invoices.service.ts:145](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/invoices.service.ts#L145)

Invoices service for managing Square invoices

## Example

```typescript
// Create an invoice
const invoice = await square.invoices.create({
  customerId: 'CUST_123',
  lineItems: [
    { name: 'Consulting', quantity: 2, amount: 15000 },
  ],
  dueDate: '2024-02-15',
});

// Publish (send) the invoice
await square.invoices.publish(invoice.id, invoice.version);
```

## Constructors

### Constructor

> **new InvoicesService**(`client`, `defaultLocationId?`, `defaultCurrency?`): `InvoicesService`

Defined in: [core/services/invoices.service.ts:146](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/invoices.service.ts#L146)

#### Parameters

##### client

`SquareClient`

##### defaultLocationId?

`string`

##### defaultCurrency?

`"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"` = `'USD'`

#### Returns

`InvoicesService`

## Methods

### cancel()

> **cancel**(`invoiceId`, `version`): `Promise`\<`Invoice`\>

Defined in: [core/services/invoices.service.ts:330](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/invoices.service.ts#L330)

Cancel an invoice

#### Parameters

##### invoiceId

`string`

Invoice ID

##### version

`number`

Invoice version (for optimistic concurrency)

#### Returns

`Promise`\<`Invoice`\>

Cancelled invoice

#### Example

```typescript
const invoice = await square.invoices.cancel('INV_123', 1);
```

***

### create()

> **create**(`options`): `Promise`\<`Invoice`\>

Defined in: [core/services/invoices.service.ts:172](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/invoices.service.ts#L172)

Create a draft invoice

#### Parameters

##### options

`CreateInvoiceOptions`

Invoice creation options

#### Returns

`Promise`\<`Invoice`\>

Created invoice (in DRAFT status)

#### Example

```typescript
const invoice = await square.invoices.create({
  customerId: 'CUST_123',
  lineItems: [
    { name: 'Web Development', quantity: 10, amount: 10000 },
    { name: 'Design Services', quantity: 5, amount: 7500 },
  ],
  title: 'January Services',
  dueDate: '2024-02-01',
  deliveryMethod: 'EMAIL',
});
```

***

### delete()

> **delete**(`invoiceId`, `version`): `Promise`\<`void`\>

Defined in: [core/services/invoices.service.ts:426](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/invoices.service.ts#L426)

Delete a draft invoice

#### Parameters

##### invoiceId

`string`

Invoice ID

##### version

`number`

Invoice version

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await square.invoices.delete('INV_123', 0);
```

***

### get()

> **get**(`invoiceId`): `Promise`\<`Invoice`\>

Defined in: [core/services/invoices.service.ts:266](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/invoices.service.ts#L266)

Get an invoice by ID

#### Parameters

##### invoiceId

`string`

Invoice ID

#### Returns

`Promise`\<`Invoice`\>

Invoice details

#### Example

```typescript
const invoice = await square.invoices.get('INV_123');
```

***

### publish()

> **publish**(`invoiceId`, `version`, `options?`): `Promise`\<`Invoice`\>

Defined in: [core/services/invoices.service.ts:295](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/invoices.service.ts#L295)

Publish (send) an invoice

#### Parameters

##### invoiceId

`string`

Invoice ID

##### version

`number`

Invoice version (for optimistic concurrency)

##### options?

###### idempotencyKey?

`string`

Reuse the same key when retrying

#### Returns

`Promise`\<`Invoice`\>

Published invoice

#### Example

```typescript
const invoice = await square.invoices.publish('INV_123', 0);
console.log(`Invoice sent: ${invoice.publicUrl}`);
```

***

### search()

> **search**(`options?`): `Promise`\<\{ `cursor?`: `string`; `data`: `Invoice`[]; \}\>

Defined in: [core/services/invoices.service.ts:447](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/invoices.service.ts#L447)

Search for invoices

#### Parameters

##### options?

Search options

###### cursor?

`string`

###### customerId?

`string`

###### limit?

`number`

###### locationIds?

`string`[]

#### Returns

`Promise`\<\{ `cursor?`: `string`; `data`: `Invoice`[]; \}\>

Matching invoices with pagination

#### Example

```typescript
const results = await square.invoices.search({
  customerId: 'CUST_123',
});
```

***

### update()

> **update**(`invoiceId`, `version`, `options`): `Promise`\<`Invoice`\>

Defined in: [core/services/invoices.service.ts:363](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/invoices.service.ts#L363)

Update an invoice

#### Parameters

##### invoiceId

`string`

Invoice ID

##### version

`number`

Invoice version (for optimistic concurrency)

##### options

Update options

###### acceptedPaymentMethods?

`AcceptedPaymentMethodsInput`

###### description?

`string`

###### dueDate?

`string`

###### idempotencyKey?

`string`

Reuse the same key when retrying

###### title?

`string`

#### Returns

`Promise`\<`Invoice`\>

Updated invoice

#### Example

```typescript
const invoice = await square.invoices.update('INV_123', 0, {
  title: 'Updated Title',
});
```
