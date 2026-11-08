/**
 * `@bates-solutions/squareup` — a TypeScript wrapper for the Square API.
 *
 * The package's main entrypoint. Exports `createSquareClient` / `SquareClient`
 * (one service per Square domain — payments, orders, customers, catalog,
 * inventory, subscriptions, invoices, loyalty, gift cards, and more), the
 * normalized error hierarchy (`SquareError` + `parseSquareError`), and money /
 * idempotency utilities. Webhook helpers live in the
 * `@bates-solutions/squareup/server` entrypoint.
 *
 * @example
 * ```ts
 * import { createSquareClient } from '@bates-solutions/squareup';
 *
 * const square = createSquareClient({
 *   accessToken: process.env.SQUARE_ACCESS_TOKEN!,
 *   environment: 'sandbox',
 * });
 * const payment = await square.payments.create({
 *   sourceId: 'cnon:card-nonce',
 *   amount: 1000,
 *   currency: 'USD',
 * });
 * ```
 *
 * @module
 */

// Core exports
export { createSquareClient, SquareClient } from './client.js';
export type { SquareClientConfig } from './client.js';

// OAuth (application-credential client + authorize URL)
export { buildAuthorizeUrl, createSquareOAuthClient, SquareOAuthClient } from './oauth.js';
export type {
  BuildAuthorizeUrlOptions,
  OAuthScope,
  OAuthTokens,
  OAuthTokenStatus,
  SquareOAuthClientConfig,
} from './oauth.js';

// Services
export { PaymentsService } from './services/payments.service.js';
export { OrdersService } from './services/orders.service.js';
export { CustomersService } from './services/customers.service.js';
export type {
  Customer,
  CreateCustomerOptions,
  UpdateCustomerOptions,
  ListCustomersOptions,
  SearchCustomersOptions,
  CustomerSortField,
  CustomerSortOrder,
} from './services/customers.service.js';
export { CustomerGroupsService } from './services/customer-groups.service.js';
export { CatalogService } from './services/catalog.service.js';
export type {
  FindVariationsByCodeOptions,
  FindVariationsByCodeResult,
} from './services/catalog.service.js';
export { InventoryService } from './services/inventory.service.js';
export { SubscriptionsService } from './services/subscriptions.service.js';
export type {
  Subscription,
  SubscriptionStatus,
  SubscriptionCadence,
  SubscriptionPlan,
  SubscriptionPhaseInput,
  CreateSubscriptionOptions,
} from './services/subscriptions.service.js';
export { InvoicesService } from './services/invoices.service.js';
export { LoyaltyService } from './services/loyalty.service.js';
export { CheckoutService } from './services/checkout.service.js';
export {
  GiftCardsService,
  GiftCardActivitiesService,
} from './services/gift-cards.service.js';
export { LocationsService } from './services/locations.service.js';
export { OAuthService } from './services/oauth.service.js';
export type { Location } from './services/locations.service.js';
export { WebhookSubscriptionsService } from './services/webhook-subscriptions.service.js';
export type {
  WebhookSubscription,
  CreatedWebhookSubscription,
  SubscriptionTestResult,
  CreateWebhookSubscriptionOptions,
  UpdateWebhookSubscriptionOptions,
  ListWebhookSubscriptionsOptions,
} from './services/webhook-subscriptions.service.js';
export type {
  GiftCard,
  GiftCardType,
  GiftCardGanSource,
  GiftCardState,
  GiftCardActivity,
  GiftCardActivityType,
  GiftCardDeactivateReason,
  CreateGiftCardOptions,
  CreateGiftCardActivityOptions,
  ListGiftCardsOptions,
  ListGiftCardActivitiesOptions,
  ActivateActivityDetails,
  LoadActivityDetails,
  RedeemActivityDetails,
  AdjustIncrementActivityDetails,
  AdjustDecrementActivityDetails,
  AdjustIncrementReason,
  AdjustDecrementReason,
} from './services/gift-cards.service.js';

// Builders
export { OrderBuilder } from './builders/order.builder.js';
export type { Order } from './builders/order.builder.js';

// Errors
export {
  SquareError,
  SquareApiError,
  SquareAuthError,
  SquarePaymentError,
  SquareValidationError,
  SquareNetworkError,
  isRetryableSquareError,
} from './errors.js';
export type { SquareErrorCode } from './errors.js';

// Utils
export { toCents, fromCents, formatMoney, createIdempotencyKey } from './utils.js';
export type { Money } from './utils.js';

// Types
export type * from './types/index.js';
