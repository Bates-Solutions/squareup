[**@bates-solutions/squareup API Reference v2.3.0**](../README.md)

***

[@bates-solutions/squareup API Reference](../README.md) / core

# core

`@bates-solutions/squareup` — a TypeScript wrapper for the Square API.

The package's main entrypoint. Exports `createSquareClient` / `SquareClient`
(one service per Square domain — payments, orders, customers, catalog,
inventory, subscriptions, invoices, loyalty, gift cards, and more), the
normalized error hierarchy (`SquareError` + `parseSquareError`), and money /
idempotency utilities. Webhook helpers live in the
`@bates-solutions/squareup/server` entrypoint.

## Example

```ts
import { createSquareClient } from '@bates-solutions/squareup';

const square = createSquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: 'sandbox',
});
const payment = await square.payments.create({
  sourceId: 'cnon:card-nonce',
  amount: 1000,
  currency: 'USD',
});
```

## Classes

- [CatalogService](classes/CatalogService.md)
- [CheckoutService](classes/CheckoutService.md)
- [CustomerGroupsService](classes/CustomerGroupsService.md)
- [CustomersService](classes/CustomersService.md)
- [GiftCardActivitiesService](classes/GiftCardActivitiesService.md)
- [GiftCardsService](classes/GiftCardsService.md)
- [InventoryService](classes/InventoryService.md)
- [InvoicesService](classes/InvoicesService.md)
- [LocationsService](classes/LocationsService.md)
- [LoyaltyService](classes/LoyaltyService.md)
- [OAuthService](classes/OAuthService.md)
- [OrderBuilder](classes/OrderBuilder.md)
- [OrdersService](classes/OrdersService.md)
- [PaymentsService](classes/PaymentsService.md)
- [SquareApiError](classes/SquareApiError.md)
- [SquareAuthError](classes/SquareAuthError.md)
- [SquareClient](classes/SquareClient.md)
- [SquareError](classes/SquareError.md)
- [SquareNetworkError](classes/SquareNetworkError.md)
- [SquareOAuthClient](classes/SquareOAuthClient.md)
- [SquarePaymentError](classes/SquarePaymentError.md)
- [SquareValidationError](classes/SquareValidationError.md)
- [SubscriptionsService](classes/SubscriptionsService.md)
- [WebhookSubscriptionsService](classes/WebhookSubscriptionsService.md)

## Interfaces

- [ActivateActivityDetails](interfaces/ActivateActivityDetails.md)
- [AdjustDecrementActivityDetails](interfaces/AdjustDecrementActivityDetails.md)
- [AdjustIncrementActivityDetails](interfaces/AdjustIncrementActivityDetails.md)
- [BuildAuthorizeUrlOptions](interfaces/BuildAuthorizeUrlOptions.md)
- [CreateCustomerOptions](interfaces/CreateCustomerOptions.md)
- [CreateGiftCardActivityOptions](interfaces/CreateGiftCardActivityOptions.md)
- [CreateGiftCardOptions](interfaces/CreateGiftCardOptions.md)
- [CreateOrderOptions](interfaces/CreateOrderOptions.md)
- [CreatePaymentOptions](interfaces/CreatePaymentOptions.md)
- [CreateSubscriptionOptions](interfaces/CreateSubscriptionOptions.md)
- [CreateWebhookSubscriptionOptions](interfaces/CreateWebhookSubscriptionOptions.md)
- [Customer](interfaces/Customer.md)
- [FindVariationsByCodeOptions](interfaces/FindVariationsByCodeOptions.md)
- [FindVariationsByCodeResult](interfaces/FindVariationsByCodeResult.md)
- [GiftCard](interfaces/GiftCard.md)
- [GiftCardActivity](interfaces/GiftCardActivity.md)
- [LineItemInput](interfaces/LineItemInput.md)
- [ListCustomersOptions](interfaces/ListCustomersOptions.md)
- [ListGiftCardActivitiesOptions](interfaces/ListGiftCardActivitiesOptions.md)
- [ListGiftCardsOptions](interfaces/ListGiftCardsOptions.md)
- [ListWebhookSubscriptionsOptions](interfaces/ListWebhookSubscriptionsOptions.md)
- [LoadActivityDetails](interfaces/LoadActivityDetails.md)
- [Location](interfaces/Location.md)
- [Money](interfaces/Money.md)
- [MoneyInput](interfaces/MoneyInput.md)
- [OAuthTokens](interfaces/OAuthTokens.md)
- [OAuthTokenStatus](interfaces/OAuthTokenStatus.md)
- [Order](interfaces/Order.md)
- [OrderDiscountInput](interfaces/OrderDiscountInput.md)
- [OrderPricingOptions](interfaces/OrderPricingOptions.md)
- [PaginatedResponse](interfaces/PaginatedResponse.md)
- [PaginationOptions](interfaces/PaginationOptions.md)
- [RedeemActivityDetails](interfaces/RedeemActivityDetails.md)
- [SearchCustomersOptions](interfaces/SearchCustomersOptions.md)
- [SearchOrdersOptions](interfaces/SearchOrdersOptions.md)
- [SearchRecentOrdersOptions](interfaces/SearchRecentOrdersOptions.md)
- [SquareClientConfig](interfaces/SquareClientConfig.md)
- [SquareOAuthClientConfig](interfaces/SquareOAuthClientConfig.md)
- [Subscription](interfaces/Subscription.md)
- [SubscriptionPhaseInput](interfaces/SubscriptionPhaseInput.md)
- [SubscriptionPlan](interfaces/SubscriptionPlan.md)
- [UpdateCustomerOptions](interfaces/UpdateCustomerOptions.md)
- [UpdateOrderFulfillmentInput](interfaces/UpdateOrderFulfillmentInput.md)
- [UpdateOrderOptions](interfaces/UpdateOrderOptions.md)
- [UpdateWebhookSubscriptionOptions](interfaces/UpdateWebhookSubscriptionOptions.md)

## Type Aliases

- [AdjustDecrementReason](type-aliases/AdjustDecrementReason.md)
- [AdjustIncrementReason](type-aliases/AdjustIncrementReason.md)
- [CreatedWebhookSubscription](type-aliases/CreatedWebhookSubscription.md)
- [CurrencyCode](type-aliases/CurrencyCode.md)
- [CustomerSortField](type-aliases/CustomerSortField.md)
- [CustomerSortOrder](type-aliases/CustomerSortOrder.md)
- [GiftCardActivityType](type-aliases/GiftCardActivityType.md)
- [GiftCardDeactivateReason](type-aliases/GiftCardDeactivateReason.md)
- [GiftCardGanSource](type-aliases/GiftCardGanSource.md)
- [GiftCardState](type-aliases/GiftCardState.md)
- [GiftCardType](type-aliases/GiftCardType.md)
- [OAuthScope](type-aliases/OAuthScope.md)
- [OrderDiscountScope](type-aliases/OrderDiscountScope.md)
- [OrderDiscountType](type-aliases/OrderDiscountType.md)
- [PaymentSource](type-aliases/PaymentSource.md)
- [SquareEnvironment](type-aliases/SquareEnvironment.md)
- [SquareErrorCode](type-aliases/SquareErrorCode.md)
- [SubscriptionCadence](type-aliases/SubscriptionCadence.md)
- [SubscriptionStatus](type-aliases/SubscriptionStatus.md)
- [SubscriptionTestResult](type-aliases/SubscriptionTestResult.md)
- [WebhookSubscription](type-aliases/WebhookSubscription.md)

## Variables

- [CURRENCY\_CODES](variables/CURRENCY_CODES.md)

## Functions

- [buildAuthorizeUrl](functions/buildAuthorizeUrl.md)
- [createIdempotencyKey](functions/createIdempotencyKey.md)
- [createSquareClient](functions/createSquareClient.md)
- [createSquareOAuthClient](functions/createSquareOAuthClient.md)
- [formatMoney](functions/formatMoney.md)
- [fromCents](functions/fromCents.md)
- [isCurrencyCode](functions/isCurrencyCode.md)
- [isRetryableSquareError](functions/isRetryableSquareError.md)
- [toCents](functions/toCents.md)
