import type { SquareClient } from 'square';
import type {
  CreateOrderOptions,
  CurrencyCode,
  SearchOrdersOptions,
  SearchRecentOrdersOptions,
  UpdateOrderFulfillmentInput,
  UpdateOrderOptions,
} from '../types/index.js';
import { assertNoResponseErrors, parseSquareError, SquareValidationError } from '../errors.js';
import { createIdempotencyKey } from '../utils.js';
import { OrderBuilder, type Order } from '../builders/order.builder.js';

/**
 * Only the writable shipment fields, by name: a caller's object may carry
 * Square-stamped ones (`shippedAt`, `placedAt`…) that must not be sent.
 */
function writableShipment(
  d: NonNullable<UpdateOrderFulfillmentInput['shipmentDetails']>
): NonNullable<UpdateOrderFulfillmentInput['shipmentDetails']> {
  return compact({
    carrier: d.carrier,
    shippingType: d.shippingType,
    shippingNote: d.shippingNote,
    trackingNumber: d.trackingNumber,
    trackingUrl: d.trackingUrl,
    expectedShippedAt: d.expectedShippedAt,
  });
}

/** A copy without the undefined keys, so a sparse update sends only what was set. */
function compact<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined)
  ) as T;
}

/**
 * Orders service for managing Square orders
 *
 * @example
 * ```typescript
 * // Using the builder (recommended)
 * const order = await square.orders
 *   .builder()
 *   .addItem({ name: 'Latte', amount: 450 })
 *   .withCustomer('CUST_123')
 *   .build();
 *
 * // Or create directly
 * const order = await square.orders.create({
 *   lineItems: [{ name: 'Latte', amount: 450 }],
 * });
 * ```
 */
export class OrdersService {
  constructor(
    private readonly client: SquareClient,
    private readonly defaultLocationId?: string,
    private readonly defaultCurrency: CurrencyCode = 'USD'
  ) {}

  /**
   * Create a new order builder
   *
   * @param locationId - Optional location ID (uses default if not provided)
   * @returns Order builder instance
   *
   * @example
   * ```typescript
   * const order = await square.orders
   *   .builder()
   *   .addItem({ name: 'Coffee', amount: 350 })
   *   .addItem({ name: 'Muffin', amount: 250 })
   *   .withTip(100)
   *   .build();
   * ```
   */
  builder(locationId?: string): OrderBuilder {
    const location = locationId ?? this.defaultLocationId;
    if (!location) {
      throw new SquareValidationError(
        'locationId is required. Set it in client config or provide it explicitly.',
        'locationId'
      );
    }
    return new OrderBuilder(this.client, location, this.defaultCurrency);
  }

  /**
   * Create an order directly (without builder)
   *
   * @param options - Order creation options
   * @param locationId - Optional location ID
   * @returns Created order
   *
   * @example
   * ```typescript
   * const order = await square.orders.create({
   *   lineItems: [
   *     { name: 'Coffee', amount: 350 },
   *     { catalogObjectId: 'ITEM_123', quantity: 2 },
   *   ],
   *   customerId: 'CUST_123',
   * });
   * ```
   */
  async create(options: CreateOrderOptions, locationId?: string): Promise<Order> {
    const location = options.locationId ?? locationId ?? this.defaultLocationId;
    if (!location) {
      throw new SquareValidationError(
        'locationId is required. Set it in client config or provide it explicitly.',
        'locationId'
      );
    }

    if (options.lineItems.length === 0) {
      throw new SquareValidationError('Order must have at least one line item', 'lineItems');
    }

    // Use builder internally for consistent validation
    const builder = new OrderBuilder(this.client, location, this.defaultCurrency);

    for (const item of options.lineItems) {
      builder.addItem(item);
    }

    if (options.discounts && options.discounts.length > 0) {
      builder.addDiscounts(options.discounts);
    }

    if (options.customerId) {
      builder.withCustomer(options.customerId);
    }

    if (options.referenceId) {
      builder.withReference(options.referenceId);
    }

    if (options.state) {
      builder.withState(options.state);
    }

    if (options.pricingOptions) {
      builder.withPricingOptions(options.pricingOptions);
    }

    if (options.idempotencyKey) {
      builder.withIdempotencyKey(options.idempotencyKey);
    }

    return builder.build();
  }

  /**
   * Get an order by ID
   *
   * @param orderId - Order ID
   * @returns Order details
   *
   * @example
   * ```typescript
   * const order = await square.orders.get('ORDER_123');
   * ```
   */
  async get(orderId: string): Promise<Order> {
    try {
      const response = await this.client.orders.get({ orderId });
      assertNoResponseErrors(response);

      if (!response.order) {
        throw new Error('Order not found');
      }

      return response.order as Order;
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Update an order. Only the fields you set are sent (a sparse update), so
   * everything else on the order is left as it is.
   *
   * @param orderId - Order ID to update
   * @param updates - The order's current `version`, and the fields to change.
   *   Pass `idempotencyKey` and reuse it when resending the identical request
   *   (say, after a timeout) so Square deduplicates it. After re-reading the
   *   order for a new `version`, use a new key: Square rejects a reused key
   *   with a different body.
   * @param locationId - Override the client's default location
   * @returns Updated order
   *
   * @example
   * ```typescript
   * const order = await square.orders.get('ORDER_123');
   *
   * // Mark a shipment shipped, with tracking
   * await square.orders.update('ORDER_123', {
   *   version: order.version!,
   *   fulfillments: [{
   *     uid: order.fulfillments![0].uid!,
   *     state: 'COMPLETED',
   *     shipmentDetails: { carrier: 'Canada Post', trackingNumber: '1234567890' },
   *   }],
   * });
   *
   * // Cancel an order
   * await square.orders.update('ORDER_123', { version: order.version!, state: 'CANCELED' });
   * ```
   */
  async update(
    orderId: string,
    updates: UpdateOrderOptions,
    locationId?: string
  ): Promise<Order> {
    const location = locationId ?? this.defaultLocationId;
    if (!location) {
      throw new SquareValidationError(
        'locationId is required. Set it in client config or provide it explicitly.',
        'locationId'
      );
    }
    if (!Number.isInteger(updates.version) || updates.version < 0) {
      throw new SquareValidationError(
        "version must be the order's current version, a non-negative integer",
        'version'
      );
    }
    const fulfillments = updates.fulfillments?.map((f, i) => {
      if (!(f.uid as string | undefined)?.trim()) {
        throw new SquareValidationError(
          'Each fulfillment needs the uid of a fulfillment on the order',
          `fulfillments[${String(i)}].uid`
        );
      }
      return compact({
        uid: f.uid,
        state: f.state,
        shipmentDetails: f.shipmentDetails ? writableShipment(f.shipmentDetails) : undefined,
      });
    });

    try {
      const response = await this.client.orders.update({
        orderId,
        order: compact({
          locationId: location,
          version: updates.version,
          referenceId: updates.referenceId,
          state: updates.state,
          fulfillments: fulfillments?.length ? fulfillments : undefined,
        }),
        ...(updates.fieldsToClear?.length ? { fieldsToClear: updates.fieldsToClear } : {}),
        idempotencyKey: updates.idempotencyKey ?? createIdempotencyKey(),
      });
      assertNoResponseErrors(response);

      if (!response.order) {
        throw new Error('Order update failed');
      }

      return response.order as Order;
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Pay for an order
   *
   * @param orderId - Order ID
   * @param paymentIds - Payment IDs to apply
   * @param options.idempotencyKey - Reuse the same key when retrying
   * @returns Updated order
   *
   * @example
   * ```typescript
   * const order = await square.orders.pay('ORDER_123', ['PAYMENT_456']);
   * ```
   */
  async pay(
    orderId: string,
    paymentIds: string[],
    options?: { idempotencyKey?: string }
  ): Promise<Order> {
    try {
      const response = await this.client.orders.pay({
        orderId,
        idempotencyKey: options?.idempotencyKey ?? createIdempotencyKey(),
        paymentIds,
      });
      assertNoResponseErrors(response);

      if (!response.order) {
        throw new Error('Order payment failed');
      }

      return response.order as Order;
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Search for orders
   *
   * @param options - Search options including query filters and sort
   * @returns Paginated list of orders
   *
   * @example
   * ```typescript
   * // Simple search
   * const { data, cursor } = await square.orders.search({
   *   locationIds: ['LXXX'],
   *   limit: 10,
   * });
   *
   * // Search with filters
   * const { data } = await square.orders.search({
   *   locationIds: ['LXXX'],
   *   query: {
   *     filter: {
   *       dateTimeFilter: {
   *         createdAt: {
   *           startAt: '2024-01-01T00:00:00Z',
   *           endAt: '2024-12-31T23:59:59Z',
   *         },
   *       },
   *       stateFilter: {
   *         states: ['OPEN', 'COMPLETED'],
   *       },
   *       fulfillmentFilter: {
   *         fulfillmentTypes: ['PICKUP', 'SHIPMENT'],
   *       },
   *     },
   *     sort: {
   *       sortField: 'CREATED_AT',
   *       sortOrder: 'DESC',
   *     },
   *   },
   * });
   * ```
   */
  async search(options?: SearchOrdersOptions): Promise<{ data: Order[]; cursor?: string }> {
    try {
      const locationIds = options?.locationIds ?? (this.defaultLocationId ? [this.defaultLocationId] : []);

      if (locationIds.length === 0) {
        throw new SquareValidationError('At least one locationId is required for search');
      }

      const response = await this.client.orders.search({
        locationIds,
        cursor: options?.cursor,
        limit: options?.limit,
        query: options?.query,
      });
      assertNoResponseErrors(response);

      return {
        data: (response.orders ?? []) as Order[],
        cursor: response.cursor,
      };
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Search for recent orders with simplified filter options
   *
   * @param options - Simplified search options
   * @returns Paginated list of orders
   *
   * @example
   * ```typescript
   * // Get completed orders from the last hour
   * const { data } = await square.orders.searchRecent({
   *   states: ['COMPLETED'],
   *   since: new Date(Date.now() - 60 * 60 * 1000),
   * });
   *
   * // Get first page of orders from a date range
   * const { data, cursor } = await square.orders.searchRecent({
   *   since: new Date('2024-01-01'),
   *   until: new Date('2024-01-31'),
   *   limit: 50,
   * });
   *
   * // Fetch next page
   * const page2 = await square.orders.searchRecent({
   *   since: new Date('2024-01-01'),
   *   until: new Date('2024-01-31'),
   *   cursor,
   *   limit: 50,
   * });
   * ```
   */
  async searchRecent(
    options?: SearchRecentOrdersOptions
  ): Promise<{ data: Order[]; cursor?: string }> {
    const filter: import('square').SearchOrdersFilter = {};

    if (options?.states) {
      filter.stateFilter = { states: options.states };
    }

    if (options?.since || options?.until) {
      filter.dateTimeFilter = {
        closedAt: {
          ...(options.since ? { startAt: options.since.toISOString() } : {}),
          ...(options.until ? { endAt: options.until.toISOString() } : {}),
        },
      };
    }

    const query: import('square').SearchOrdersQuery = {
      sort: { sortField: 'CLOSED_AT', sortOrder: 'DESC' },
    };

    if (Object.keys(filter).length > 0) {
      query.filter = filter;
    }

    return this.search({
      locationIds: options?.locationIds,
      cursor: options?.cursor,
      limit: options?.limit,
      query,
    });
  }
}
