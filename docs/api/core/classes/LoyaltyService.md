[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / LoyaltyService

# Class: LoyaltyService

Defined in: [core/services/loyalty.service.ts:137](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/loyalty.service.ts#L137)

Loyalty service for managing Square loyalty programs

## Example

```typescript
// Create a loyalty account
const account = await square.loyalty.createAccount({
  programId: 'PROG_123',
  phoneNumber: '+15551234567',
});

// Add points
await square.loyalty.accumulatePoints(account.id, {
  points: 100,
});

// Redeem a reward
await square.loyalty.redeemReward(account.id, 'REWARD_123');
```

## Constructors

### Constructor

> **new LoyaltyService**(`client`, `defaultLocationId?`): `LoyaltyService`

Defined in: [core/services/loyalty.service.ts:138](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/loyalty.service.ts#L138)

#### Parameters

##### client

`SquareClient`

##### defaultLocationId?

`string`

#### Returns

`LoyaltyService`

## Methods

### accumulatePoints()

> **accumulatePoints**(`accountId`, `options`): `Promise`\<`LoyaltyEvent`\>

Defined in: [core/services/loyalty.service.ts:336](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/loyalty.service.ts#L336)

Accumulate (add) points to a loyalty account

#### Parameters

##### accountId

`string`

Loyalty account ID

##### options

Accumulation options

###### idempotencyKey?

`string`

###### orderId?

`string`

###### points?

`number`

#### Returns

`Promise`\<`LoyaltyEvent`\>

Loyalty event

#### Example

```typescript
// Add points from an order
await square.loyalty.accumulatePoints('ACCT_123', {
  orderId: 'ORDER_456',
});

// Add points manually
await square.loyalty.accumulatePoints('ACCT_123', {
  points: 50,
});
```

***

### adjustPoints()

> **adjustPoints**(`accountId`, `points`, `reason?`, `idempotencyKey?`): `Promise`\<`LoyaltyEvent`\>

Defined in: [core/services/loyalty.service.ts:395](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/loyalty.service.ts#L395)

Adjust points on a loyalty account (add or subtract)

#### Parameters

##### accountId

`string`

Loyalty account ID

##### points

`number`

Points to add (positive) or subtract (negative)

##### reason?

`string`

Reason for adjustment

##### idempotencyKey?

`string`

#### Returns

`Promise`\<`LoyaltyEvent`\>

Loyalty event

#### Example

```typescript
// Add bonus points
await square.loyalty.adjustPoints('ACCT_123', 100, 'Birthday bonus');

// Remove points
await square.loyalty.adjustPoints('ACCT_123', -50, 'Points correction');
```

***

### calculatePoints()

> **calculatePoints**(`programId`, `orderId`): `Promise`\<`number`\>

Defined in: [core/services/loyalty.service.ts:510](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/loyalty.service.ts#L510)

Calculate points that would be earned for an order

#### Parameters

##### programId

`string`

Loyalty program ID

##### orderId

`string`

Order ID to calculate points for

#### Returns

`Promise`\<`number`\>

Points that would be earned

#### Example

```typescript
const points = await square.loyalty.calculatePoints('PROG_123', 'ORDER_123');
console.log(`This order earns ${points} points`);
```

***

### createAccount()

> **createAccount**(`options`): `Promise`\<`LoyaltyAccount`\>

Defined in: [core/services/loyalty.service.ts:193](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/loyalty.service.ts#L193)

Create a new loyalty account

#### Parameters

##### options

`CreateLoyaltyAccountOptions`

Account creation options

#### Returns

`Promise`\<`LoyaltyAccount`\>

Created loyalty account

#### Example

```typescript
const account = await square.loyalty.createAccount({
  programId: 'PROG_123',
  phoneNumber: '+15551234567',
});
```

***

### getAccount()

> **getAccount**(`accountId`): `Promise`\<`LoyaltyAccount`\>

Defined in: [core/services/loyalty.service.ts:242](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/loyalty.service.ts#L242)

Get a loyalty account by ID

#### Parameters

##### accountId

`string`

Loyalty account ID

#### Returns

`Promise`\<`LoyaltyAccount`\>

Loyalty account details

#### Example

```typescript
const account = await square.loyalty.getAccount('ACCT_123');
console.log(`Balance: ${account.balance} points`);
```

***

### getProgram()

> **getProgram**(`programId?`): `Promise`\<`LoyaltyProgram`\>

Defined in: [core/services/loyalty.service.ts:155](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/loyalty.service.ts#L155)

Get the loyalty program for the current location

#### Parameters

##### programId?

`string`

Optional program ID (uses main program if not provided)

#### Returns

`Promise`\<`LoyaltyProgram`\>

Loyalty program details

#### Example

```typescript
const program = await square.loyalty.getProgram();
console.log(`Points name: ${program.terminology?.other}`);
```

***

### redeemReward()

> **redeemReward**(`accountId`, `rewardTierId`, `orderId?`, `idempotencyKey?`): `Promise`\<\{ `id`: `string`; `status`: `string`; \}\>

Defined in: [core/services/loyalty.service.ts:441](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/loyalty.service.ts#L441)

Redeem a reward

#### Parameters

##### accountId

`string`

Loyalty account ID

##### rewardTierId

`string`

Reward tier ID to redeem

##### orderId?

`string`

Optional order ID to apply reward to

##### idempotencyKey?

`string`

Covers both the create and redeem calls (the
  redeem key is derived from it); reuse it when retrying

#### Returns

`Promise`\<\{ `id`: `string`; `status`: `string`; \}\>

Created reward

#### Example

```typescript
const reward = await square.loyalty.redeemReward(
  'ACCT_123',
  'TIER_123',
  'ORDER_456'
);
```

***

### searchAccounts()

> **searchAccounts**(`options?`): `Promise`\<\{ `cursor?`: `string`; `data`: `LoyaltyAccount`[]; \}\>

Defined in: [core/services/loyalty.service.ts:276](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/loyalty.service.ts#L276)

Search for loyalty accounts

#### Parameters

##### options?

Search options

###### cursor?

`string`

###### customerId?

`string`

###### limit?

`number`

###### phoneNumber?

`string`

#### Returns

`Promise`\<\{ `cursor?`: `string`; `data`: `LoyaltyAccount`[]; \}\>

Matching loyalty accounts

#### Example

```typescript
// Find by phone number
const accounts = await square.loyalty.searchAccounts({
  phoneNumber: '+15551234567',
});

// Find by customer ID
const accounts = await square.loyalty.searchAccounts({
  customerId: 'CUST_123',
});
```
