import { describe, it, expect, vi } from 'vitest';
import type { SquareClient } from 'square';
import { CatalogService, type CatalogObject } from '../services/catalog.service.js';
import { SquareValidationError } from '../errors.js';

// Create mock Square client
function createMockClient(overrides: Record<string, unknown> = {}): SquareClient {
  return {
    catalog: {
      object: {
        upsert: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
      },
      search: vi.fn(),
      list: vi.fn(),
      batchGet: vi.fn(),
      ...overrides,
    },
  } as unknown as SquareClient;
}

describe('CatalogService', () => {
  describe('createItem', () => {
    it('sends each variation\'s UPC', async () => {
      const upsert = vi.fn().mockResolvedValue({ catalogObject: { id: 'ITEM_1', type: 'ITEM' } });
      const client = createMockClient({ object: { upsert, get: vi.fn(), delete: vi.fn() } });
      const service = new CatalogService(client);

      await service.createItem({
        name: 'Dill pickles',
        variations: [{ name: '500 ml', price: 1200, sku: 'DILL-500', upc: '012345678905' }],
      });

      const sent = upsert.mock.calls[0][0] as {
        object: { itemData: { variations: { itemVariationData: Record<string, unknown> }[] } };
      };
      expect(sent.object.itemData.variations[0].itemVariationData).toMatchObject({
        sku: 'DILL-500',
        upc: '012345678905',
      });
    });

    it('should create an item with variations', async () => {
      const mockCatalogObject = { id: 'ITEM_123', type: 'ITEM' };
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({ catalogObject: mockCatalogObject }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);
      const result = await service.createItem({
        name: 'Coffee',
        variations: [{ name: 'Small', price: 350 }],
      });

      expect(result).toEqual(mockCatalogObject);
    });

    it('should pass optional fields', async () => {
      const mockCatalogObject = { id: 'ITEM_123' };
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({ catalogObject: mockCatalogObject }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);
      await service.createItem({
        name: 'Coffee',
        description: 'Hot coffee',
        categoryId: 'CAT_123',
        variations: [
          { name: 'Small', price: 350, sku: 'COF-S', currency: 'EUR' },
        ],
        idempotencyKey: 'custom-key',
      });

      expect(client.catalog.object.upsert).toHaveBeenCalled();
    });

    it('should throw SquareValidationError for missing name', async () => {
      const client = createMockClient();
      const service = new CatalogService(client);

      await expect(
        service.createItem({ name: '', variations: [{ name: 'Small', price: 350 }] })
      ).rejects.toThrow(SquareValidationError);
    });

    it('should throw SquareValidationError for empty variations', async () => {
      const client = createMockClient();
      const service = new CatalogService(client);

      await expect(service.createItem({ name: 'Coffee', variations: [] })).rejects.toThrow(
        SquareValidationError
      );
    });

    it('should throw if item not returned', async () => {
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({}),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);

      await expect(
        service.createItem({ name: 'Coffee', variations: [{ name: 'Small', price: 350 }] })
      ).rejects.toThrow('Catalog item was not created');
    });

    it('should parse and rethrow API errors', async () => {
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockRejectedValue({
            statusCode: 400,
            body: { errors: [{ category: 'INVALID_REQUEST_ERROR', code: 'BAD_REQUEST' }] },
          }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);

      await expect(
        service.createItem({ name: 'Coffee', variations: [{ name: 'Small', price: 350 }] })
      ).rejects.toThrow();
    });
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const mockCatalogObject = { id: 'CAT_123', type: 'CATEGORY' };
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({ catalogObject: mockCatalogObject }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);
      const result = await service.createCategory({ name: 'Beverages' });

      expect(result).toEqual(mockCatalogObject);
    });

    it('should use custom idempotencyKey', async () => {
      const mockCatalogObject = { id: 'CAT_123' };
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({ catalogObject: mockCatalogObject }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);
      await service.createCategory({ name: 'Beverages', idempotencyKey: 'custom-key' });

      expect(client.catalog.object.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ idempotencyKey: 'custom-key' })
      );
    });

    it('should throw SquareValidationError for missing name', async () => {
      const client = createMockClient();
      const service = new CatalogService(client);

      await expect(service.createCategory({ name: '' })).rejects.toThrow(SquareValidationError);
    });

    it('should throw if category not returned', async () => {
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({}),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);

      await expect(service.createCategory({ name: 'Beverages' })).rejects.toThrow(
        'Category was not created'
      );
    });

    it('should parse and rethrow API errors', async () => {
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockRejectedValue({
            statusCode: 400,
            body: { errors: [{ category: 'INVALID_REQUEST_ERROR', code: 'BAD_REQUEST' }] },
          }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);

      await expect(service.createCategory({ name: 'Beverages' })).rejects.toThrow();
    });
  });

  describe('upsert', () => {
    it('should upsert a catalog object', async () => {
      const mockCatalogObject = { id: 'ITEM_123', type: 'ITEM', version: BigInt(1) };
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({ catalogObject: mockCatalogObject }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);
      const result = await service.upsert({
        type: 'ITEM',
        id: 'ITEM_123',
        version: BigInt(1),
        itemData: { name: 'Updated Item' },
      });

      expect(result).toEqual(mockCatalogObject);
      expect(client.catalog.object.upsert).toHaveBeenCalled();
    });

    it('should use custom idempotency key when provided', async () => {
      const mockCatalogObject = { id: 'ITEM_123', type: 'ITEM' };
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({ catalogObject: mockCatalogObject }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);
      await service.upsert(
        { type: 'ITEM', id: 'ITEM_123', itemData: { name: 'Test' } },
        'custom-idempotency-key'
      );

      expect(client.catalog.object.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ idempotencyKey: 'custom-idempotency-key' })
      );
    });

    it('should throw if catalog object not returned', async () => {
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({}),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);

      await expect(
        service.upsert({ type: 'ITEM', id: 'ITEM_123', itemData: { name: 'Test' } })
      ).rejects.toThrow('Catalog object was not upserted');
    });

    it('should parse and rethrow API errors', async () => {
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockRejectedValue({
            statusCode: 400,
            body: { errors: [{ category: 'INVALID_REQUEST_ERROR', code: 'BAD_REQUEST' }] },
          }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);

      await expect(
        service.upsert({ type: 'ITEM', id: 'ITEM_123', itemData: { name: 'Test' } })
      ).rejects.toThrow();
    });

    it('should upsert with custom attribute values', async () => {
      const mockCatalogObject = {
        id: 'ITEM_123',
        type: 'ITEM',
        customAttributeValues: {
          'Square:custom-key': { stringValue: 'custom value' },
        },
      };
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({ catalogObject: mockCatalogObject }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);
      const result = await service.upsert({
        type: 'ITEM',
        id: 'ITEM_123',
        customAttributeValues: {
          'Square:custom-key': { stringValue: 'custom value' },
        },
        itemData: { name: 'Item with Custom Attrs' },
      });

      expect(result.customAttributeValues).toBeDefined();
      expect(result.customAttributeValues?.['Square:custom-key']?.stringValue).toBe('custom value');
    });
  });

  describe('get', () => {
    it('should get a catalog object by ID', async () => {
      const mockObject = { id: 'ITEM_123', type: 'ITEM' };
      const client = createMockClient({
        object: {
          get: vi.fn().mockResolvedValue({ object: mockObject }),
          upsert: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);
      const result = await service.get('ITEM_123');

      expect(result).toEqual(mockObject);
      expect(client.catalog.object.get).toHaveBeenCalledWith({
        objectId: 'ITEM_123',
        includeRelatedObjects: true,
      });
    });

    it('should throw if object not found', async () => {
      const client = createMockClient({
        object: {
          get: vi.fn().mockResolvedValue({}),
          upsert: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);

      await expect(service.get('ITEM_123')).rejects.toThrow('Catalog object not found');
    });

    it('should parse and rethrow API errors', async () => {
      const client = createMockClient({
        object: {
          get: vi.fn().mockRejectedValue({
            statusCode: 404,
            body: { errors: [{ category: 'INVALID_REQUEST_ERROR', code: 'NOT_FOUND' }] },
          }),
          upsert: vi.fn(),
          delete: vi.fn(),
        },
      });

      const service = new CatalogService(client);

      await expect(service.get('ITEM_123')).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a catalog object', async () => {
      const client = createMockClient({
        object: {
          delete: vi.fn().mockResolvedValue({}),
          get: vi.fn(),
          upsert: vi.fn(),
        },
      });

      const service = new CatalogService(client);
      await service.delete('ITEM_123');

      expect(client.catalog.object.delete).toHaveBeenCalledWith({ objectId: 'ITEM_123' });
    });

    it('should parse and rethrow API errors', async () => {
      const client = createMockClient({
        object: {
          delete: vi.fn().mockRejectedValue({
            statusCode: 404,
            body: { errors: [{ category: 'INVALID_REQUEST_ERROR', code: 'NOT_FOUND' }] },
          }),
          get: vi.fn(),
          upsert: vi.fn(),
        },
      });

      const service = new CatalogService(client);

      await expect(service.delete('ITEM_123')).rejects.toThrow();
    });
  });

  describe('search', () => {
    it('should search the catalog', async () => {
      const mockObjects = [{ id: 'ITEM_1' }, { id: 'ITEM_2' }];
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ objects: mockObjects, cursor: 'next' }),
      });

      const service = new CatalogService(client);
      const result = await service.search();

      expect(result.data).toEqual(mockObjects);
      expect(result.cursor).toBe('next');
    });

    it('should search with objectTypes', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ objects: [] }),
      });

      const service = new CatalogService(client);
      await service.search({ objectTypes: ['ITEM', 'CATEGORY'] });

      expect(client.catalog.search).toHaveBeenCalledWith(
        expect.objectContaining({
          objectTypes: ['ITEM', 'CATEGORY'],
        })
      );
    });

    it('should accept SUBSCRIPTION_PLAN and SUBSCRIPTION_PLAN_VARIATION object types', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ objects: [] }),
      });

      const service = new CatalogService(client);
      // Type-level assertion: these must be assignable to CatalogObjectType.
      await service.search({
        objectTypes: ['SUBSCRIPTION_PLAN', 'SUBSCRIPTION_PLAN_VARIATION'],
      });

      expect(client.catalog.search).toHaveBeenCalledWith(
        expect.objectContaining({
          objectTypes: ['SUBSCRIPTION_PLAN', 'SUBSCRIPTION_PLAN_VARIATION'],
        })
      );
    });

    it('should search with text query', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ objects: [] }),
      });

      const service = new CatalogService(client);
      await service.search({ query: 'coffee' });

      expect(client.catalog.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {
            textQuery: {
              keywords: ['coffee'],
            },
          },
        })
      );
    });

    it('should pass cursor and limit', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ objects: [] }),
      });

      const service = new CatalogService(client);
      await service.search({ cursor: 'some_cursor', limit: 25 });

      expect(client.catalog.search).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: 'some_cursor',
          limit: 25,
        })
      );
    });

    it('should return empty array when no objects', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({}),
      });

      const service = new CatalogService(client);
      const result = await service.search();

      expect(result.data).toEqual([]);
    });

    it('should parse and rethrow API errors', async () => {
      const client = createMockClient({
        search: vi.fn().mockRejectedValue({
          statusCode: 401,
          body: { errors: [{ category: 'AUTHENTICATION_ERROR', code: 'UNAUTHORIZED' }] },
        }),
      });

      const service = new CatalogService(client);

      await expect(service.search()).rejects.toThrow();
    });
  });

  describe('findVariationsByCode', () => {
    const variation = (id: string, itemId: string) => ({
      type: 'ITEM_VARIATION',
      id,
      itemVariationData: { itemId },
    });
    const item = (id: string) => ({ type: 'ITEM', id });
    const searchOf = (client: SquareClient) => vi.mocked(client.catalog.search);

    it('finds variations by UPC with one setQuery, and returns the parent items', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({
          objects: [variation('VAR_1', 'ITEM_1')],
          relatedObjects: [item('ITEM_1'), { type: 'CATEGORY', id: 'CAT_1' }],
        }),
      });
      const service = new CatalogService(client);

      const result = await service.findVariationsByCode({ upcs: [' 012345678905 '] });

      expect(searchOf(client)).toHaveBeenCalledTimes(1);
      expect(searchOf(client)).toHaveBeenCalledWith({
        objectTypes: ['ITEM_VARIATION'],
        query: { setQuery: { attributeName: 'upc', attributeValues: ['012345678905'] } },
        includeRelatedObjects: true,
        cursor: undefined,
      });
      expect(result.variations.map((v) => v.id)).toEqual(['VAR_1']);
      expect(result.items.map((i) => i.id)).toEqual(['ITEM_1']);
    });

    it('looks up UPCs and SKUs separately, and returns each variation once', async () => {
      const client = createMockClient({
        search: vi
          .fn()
          .mockResolvedValueOnce({
            objects: [variation('VAR_1', 'ITEM_1')],
            relatedObjects: [item('ITEM_1')],
          })
          .mockResolvedValueOnce({
            objects: [variation('VAR_1', 'ITEM_1'), variation('VAR_2', 'ITEM_1')],
            relatedObjects: [item('ITEM_1')],
          }),
      });
      const service = new CatalogService(client);

      const result = await service.findVariationsByCode({
        upcs: ['012345678905'],
        skus: ['PICKLE-1', 'PICKLE-1', ''],
      });

      const queries = searchOf(client).mock.calls.map((c) => c[0]?.query?.setQuery);
      expect(queries).toEqual([
        { attributeName: 'upc', attributeValues: ['012345678905'] },
        { attributeName: 'sku', attributeValues: ['PICKLE-1'] },
      ]);
      expect(result.variations.map((v) => v.id)).toEqual(['VAR_1', 'VAR_2']);
      expect(result.items.map((i) => i.id)).toEqual(['ITEM_1']);
    });

    it('follows the cursor to the last page', async () => {
      const client = createMockClient({
        search: vi
          .fn()
          .mockResolvedValueOnce({
            objects: [variation('VAR_1', 'ITEM_1')],
            relatedObjects: [item('ITEM_1')],
            cursor: 'NEXT',
          })
          .mockResolvedValueOnce({
            objects: [variation('VAR_2', 'ITEM_2')],
            relatedObjects: [item('ITEM_2')],
          }),
      });
      const service = new CatalogService(client);

      const result = await service.findVariationsByCode({ skus: ['A'] });

      expect(searchOf(client)).toHaveBeenCalledTimes(2);
      expect(searchOf(client).mock.calls[1][0]).toMatchObject({ cursor: 'NEXT' });
      expect(result.variations.map((v) => v.id)).toEqual(['VAR_1', 'VAR_2']);
      // Parent items come from every page, not only the first.
      expect(result.items.map((i) => i.id)).toEqual(['ITEM_1', 'ITEM_2']);
    });

    it('sends at most 250 values per search', async () => {
      const client = createMockClient({ search: vi.fn().mockResolvedValue({}) });
      const service = new CatalogService(client);
      const upcs = Array.from({ length: 251 }, (_, i) => String(i).padStart(12, '0'));

      await service.findVariationsByCode({ upcs });

      const sizes = searchOf(client).mock.calls.map(
        (c) => c[0]?.query?.setQuery?.attributeValues.length
      );
      expect(sizes).toEqual([250, 1]);
    });

    it('rejects an empty lookup without calling Square', async () => {
      const client = createMockClient();
      const service = new CatalogService(client);

      await expect(service.findVariationsByCode({ upcs: [' '], skus: [] })).rejects.toThrow(
        SquareValidationError
      );
      expect(searchOf(client)).not.toHaveBeenCalled();
    });

    it('throws when Square answers 2xx with errors', async () => {
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({
          objects: [],
          errors: [{ category: 'INVALID_REQUEST_ERROR', code: 'BAD_REQUEST' }],
        }),
      });
      const service = new CatalogService(client);

      await expect(service.findVariationsByCode({ upcs: ['1'] })).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list catalog objects by type', async () => {
      const mockObjects = [{ id: 'ITEM_1' }, { id: 'ITEM_2' }];
      const client = createMockClient({
        search: vi.fn().mockResolvedValue({ objects: mockObjects }),
      });

      const service = new CatalogService(client);
      const result = await service.list('ITEM');

      expect(result).toEqual(mockObjects);
      expect(client.catalog.search).toHaveBeenCalledWith({
        objectTypes: ['ITEM'],
        cursor: undefined,
      });
    });

    it('should paginate through all results', async () => {
      const page1Objects = [{ id: 'ITEM_1' }, { id: 'ITEM_2' }];
      const page2Objects = [{ id: 'ITEM_3' }, { id: 'ITEM_4' }];
      const client = createMockClient({
        search: vi
          .fn()
          .mockResolvedValueOnce({ objects: page1Objects, cursor: 'page2' })
          .mockResolvedValueOnce({ objects: page2Objects }),
      });

      const service = new CatalogService(client);
      const result = await service.list('ITEM');

      expect(result).toEqual([...page1Objects, ...page2Objects]);
      expect(client.catalog.search).toHaveBeenCalledTimes(2);
      expect(client.catalog.search).toHaveBeenNthCalledWith(1, {
        objectTypes: ['ITEM'],
        cursor: undefined,
      });
      expect(client.catalog.search).toHaveBeenNthCalledWith(2, {
        objectTypes: ['ITEM'],
        cursor: 'page2',
      });
    });

    it('should respect limit option', async () => {
      const page1Objects = [{ id: 'ITEM_1' }, { id: 'ITEM_2' }];
      const page2Objects = [{ id: 'ITEM_3' }, { id: 'ITEM_4' }];
      const client = createMockClient({
        search: vi
          .fn()
          .mockResolvedValueOnce({ objects: page1Objects, cursor: 'page2' })
          .mockResolvedValueOnce({ objects: page2Objects }),
      });

      const service = new CatalogService(client);
      const result = await service.list('ITEM', { limit: 2 });

      expect(result).toHaveLength(2);
      expect(client.catalog.search).toHaveBeenCalledTimes(1);
    });

    it('should stop at limit across pages', async () => {
      const page1Objects = [{ id: 'ITEM_1' }, { id: 'ITEM_2' }];
      const page2Objects = [{ id: 'ITEM_3' }, { id: 'ITEM_4' }];
      const client = createMockClient({
        search: vi
          .fn()
          .mockResolvedValueOnce({ objects: page1Objects, cursor: 'page2' })
          .mockResolvedValueOnce({ objects: page2Objects }),
      });

      const service = new CatalogService(client);
      const result = await service.list('ITEM', { limit: 3 });

      expect(result).toHaveLength(3);
      expect(result).toEqual([{ id: 'ITEM_1' }, { id: 'ITEM_2' }, { id: 'ITEM_3' }]);
    });

    it('should parse and rethrow API errors', async () => {
      const client = createMockClient({
        search: vi.fn().mockRejectedValue({
          statusCode: 401,
          body: { errors: [{ category: 'AUTHENTICATION_ERROR', code: 'UNAUTHORIZED' }] },
        }),
      });

      const service = new CatalogService(client);

      await expect(service.list('ITEM')).rejects.toThrow();
    });
  });

  describe('batchGet', () => {
    it('should batch get catalog objects', async () => {
      const mockObjects = [{ id: 'ITEM_1' }, { id: 'ITEM_2' }];
      const client = createMockClient({
        batchGet: vi.fn().mockResolvedValue({ objects: mockObjects }),
      });

      const service = new CatalogService(client);
      const result = await service.batchGet(['ITEM_1', 'ITEM_2']);

      expect(result).toEqual(mockObjects);
      expect(client.catalog.batchGet).toHaveBeenCalledWith({
        objectIds: ['ITEM_1', 'ITEM_2'],
        includeRelatedObjects: true,
      });
    });

    it('should return empty array for empty input', async () => {
      const client = createMockClient();
      const service = new CatalogService(client);

      const result = await service.batchGet([]);

      expect(result).toEqual([]);
      expect(client.catalog.batchGet).not.toHaveBeenCalled();
    });

    it('should return empty array when no objects found', async () => {
      const client = createMockClient({
        batchGet: vi.fn().mockResolvedValue({}),
      });

      const service = new CatalogService(client);
      const result = await service.batchGet(['ITEM_1']);

      expect(result).toEqual([]);
    });

    it('should parse and rethrow API errors', async () => {
      const client = createMockClient({
        batchGet: vi.fn().mockRejectedValue({
          statusCode: 401,
          body: { errors: [{ category: 'AUTHENTICATION_ERROR', code: 'UNAUTHORIZED' }] },
        }),
      });

      const service = new CatalogService(client);

      await expect(service.batchGet(['ITEM_1'])).rejects.toThrow();
    });
  });

  describe('createProductSet', () => {
    it('should create a product set', async () => {
      const mockObj = { id: 'PS_1', type: 'PRODUCT_SET' };
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({ catalogObject: mockObj }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const result = await new CatalogService(client).createProductSet({
        name: 'Wholesale items',
        productIdsAny: ['V1', 'V2'],
      });

      expect(result).toEqual(mockObj);
      expect(client.catalog.object.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          object: expect.objectContaining({
            type: 'PRODUCT_SET',
            productSetData: expect.objectContaining({
              name: 'Wholesale items',
              productIdsAny: ['V1', 'V2'],
            }),
          }),
        })
      );
    });

    it('should require name', async () => {
      const client = createMockClient();
      const service = new CatalogService(client);
      await expect(
        service.createProductSet({ name: '', productIdsAny: ['V1'] })
      ).rejects.toThrow(SquareValidationError);
    });

    it('should require at least one product selection', async () => {
      const client = createMockClient();
      const service = new CatalogService(client);
      await expect(
        service.createProductSet({ name: 'set' })
      ).rejects.toThrow(SquareValidationError);
    });
  });

  describe('createPricingRule', () => {
    it('should create a pricing rule with customer group', async () => {
      const mockObj = { id: 'PR_1', type: 'PRICING_RULE' };
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({ catalogObject: mockObj }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const result = await new CatalogService(client).createPricingRule({
        name: 'Wholesale 20% off',
        discountId: 'D_1',
        matchProductsId: 'PS_1',
        customerGroupIdsAny: ['GRP_1'],
      });

      expect(result).toEqual(mockObj);
      expect(client.catalog.object.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          object: expect.objectContaining({
            type: 'PRICING_RULE',
            pricingRuleData: expect.objectContaining({
              name: 'Wholesale 20% off',
              discountId: 'D_1',
              matchProductsId: 'PS_1',
              customerGroupIdsAny: ['GRP_1'],
            }),
          }),
        })
      );
    });

    it('should coerce minimumOrderSubtotal to BigInt money', async () => {
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({ catalogObject: { id: 'PR_1' } }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      await new CatalogService(client).createPricingRule({
        name: 'rule',
        discountId: 'D_1',
        matchProductsId: 'PS_1',
        minimumOrderSubtotal: 5000,
      });

      const call = (client.catalog.object.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call.object.pricingRuleData.minimumOrderSubtotalMoney).toEqual({
        amount: BigInt(5000),
        currency: 'USD',
      });
    });

    it('should require discountId and matchProductsId', async () => {
      const service = new CatalogService(createMockClient());
      await expect(
        service.createPricingRule({ name: 'r', matchProductsId: 'PS_1' })
      ).rejects.toThrow(SquareValidationError);
      await expect(
        service.createPricingRule({ name: 'r', discountId: 'D_1' })
      ).rejects.toThrow(SquareValidationError);
    });
  });

  describe('createTimePeriod', () => {
    it('should create a time period', async () => {
      const mockObj = { id: 'TP_1', type: 'TIME_PERIOD' };
      const client = createMockClient({
        object: {
          upsert: vi.fn().mockResolvedValue({ catalogObject: mockObj }),
          get: vi.fn(),
          delete: vi.fn(),
        },
      });

      const event = 'DTSTART:20260101T170000\nDURATION:PT2H';
      const result = await new CatalogService(client).createTimePeriod({ event });

      expect(result).toEqual(mockObj);
      expect(client.catalog.object.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          object: expect.objectContaining({
            type: 'TIME_PERIOD',
            timePeriodData: { event },
          }),
        })
      );
    });

    it('should require event', async () => {
      const service = new CatalogService(createMockClient());
      await expect(service.createTimePeriod({ event: '' })).rejects.toThrow(
        SquareValidationError
      );
    });
  });

  describe('createWholesalePricing', () => {
    function createBatchClient(overrides: Record<string, unknown> = {}): SquareClient {
      return {
        catalog: {
          object: { upsert: vi.fn(), get: vi.fn(), delete: vi.fn() },
          search: vi.fn(),
          list: vi.fn(),
          batchGet: vi.fn(),
          batchUpsert: vi.fn(),
          ...overrides,
        },
      } as unknown as SquareClient;
    }

    it('should atomically create productSet, discount, and pricing rule', async () => {
      const returnedObjects = [
        { id: 'PS_1', type: 'PRODUCT_SET' },
        { id: 'D_1', type: 'DISCOUNT' },
        { id: 'PR_1', type: 'PRICING_RULE' },
      ];
      const client = createBatchClient({
        batchUpsert: vi.fn().mockResolvedValue({ objects: returnedObjects }),
      });

      const result = await new CatalogService(client).createWholesalePricing({
        name: 'Wholesale 20% off',
        customerGroupId: 'GRP_1',
        itemVariationIds: ['V1', 'V2'],
        discount: { percentage: '20' },
      });

      expect(result.productSet.id).toBe('PS_1');
      expect(result.discount.id).toBe('D_1');
      expect(result.pricingRule.id).toBe('PR_1');

      const call = (client.catalog.batchUpsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call.batches[0].objects).toHaveLength(3);
      const psObj = call.batches[0].objects.find((o: { type: string }) => o.type === 'PRODUCT_SET');
      const prObj = call.batches[0].objects.find((o: { type: string }) => o.type === 'PRICING_RULE');
      expect(psObj.productSetData.productIdsAny).toEqual(['V1', 'V2']);
      expect(prObj.pricingRuleData.matchProductsId).toBe(psObj.id);
      expect(prObj.pricingRuleData.customerGroupIdsAny).toEqual(['GRP_1']);
    });

    it('should support fixed amount discount', async () => {
      const client = createBatchClient({
        batchUpsert: vi.fn().mockResolvedValue({
          objects: [
            { id: 'PS_1', type: 'PRODUCT_SET' },
            { id: 'D_1', type: 'DISCOUNT' },
            { id: 'PR_1', type: 'PRICING_RULE' },
          ],
        }),
      });

      await new CatalogService(client).createWholesalePricing({
        name: '$5 off',
        customerGroupId: 'GRP_1',
        itemVariationIds: ['V1'],
        discount: { amount: 500 },
      });

      const call = (client.catalog.batchUpsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const discount = call.batches[0].objects.find(
        (o: { type: string }) => o.type === 'DISCOUNT'
      );
      expect(discount.discountData.discountType).toBe('FIXED_AMOUNT');
      expect(discount.discountData.amountMoney).toEqual({
        amount: BigInt(500),
        currency: 'USD',
      });
    });

    it('should validate required inputs', async () => {
      const service = new CatalogService(createBatchClient());
      await expect(
        service.createWholesalePricing({
          name: 'x',
          customerGroupId: '',
          itemVariationIds: ['V1'],
          discount: { percentage: '10' },
        })
      ).rejects.toThrow(SquareValidationError);
      await expect(
        service.createWholesalePricing({
          name: 'x',
          customerGroupId: 'G',
          itemVariationIds: [],
          discount: { percentage: '10' },
        })
      ).rejects.toThrow(SquareValidationError);
    });

    it('should throw when batch response is incomplete', async () => {
      const client = createBatchClient({
        batchUpsert: vi.fn().mockResolvedValue({ objects: [] }),
      });

      await expect(
        new CatalogService(client).createWholesalePricing({
          name: 'x',
          customerGroupId: 'GRP_1',
          itemVariationIds: ['V1'],
          discount: { percentage: '10' },
        })
      ).rejects.toThrow();
    });

    it('should require name', async () => {
      const service = new CatalogService(createBatchClient());
      await expect(
        service.createWholesalePricing({
          name: '',
          customerGroupId: 'G',
          itemVariationIds: ['V1'],
          discount: { percentage: '10' },
        })
      ).rejects.toThrow(SquareValidationError);
    });

    it('should wrap batchUpsert errors', async () => {
      const client = createBatchClient({
        batchUpsert: vi.fn().mockRejectedValue(new Error('boom')),
      });
      await expect(
        new CatalogService(client).createWholesalePricing({
          name: 'x',
          customerGroupId: 'GRP_1',
          itemVariationIds: ['V1'],
          discount: { percentage: '10' },
        })
      ).rejects.toThrow();
    });
  });

  describe('new helper error paths', () => {
    function clientWithUpsert(upsert: ReturnType<typeof vi.fn>): SquareClient {
      return {
        catalog: {
          object: { upsert, get: vi.fn(), delete: vi.fn() },
        },
      } as unknown as SquareClient;
    }

    it('createProductSet throws when response missing', async () => {
      const service = new CatalogService(
        clientWithUpsert(vi.fn().mockResolvedValue({}))
      );
      await expect(
        service.createProductSet({ name: 'set', productIdsAny: ['V1'] })
      ).rejects.toThrow();
    });

    it('createProductSet wraps upsert errors', async () => {
      const service = new CatalogService(
        clientWithUpsert(vi.fn().mockRejectedValue(new Error('boom')))
      );
      await expect(
        service.createProductSet({ name: 'set', productIdsAny: ['V1'] })
      ).rejects.toThrow();
    });

    it('createPricingRule requires name', async () => {
      const service = new CatalogService(clientWithUpsert(vi.fn()));
      await expect(
        service.createPricingRule({
          name: '',
          discountId: 'D_1',
          matchProductsId: 'PS_1',
        })
      ).rejects.toThrow(SquareValidationError);
    });

    it('createPricingRule throws when response missing', async () => {
      const service = new CatalogService(
        clientWithUpsert(vi.fn().mockResolvedValue({}))
      );
      await expect(
        service.createPricingRule({
          name: 'r',
          discountId: 'D_1',
          matchProductsId: 'PS_1',
        })
      ).rejects.toThrow();
    });

    it('createPricingRule wraps upsert errors', async () => {
      const service = new CatalogService(
        clientWithUpsert(vi.fn().mockRejectedValue(new Error('boom')))
      );
      await expect(
        service.createPricingRule({
          name: 'r',
          discountId: 'D_1',
          matchProductsId: 'PS_1',
        })
      ).rejects.toThrow();
    });

    it('createTimePeriod throws when response missing', async () => {
      const service = new CatalogService(
        clientWithUpsert(vi.fn().mockResolvedValue({}))
      );
      await expect(service.createTimePeriod({ event: 'DTSTART:X' })).rejects.toThrow();
    });

    it('createTimePeriod wraps upsert errors', async () => {
      const service = new CatalogService(
        clientWithUpsert(vi.fn().mockRejectedValue(new Error('boom')))
      );
      await expect(service.createTimePeriod({ event: 'DTSTART:X' })).rejects.toThrow();
    });
  });
});
