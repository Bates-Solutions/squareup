import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SquareClient } from 'square';
import { OrdersService } from '../services/orders.service.js';
import { SquareValidationError, SquareApiError } from '../errors.js';

// Create mock Square client
function createMockClient(overrides: Record<string, unknown> = {}): SquareClient {
  return {
    orders: {
      create: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      pay: vi.fn(),
      search: vi.fn(),
      ...overrides,
    },
  } as unknown as SquareClient;
}

describe('OrdersService', () => {
  const defaultLocationId = 'LOC_123';

  describe('builder', () => {
    it('should create an order builder', () => {
      const client = createMockClient();
      const service = new OrdersService(client, defaultLocationId);
      const builder = service.builder();

      expect(builder).toBeDefined();
      expect(typeof builder.addItem).toBe('function');
      expect(typeof builder.build).toBe('function');
    });

    it('should use provided locationId over default', () => {
      const client = createMockClient();
      const service = new OrdersService(client, defaultLocationId);
      const builder = service.builder('CUSTOM_LOC');

      expect(builder).toBeDefined();
    });

    it('should throw SquareValidationError for missing locationId', () => {
      const client = createMockClient();
      const service = new OrdersService(client); // No default location

      expect(() => service.builder()).toThrow(SquareValidationError);
    });
  });

  describe('create', () => {
    it('should create an order with line items', async () => {
      const mockOrder = { id: 'ORDER_123', state: 'OPEN' };
      const client = createMockClient({
        create: vi.fn().mockResolvedValue({ order: mockOrder }),
      });

      const service = new OrdersService(client, defaultLocationId);
      const result = await service.create({
        lineItems: [{ name: 'Coffee', amount: 350 }],
      });

      expect(result).toEqual(mockOrder);
    });

    it('should pass customerId', async () => {
      const mockOrder = { id: 'ORDER_123' };
      const client = createMockClient({
        create: vi.fn().mockResolvedValue({ order: mockOrder }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.create({
        lineItems: [{ name: 'Coffee', amount: 350 }],
        customerId: 'CUST_123',
      });

      expect(client.orders.create).toHaveBeenCalled();
    });

    it('should pass referenceId', async () => {
      const mockOrder = { id: 'ORDER_123' };
      const client = createMockClient({
        create: vi.fn().mockResolvedValue({ order: mockOrder }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.create({
        lineItems: [{ name: 'Coffee', amount: 350 }],
        referenceId: 'REF_123',
      });

      expect(client.orders.create).toHaveBeenCalled();
    });

    it('should use custom locationId', async () => {
      const mockOrder = { id: 'ORDER_123' };
      const client = createMockClient({
        create: vi.fn().mockResolvedValue({ order: mockOrder }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.create({ lineItems: [{ name: 'Coffee', amount: 350 }] }, 'CUSTOM_LOC');

      expect(client.orders.create).toHaveBeenCalled();
    });

    it('should throw SquareValidationError for missing locationId', async () => {
      const client = createMockClient();
      const service = new OrdersService(client); // No default location

      await expect(
        service.create({ lineItems: [{ name: 'Coffee', amount: 350 }] })
      ).rejects.toThrow(SquareValidationError);
    });

    it('should throw SquareValidationError for empty lineItems', async () => {
      const client = createMockClient();
      const service = new OrdersService(client, defaultLocationId);

      await expect(service.create({ lineItems: [] })).rejects.toThrow(SquareValidationError);
    });

    it('should forward state and pricingOptions (order template)', async () => {
      const mockOrder = { id: 'ORDER_TEMPLATE', state: 'DRAFT' };
      const client = createMockClient({
        create: vi.fn().mockResolvedValue({ order: mockOrder }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.create({
        lineItems: [{ catalogObjectId: 'VAR_1', quantity: 2 }],
        state: 'DRAFT',
        pricingOptions: { autoApplyDiscounts: true, autoApplyTaxes: true },
      });

      expect(client.orders.create).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.objectContaining({
            state: 'DRAFT',
            pricingOptions: { autoApplyDiscounts: true, autoApplyTaxes: true },
          }),
        })
      );
    });

    it('should forward discounts and per-line appliedDiscounts (issue #129)', async () => {
      const client = createMockClient({
        create: vi.fn().mockResolvedValue({ order: { id: 'O' } }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.create({
        lineItems: [{ catalogObjectId: 'VAR_1', quantity: 1, appliedDiscounts: [{ discountUid: 'w' }] }],
        discounts: [{ uid: 'w', catalogObjectId: 'DISCOUNT_1', scope: 'LINE_ITEM' }],
      });

      const arg = (client.orders.create as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
        order: {
          discounts?: Array<{ uid?: string; catalogObjectId?: string }>;
          lineItems: Array<{ appliedDiscounts?: Array<{ discountUid: string }> }>;
        };
      };
      expect(arg.order.discounts).toEqual([{ uid: 'w', catalogObjectId: 'DISCOUNT_1', scope: 'LINE_ITEM' }]);
      expect(arg.order.lineItems[0].appliedDiscounts).toEqual([{ discountUid: 'w' }]);
    });

    it('should honor locationId from options over default', async () => {
      const client = createMockClient({
        create: vi.fn().mockResolvedValue({ order: { id: 'O' } }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.create({
        lineItems: [{ name: 'Coffee', amount: 350 }],
        locationId: 'OVERRIDE_LOC',
      });

      expect(client.orders.create).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.objectContaining({ locationId: 'OVERRIDE_LOC' }),
        })
      );
    });

    it('should forward explicit idempotencyKey', async () => {
      const client = createMockClient({
        create: vi.fn().mockResolvedValue({ order: { id: 'O' } }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.create({
        lineItems: [{ name: 'Coffee', amount: 350 }],
        idempotencyKey: 'stable-key',
      });

      expect(client.orders.create).toHaveBeenCalledWith(
        expect.objectContaining({ idempotencyKey: 'stable-key' })
      );
    });
  });

  describe('get', () => {
    it('should get an order by ID', async () => {
      const mockOrder = { id: 'ORDER_123', state: 'OPEN' };
      const client = createMockClient({
        get: vi.fn().mockResolvedValue({ order: mockOrder }),
      });

      const service = new OrdersService(client, defaultLocationId);
      const result = await service.get('ORDER_123');

      expect(result).toEqual(mockOrder);
      expect(client.orders.get).toHaveBeenCalledWith({ orderId: 'ORDER_123' });
    });

    it('should throw if order not found', async () => {
      const client = createMockClient({
        get: vi.fn().mockResolvedValue({}),
      });

      const service = new OrdersService(client, defaultLocationId);

      await expect(service.get('ORDER_123')).rejects.toThrow('Order not found');
    });

    it('should parse and rethrow API errors', async () => {
      const client = createMockClient({
        get: vi.fn().mockRejectedValue({
          statusCode: 404,
          body: { errors: [{ category: 'INVALID_REQUEST_ERROR', code: 'NOT_FOUND' }] },
        }),
      });

      const service = new OrdersService(client, defaultLocationId);

      await expect(service.get('ORDER_123')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const mockOrder = { id: 'ORDER_123', version: 2 };
      const client = createMockClient({
        update: vi.fn().mockResolvedValue({ order: mockOrder }),
      });

      const service = new OrdersService(client, defaultLocationId);
      const result = await service.update('ORDER_123', { version: 1 });

      expect(result).toEqual(mockOrder);
      expect(client.orders.update).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'ORDER_123',
          order: expect.objectContaining({
            locationId: defaultLocationId,
            version: 1,
          }),
        })
      );
    });

    it('should pass referenceId', async () => {
      const mockOrder = { id: 'ORDER_123' };
      const client = createMockClient({
        update: vi.fn().mockResolvedValue({ order: mockOrder }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.update('ORDER_123', { version: 1, referenceId: 'REF_123' });

      expect(client.orders.update).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.objectContaining({
            referenceId: 'REF_123',
          }),
        })
      );
    });

    it('should use custom locationId', async () => {
      const mockOrder = { id: 'ORDER_123' };
      const client = createMockClient({
        update: vi.fn().mockResolvedValue({ order: mockOrder }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.update('ORDER_123', { version: 1 }, 'CUSTOM_LOC');

      expect(client.orders.update).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.objectContaining({
            locationId: 'CUSTOM_LOC',
          }),
        })
      );
    });

    it('should throw SquareValidationError for missing locationId', async () => {
      const client = createMockClient();
      const service = new OrdersService(client); // No default location

      await expect(service.update('ORDER_123', { version: 1 })).rejects.toThrow(
        SquareValidationError
      );
    });

    // #159 — fulfillments, order state and fieldsToClear.
    const updated = () => {
      const client = createMockClient({
        update: vi.fn().mockResolvedValue({ order: { id: 'ORDER_123' } }),
      });
      return { client, service: new OrdersService(client, defaultLocationId) };
    };
    const sent = (client: SquareClient) =>
      vi.mocked(client.orders.update).mock.calls[0][0] as unknown as {
        order: Record<string, unknown>;
        fieldsToClear?: string[];
        idempotencyKey: string;
      };

    it('sends only the fields that were set (a sparse order)', async () => {
      const { client, service } = updated();
      await service.update('ORDER_123', { version: 3 });

      const req = sent(client);
      expect(req.order).toStrictEqual({ locationId: defaultLocationId, version: 3 });
      expect(req).not.toHaveProperty('fieldsToClear');
    });

    it('marks a shipment fulfillment shipped with carrier and tracking', async () => {
      const { client, service } = updated();
      await service.update('ORDER_123', {
        version: 3,
        fulfillments: [
          {
            uid: 'FUL_1',
            state: 'COMPLETED',
            shipmentDetails: {
              carrier: 'Canada Post',
              trackingNumber: '1234567890',
              trackingUrl: undefined,
            },
          },
        ],
      });

      expect(sent(client).order.fulfillments).toStrictEqual([
        {
          uid: 'FUL_1',
          state: 'COMPLETED',
          shipmentDetails: { carrier: 'Canada Post', trackingNumber: '1234567890' },
        },
      ]);
    });

    it('sends only the writable shipment fields, not Square-stamped ones', async () => {
      const { client, service } = updated();
      const details = {
        carrier: 'Canada Post',
        shippedAt: '2026-11-07T10:00:00Z',
        placedAt: '2026-11-06T10:00:00Z',
      };
      await service.update('ORDER_123', {
        version: 3,
        fulfillments: [{ uid: 'FUL_1', shipmentDetails: details }],
      });

      expect(sent(client).order.fulfillments).toStrictEqual([
        { uid: 'FUL_1', shipmentDetails: { carrier: 'Canada Post' } },
      ]);
    });

    it('leaves out an empty fulfillments list', async () => {
      const { client, service } = updated();
      await service.update('ORDER_123', { version: 3, fulfillments: [] });

      expect(sent(client).order).not.toHaveProperty('fulfillments');
    });

    it('changes a fulfillment state without shipment details', async () => {
      const { client, service } = updated();
      await service.update('ORDER_123', {
        version: 3,
        fulfillments: [{ uid: 'FUL_1', state: 'PREPARED' }],
      });

      expect(sent(client).order.fulfillments).toStrictEqual([{ uid: 'FUL_1', state: 'PREPARED' }]);
    });

    it('cancels an order', async () => {
      const { client, service } = updated();
      await service.update('ORDER_123', { version: 3, state: 'CANCELED' });

      expect(sent(client).order).toMatchObject({ state: 'CANCELED', version: 3 });
    });

    it('passes fieldsToClear, and leaves it out when empty', async () => {
      const path = 'fulfillments[FUL_1].shipment_details.tracking_url';
      const a = updated();
      await a.service.update('ORDER_123', { version: 3, fieldsToClear: [path] });
      expect(sent(a.client).fieldsToClear).toEqual([path]);

      const b = updated();
      await b.service.update('ORDER_123', { version: 3, fieldsToClear: [] });
      expect(sent(b.client)).not.toHaveProperty('fieldsToClear');
    });

    it("honours the caller's idempotencyKey", async () => {
      const { client, service } = updated();
      await service.update('ORDER_123', {
        version: 3,
        state: 'CANCELED',
        idempotencyKey: 'cancel-order-123',
      });

      expect(sent(client).idempotencyKey).toBe('cancel-order-123');
    });

    it('rejects a fulfillment without a uid, before calling Square', async () => {
      const { client, service } = updated();
      const err = await service
        .update('ORDER_123', { version: 3, fulfillments: [{ uid: ' ', state: 'COMPLETED' }] })
        .catch((e: unknown) => e);

      expect(err).toBeInstanceOf(SquareValidationError);
      expect((err as SquareValidationError).field).toBe('fulfillments[0].uid');
      expect(client.orders.update).not.toHaveBeenCalled();
    });

    it.each([-1, 1.5, Number.NaN])('rejects version %s', async (version) => {
      const { client, service } = updated();
      await expect(service.update('ORDER_123', { version })).rejects.toThrow(
        SquareValidationError
      );
      expect(client.orders.update).not.toHaveBeenCalled();
    });

    it('throws when Square answers 2xx with errors', async () => {
      const client = createMockClient({
        update: vi.fn().mockResolvedValue({
          order: { id: 'ORDER_123' },
          errors: [{ category: 'INVALID_REQUEST_ERROR', code: 'VERSION_MISMATCH' }],
        }),
      });
      const service = new OrdersService(client, defaultLocationId);

      await expect(service.update('ORDER_123', { version: 3 })).rejects.toThrow(SquareApiError);
    });

    it('should throw if update fails', async () => {
      const client = createMockClient({
        update: vi.fn().mockResolvedValue({}),
      });

      const service = new OrdersService(client, defaultLocationId);

      await expect(service.update('ORDER_123', { version: 1 })).rejects.toThrow(
        'Order update failed'
      );
    });

    it('should parse and rethrow API errors', async () => {
      const client = createMockClient({
        update: vi.fn().mockRejectedValue({
          statusCode: 400,
          body: { errors: [{ category: 'INVALID_REQUEST_ERROR', code: 'BAD_REQUEST' }] },
        }),
      });

      const service = new OrdersService(client, defaultLocationId);

      await expect(service.update('ORDER_123', { version: 1 })).rejects.toThrow();
    });
  });

  describe('pay', () => {
    it('should pay for an order', async () => {
      const mockOrder = { id: 'ORDER_123', state: 'COMPLETED' };
      const client = createMockClient({
        pay: vi.fn().mockResolvedValue({ order: mockOrder }),
      });

      const service = new OrdersService(client, defaultLocationId);
      const result = await service.pay('ORDER_123', ['PAY_456']);

      expect(result).toEqual(mockOrder);
      expect(client.orders.pay).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'ORDER_123',
          paymentIds: ['PAY_456'],
        })
      );
    });

    it('should throw if payment fails', async () => {
      const client = createMockClient({
        pay: vi.fn().mockResolvedValue({}),
      });

      const service = new OrdersService(client, defaultLocationId);

      await expect(service.pay('ORDER_123', ['PAY_456'])).rejects.toThrow('Order payment failed');
    });

    it('should parse and rethrow API errors', async () => {
      const client = createMockClient({
        pay: vi.fn().mockRejectedValue({
          statusCode: 400,
          body: { errors: [{ category: 'INVALID_REQUEST_ERROR', code: 'BAD_REQUEST' }] },
        }),
      });

      const service = new OrdersService(client, defaultLocationId);

      await expect(service.pay('ORDER_123', ['PAY_456'])).rejects.toThrow();
    });
  });

  describe('search', () => {
    it('should search for orders', async () => {
      const mockOrders = [{ id: 'ORDER_1' }, { id: 'ORDER_2' }];
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: mockOrders, cursor: 'next_cursor' }),
      });

      const service = new OrdersService(client, defaultLocationId);
      const result = await service.search();

      expect(result.data).toEqual(mockOrders);
      expect(result.cursor).toBe('next_cursor');
      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({
          locationIds: [defaultLocationId],
        })
      );
    });

    it('should use custom locationIds', async () => {
      const mockOrders = [{ id: 'ORDER_1' }];
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: mockOrders }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.search({ locationIds: ['LOC_A', 'LOC_B'] });

      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({
          locationIds: ['LOC_A', 'LOC_B'],
        })
      );
    });

    it('should pass cursor and limit', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: [] }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.search({ cursor: 'some_cursor', limit: 10 });

      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: 'some_cursor',
          limit: 10,
        })
      );
    });

    it('should return empty array when no orders', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({}),
      });

      const service = new OrdersService(client, defaultLocationId);
      const result = await service.search();

      expect(result.data).toEqual([]);
      expect(result.cursor).toBeUndefined();
    });

    it('should throw error for missing locationId', async () => {
      const client = createMockClient({
        search: vi.fn(), // Won't be called since validation fails first
      });
      const service = new OrdersService(client); // No default location

      // searchOptions with empty locationIds array should fail
      await expect(service.search({ locationIds: [] })).rejects.toThrow();
    });

    it('should parse and rethrow API errors', async () => {
      const client = createMockClient({
        search: vi.fn().mockRejectedValue({
          statusCode: 401,
          body: { errors: [{ category: 'AUTHENTICATION_ERROR', code: 'UNAUTHORIZED' }] },
        }),
      });

      const service = new OrdersService(client, defaultLocationId);

      await expect(service.search()).rejects.toThrow();
    });

    it('should pass query filter with dateTimeFilter', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: [] }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.search({
        query: {
          filter: {
            dateTimeFilter: {
              createdAt: {
                startAt: '2024-01-01T00:00:00Z',
                endAt: '2024-12-31T23:59:59Z',
              },
            },
          },
        },
      });

      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {
            filter: {
              dateTimeFilter: {
                createdAt: {
                  startAt: '2024-01-01T00:00:00Z',
                  endAt: '2024-12-31T23:59:59Z',
                },
              },
            },
          },
        })
      );
    });

    it('should pass query filter with stateFilter', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: [] }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.search({
        query: {
          filter: {
            stateFilter: {
              states: ['OPEN', 'COMPLETED'],
            },
          },
        },
      });

      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {
            filter: {
              stateFilter: {
                states: ['OPEN', 'COMPLETED'],
              },
            },
          },
        })
      );
    });

    it('should pass query filter with fulfillmentFilter', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: [] }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.search({
        query: {
          filter: {
            fulfillmentFilter: {
              fulfillmentTypes: ['PICKUP', 'SHIPMENT'],
            },
          },
        },
      });

      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {
            filter: {
              fulfillmentFilter: {
                fulfillmentTypes: ['PICKUP', 'SHIPMENT'],
              },
            },
          },
        })
      );
    });

    it('should pass query with sort', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: [] }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.search({
        query: {
          sort: {
            sortField: 'CREATED_AT',
            sortOrder: 'DESC',
          },
        },
      });

      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {
            sort: {
              sortField: 'CREATED_AT',
              sortOrder: 'DESC',
            },
          },
        })
      );
    });

    it('should pass full query with filters and sort', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: [] }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.search({
        locationIds: ['LOC_A'],
        limit: 50,
        query: {
          filter: {
            dateTimeFilter: {
              createdAt: {
                startAt: '2024-01-01T00:00:00Z',
                endAt: '2024-12-31T23:59:59Z',
              },
            },
            stateFilter: {
              states: ['OPEN', 'COMPLETED'],
            },
            fulfillmentFilter: {
              fulfillmentTypes: ['SHIPMENT', 'PICKUP'],
            },
          },
          sort: {
            sortField: 'CREATED_AT',
            sortOrder: 'DESC',
          },
        },
      });

      expect(client.orders.search).toHaveBeenCalledWith({
        locationIds: ['LOC_A'],
        cursor: undefined,
        limit: 50,
        query: {
          filter: {
            dateTimeFilter: {
              createdAt: {
                startAt: '2024-01-01T00:00:00Z',
                endAt: '2024-12-31T23:59:59Z',
              },
            },
            stateFilter: {
              states: ['OPEN', 'COMPLETED'],
            },
            fulfillmentFilter: {
              fulfillmentTypes: ['SHIPMENT', 'PICKUP'],
            },
          },
          sort: {
            sortField: 'CREATED_AT',
            sortOrder: 'DESC',
          },
        },
      });
    });
  });

  describe('searchRecent', () => {
    it('should search with state filter', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: [{ id: 'ORD_1' }] }),
      });

      const service = new OrdersService(client, defaultLocationId);
      const result = await service.searchRecent({ states: ['COMPLETED'] });

      expect(result.data).toHaveLength(1);
      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            filter: { stateFilter: { states: ['COMPLETED'] } },
            sort: { sortField: 'CLOSED_AT', sortOrder: 'DESC' },
          }),
        })
      );
    });

    it('should search with date range', async () => {
      const since = new Date('2024-06-01T00:00:00Z');
      const until = new Date('2024-06-30T23:59:59Z');
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: [] }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.searchRecent({ since, until });

      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            filter: {
              dateTimeFilter: {
                closedAt: {
                  startAt: since.toISOString(),
                  endAt: until.toISOString(),
                },
              },
            },
          }),
        })
      );
    });

    it('should search with since only', async () => {
      const since = new Date('2024-06-01T00:00:00Z');
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: [] }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.searchRecent({ since });

      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            filter: {
              dateTimeFilter: {
                closedAt: { startAt: since.toISOString() },
              },
            },
          }),
        })
      );
    });

    it('should combine state and date filters', async () => {
      const since = new Date('2024-06-01T00:00:00Z');
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: [] }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.searchRecent({ states: ['COMPLETED'], since });

      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            filter: {
              stateFilter: { states: ['COMPLETED'] },
              dateTimeFilter: {
                closedAt: { startAt: since.toISOString() },
              },
            },
          }),
        })
      );
    });

    it('should pass cursor and limit', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: [], cursor: 'next' }),
      });

      const service = new OrdersService(client, defaultLocationId);
      const result = await service.searchRecent({ cursor: 'prev', limit: 25 });

      expect(result.cursor).toBe('next');
      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({ cursor: 'prev', limit: 25 })
      );
    });

    it('should search with no filters', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: [] }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.searchRecent();

      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { sort: { sortField: 'CLOSED_AT', sortOrder: 'DESC' } },
        })
      );
    });

    it('should pass custom locationIds', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ orders: [] }),
      });

      const service = new OrdersService(client, defaultLocationId);
      await service.searchRecent({ locationIds: ['LOC_A'] });

      expect(client.orders.search).toHaveBeenCalledWith(
        expect.objectContaining({ locationIds: ['LOC_A'] })
      );
    });
  });
});
