/**
 * Square environment configuration
 */
export type SquareEnvironment = 'sandbox' | 'production';

/**
 * Currency codes supported by this wrapper. Runtime array so the value can be
 * validated; the {@link CurrencyCode} type is derived from it to prevent drift.
 */
export const CURRENCY_CODES = ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'JPY'] as const;

/**
 * Currency codes supported by Square
 */
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

/**
 * Type guard: is `value` a supported {@link CurrencyCode}?
 */
export function isCurrencyCode(value: string): value is CurrencyCode {
  return (CURRENCY_CODES as readonly string[]).includes(value);
}

/**
 * Payment source identifier
 * Can be a card nonce, card ID, or digital wallet token
 */
export type PaymentSource = string;

/**
 * Common pagination options
 */
export interface PaginationOptions {
  cursor?: string;
  limit?: number;
}

/**
 * Common response with pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  cursor?: string;
}

/**
 * Simple money representation for API inputs
 */
export interface MoneyInput {
  amount: number;
  currency?: CurrencyCode;
}

/**
 * Line item for orders
 */
export interface LineItemInput {
  name?: string;
  catalogObjectId?: string;
  quantity?: number;
  amount?: number;
  /**
   * Explicit money override. When set, takes precedence over `amount` + the
   * builder's default currency. Useful for order templates where the base
   * price must include an explicit currency.
   */
  basePriceMoney?: {
    amount: bigint | number;
    currency: CurrencyCode;
  };
  /**
   * References to order-level `discounts` (by their `uid`) that apply to this
   * line item. Required for `LINE_ITEM`-scoped discounts — Square only applies
   * a line-item discount to a line that lists it here.
   */
  appliedDiscounts?: Array<{ discountUid: string }>;
  note?: string;
}

/**
 * Create payment options
 */
export interface CreatePaymentOptions {
  sourceId: PaymentSource;
  amount: number;
  currency?: CurrencyCode;
  customerId?: string;
  orderId?: string;
  referenceId?: string;
  note?: string;
  autocomplete?: boolean;
  idempotencyKey?: string;
}

/**
 * Pricing options for an order. Controls automatic application of discounts
 * (pricing rules) and taxes.
 */
export interface OrderPricingOptions {
  /**
   * Apply catalog pricing rules (incl. customer-group-gated wholesale rules)
   * automatically at calculation time.
   *
   * ⚠️ **Not for subscription order templates.** Square rejects a subscription
   * template that sets this (`The order template amount must not have
   * auto_apply_discounts set to true`). For a template, carry prices explicitly
   * via each line's `basePriceMoney`, or reference discounts explicitly via the
   * order's `discounts` — either keeps the amount well-defined without
   * auto-application.
   */
  autoApplyDiscounts?: boolean;
  /**
   * Apply all enabled taxes at the location automatically.
   */
  autoApplyTaxes?: boolean;
}

/**
 * Discount type. `FIXED_*` uses the exact `percentage`/`amountMoney` given;
 * `VARIABLE_*` is resolved from the referenced catalog discount.
 */
export type OrderDiscountType =
  | 'FIXED_PERCENTAGE'
  | 'FIXED_AMOUNT'
  | 'VARIABLE_PERCENTAGE'
  | 'VARIABLE_AMOUNT';

/**
 * Whether a discount applies to the whole order or to specific line items.
 */
export type OrderDiscountScope = 'ORDER' | 'LINE_ITEM';

/**
 * An order discount. Reference an existing `CatalogDiscount` by
 * `catalogObjectId` (keeps the catalog authoritative — the price tracks the
 * rule), or define an ad-hoc discount inline with `type` + `percentage`/`amountMoney`.
 *
 * @see https://developer.squareup.com/docs/orders-api/discounts
 */
export interface OrderDiscountInput {
  /** Client-side id; reference it from a line item's `appliedDiscounts`. */
  uid?: string;
  /** Reference an existing `CatalogDiscount` by id. */
  catalogObjectId?: string;
  name?: string;
  type?: OrderDiscountType;
  /** Percentage as a string, e.g. `"7.25"` (for percentage types). */
  percentage?: string;
  /** Fixed amount (for amount types). */
  amountMoney?: { amount: bigint | number; currency: CurrencyCode };
  /**
   * `ORDER` applies to the whole order (Square auto-applies to every line);
   * `LINE_ITEM` applies only to lines that list this discount's `uid` in their
   * `appliedDiscounts`.
   */
  scope?: OrderDiscountScope;
}

/**
 * Create order options
 */
export interface CreateOrderOptions {
  lineItems: LineItemInput[];
  customerId?: string;
  referenceId?: string;
  /**
   * Order-level and line-level discounts. Reference `CatalogDiscount` ids to
   * keep pricing authoritative (the number tracks the catalog rather than being
   * copied into the order). For a subscription order template, carry discounts
   * (or explicit `basePriceMoney`) here rather than relying on
   * `pricingOptions.autoApplyDiscounts` — see {@link OrderPricingOptions}.
   */
  discounts?: OrderDiscountInput[];
  /**
   * Order state. Use `'DRAFT'` when creating an order template that will back
   * a subscription phase (`subscriptions.create({ phases: [...] })`).
   */
  state?: 'DRAFT' | 'OPEN';
  pricingOptions?: OrderPricingOptions;
  /**
   * Override the client's default location for this order.
   */
  locationId?: string;
  idempotencyKey?: string;
}

/**
 * One fulfillment to change in `orders.update()`, matched on its `uid`.
 *
 * Moving a `SHIPMENT` fulfillment to `COMPLETED` marks it shipped; Square stamps
 * `shipmentDetails.shippedAt` itself, so it isn't settable here.
 */
export interface UpdateOrderFulfillmentInput {
  /** The `uid` of a fulfillment already on the order. */
  uid: string;
  state?: import('square').FulfillmentState;
  /** Writable shipment fields; only the ones you set are sent. */
  shipmentDetails?: {
    carrier?: string;
    shippingType?: string;
    shippingNote?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    /** RFC 3339 timestamp. */
    expectedShippedAt?: string;
  };
}

/**
 * Options for `orders.update()`. Square applies them as a sparse update: only
 * the fields you set change.
 */
export interface UpdateOrderOptions {
  /**
   * The order's current version. Square rejects a stale one, which is how a
   * concurrent change is detected.
   */
  version: number;
  referenceId?: string;
  /** Order state, e.g. `'CANCELED'` to cancel an open order or DRAFT template. */
  state?: import('square').OrderState;
  /** Fulfillments to change, each matched on `uid`. */
  fulfillments?: UpdateOrderFulfillmentInput[];
  /**
   * Fields to remove, as Square dot paths, e.g.
   * `'fulfillments[FULFILLMENT_UID].shipment_details.tracking_url'`.
   */
  fieldsToClear?: string[];
  /** Reuse it when retrying so Square deduplicates the request. */
  idempotencyKey?: string;
}

/**
 * Re-export Square SDK types for SearchOrders
 */
export type {
  SearchOrdersQuery,
  SearchOrdersFilter,
  SearchOrdersSort,
  SearchOrdersDateTimeFilter,
  SearchOrdersStateFilter,
  SearchOrdersFulfillmentFilter,
  SearchOrdersSourceFilter,
  SearchOrdersCustomerFilter,
  TimeRange,
  OrderState,
  FulfillmentType,
  FulfillmentState,
  SearchOrdersSortField,
  SortOrder,
} from 'square';

/**
 * Search orders options
 */
export interface SearchOrdersOptions {
  locationIds?: string[];
  cursor?: string;
  limit?: number;
  query?: import('square').SearchOrdersQuery;
}

/**
 * Simplified options for searching recent orders
 */
export interface SearchRecentOrdersOptions {
  locationIds?: string[];
  states?: import('square').OrderState[];
  since?: Date;
  until?: Date;
  limit?: number;
  cursor?: string;
}
