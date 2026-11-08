[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / toCents

# Function: toCents()

> **toCents**(`amount`, `currency?`): `bigint`

Defined in: [core/utils.ts:38](https://github.com/Bates-Solutions/squareup/blob/main/src/core/utils.ts#L38)

Convert a dollar amount to cents (smallest currency unit)

## Parameters

### amount

`number`

Dollar amount (e.g., 10.50)

### currency?

`"USD"` \| `"CAD"` \| `"GBP"` \| `"EUR"` \| `"AUD"` \| `"JPY"` = `'USD'`

Currency code (default: USD)

## Returns

`bigint`

Amount in smallest currency unit (e.g., 1050 for $10.50 USD)

## Example

```typescript
toCents(10.50) // 1050
toCents(10.50, 'USD') // 1050
toCents(1000, 'JPY') // 1000 (JPY has no decimal places)
```
