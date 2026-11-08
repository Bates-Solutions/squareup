import type { SquareClient, CatalogObject as SquareCatalogObject } from 'square';
import { assertNoResponseErrors, parseSquareError, SquareValidationError } from '../errors.js';
import { createIdempotencyKey } from '../utils.js';
import type { CurrencyCode } from '../types/index.js';

/**
 * Catalog item type
 */
export type CatalogObjectType =
  | 'ITEM'
  | 'ITEM_VARIATION'
  | 'CATEGORY'
  | 'DISCOUNT'
  | 'TAX'
  | 'MODIFIER'
  | 'MODIFIER_LIST'
  | 'IMAGE'
  | 'PRICING_RULE'
  | 'PRODUCT_SET'
  | 'TIME_PERIOD'
  | 'CUSTOM_ATTRIBUTE_DEFINITION'
  | 'SUBSCRIPTION_PLAN'
  | 'SUBSCRIPTION_PLAN_VARIATION';

/**
 * Structured data for a catalog PRICING_RULE object.
 *
 * Pricing rules automatically apply a discount to a set of items when conditions
 * match — typically used for wholesale pricing, BOGO promos, or happy-hour pricing.
 * A rule references a `CatalogProductSet` (matched items), a `CatalogDiscount`,
 * and optionally a list of customer group IDs (members-only pricing).
 */
export interface CatalogPricingRuleData {
  name?: string;
  timePeriodIds?: string[];
  discountId?: string;
  matchProductsId?: string;
  applyProductsId?: string;
  excludeProductsId?: string;
  customerGroupIdsAny?: string[];
  validFromDate?: string;
  validFromLocalTime?: string;
  validUntilDate?: string;
  validUntilLocalTime?: string;
  minimumOrderSubtotalMoney?: {
    amount?: bigint;
    currency?: string;
  };
}

/**
 * Structured data for a catalog PRODUCT_SET object.
 *
 * A product set is a named collection of catalog objects referenced by a
 * pricing rule. Including a category includes all of its items and variations.
 */
export interface CatalogProductSetData {
  name?: string;
  productIdsAny?: string[];
  productIdsAll?: string[];
  allProducts?: boolean;
  quantityExact?: bigint;
  quantityMin?: bigint;
  quantityMax?: bigint;
}

/**
 * Structured data for a catalog TIME_PERIOD object.
 *
 * `event` is an RFC 5545 iCalendar VEVENT fragment (only SUMMARY, DTSTART,
 * DURATION and RRULE are supported). DTSTART must be in local (unzoned) time.
 */
export interface CatalogTimePeriodData {
  event?: string;
}

/**
 * Custom attribute value for catalog items
 */
export interface CatalogCustomAttributeValue {
  name?: string;
  stringValue?: string;
  customAttributeDefinitionId?: string;
  type?: 'STRING' | 'BOOLEAN' | 'NUMBER' | 'SELECTION';
  numberValue?: string;
  booleanValue?: boolean;
  selectionUidValues?: string[];
  key?: string;
}

/**
 * Custom attribute definition data
 */
export interface CustomAttributeDefinitionData {
  type?: 'STRING' | 'BOOLEAN' | 'NUMBER' | 'SELECTION';
  name?: string;
  description?: string;
  allowedObjectTypes?: CatalogObjectType[];
  sellerVisibility?: 'SELLER_VISIBILITY_HIDDEN' | 'SELLER_VISIBILITY_READ_WRITE_VALUES';
  appVisibility?: 'APP_VISIBILITY_HIDDEN' | 'APP_VISIBILITY_READ_ONLY' | 'APP_VISIBILITY_READ_WRITE_VALUES';
  key?: string;
}

/**
 * Catalog object from Square API
 */
export interface CatalogObject {
  type: CatalogObjectType;
  id: string;
  updatedAt?: string;
  version?: bigint;
  isDeleted?: boolean;
  presentAtAllLocations?: boolean;
  presentAtLocationIds?: string[];
  customAttributeValues?: Record<string, CatalogCustomAttributeValue>;
  itemData?: {
    name?: string;
    description?: string;
    categoryId?: string;
    variations?: CatalogObject[];
    productType?: string;
  };
  itemVariationData?: {
    itemId?: string;
    name?: string;
    sku?: string;
    /** Universal product code (barcode). Searchable with `findVariationsByCode()`. */
    upc?: string;
    priceMoney?: {
      amount?: bigint;
      currency?: string;
    };
    pricingType?: 'FIXED_PRICING' | 'VARIABLE_PRICING';
  };
  categoryData?: {
    name?: string;
  };
  discountData?: {
    name?: string;
    discountType?: 'FIXED_PERCENTAGE' | 'FIXED_AMOUNT' | 'VARIABLE_PERCENTAGE' | 'VARIABLE_AMOUNT';
    percentage?: string;
    amountMoney?: {
      amount?: bigint;
      currency?: string;
    };
  };
  taxData?: {
    name?: string;
    percentage?: string;
    inclusionType?: 'ADDITIVE' | 'INCLUSIVE';
  };
  customAttributeDefinitionData?: CustomAttributeDefinitionData;
  pricingRuleData?: CatalogPricingRuleData;
  productSetData?: CatalogProductSetData;
  timePeriodData?: CatalogTimePeriodData;
}

/**
 * Options for creating a catalog item
 */
export interface CreateCatalogItemOptions {
  name: string;
  description?: string;
  categoryId?: string;
  variations: Array<{
    name: string;
    price: number;
    currency?: CurrencyCode;
    sku?: string;
    /** Universal product code (barcode). Square validates the format. */
    upc?: string;
  }>;
  idempotencyKey?: string;
}

/**
 * Options for creating a category
 */
export interface CreateCategoryOptions {
  name: string;
  idempotencyKey?: string;
}

/**
 * Options for creating a pricing rule
 */
export interface CreatePricingRuleOptions {
  name: string;
  discountId?: string;
  matchProductsId?: string;
  applyProductsId?: string;
  excludeProductsId?: string;
  customerGroupIdsAny?: string[];
  timePeriodIds?: string[];
  validFromDate?: string;
  validFromLocalTime?: string;
  validUntilDate?: string;
  validUntilLocalTime?: string;
  minimumOrderSubtotal?: number;
  currency?: CurrencyCode;
  idempotencyKey?: string;
}

/**
 * Options for creating a product set
 */
export interface CreateProductSetOptions {
  name: string;
  productIdsAny?: string[];
  productIdsAll?: string[];
  allProducts?: boolean;
  quantityExact?: number;
  quantityMin?: number;
  quantityMax?: number;
  idempotencyKey?: string;
}

/**
 * Options for creating a time period
 */
export interface CreateTimePeriodOptions {
  event: string;
  idempotencyKey?: string;
}

/**
 * Options for creating a complete wholesale pricing configuration
 * in a single atomic batch upsert.
 */
export interface CreateWholesalePricingOptions {
  name: string;
  customerGroupId: string;
  itemVariationIds: string[];
  discount:
    | { percentage: string }
    | { amount: number; currency?: CurrencyCode };
  validFromDate?: string;
  validUntilDate?: string;
  idempotencyKey?: string;
}

/**
 * Result of a wholesale pricing batch upsert — the three newly created objects.
 */
export interface WholesalePricingResult {
  pricingRule: CatalogObject;
  productSet: CatalogObject;
  discount: CatalogObject;
}

/**
 * Codes to look up with `catalog.findVariationsByCode()`. Matching is exact and
 * case insensitive; give either list, or both.
 */
export interface FindVariationsByCodeOptions {
  upcs?: string[];
  skus?: string[];
}

/**
 * Result of `catalog.findVariationsByCode()`.
 */
export interface FindVariationsByCodeResult {
  /** Matching `ITEM_VARIATION` objects, each once. */
  variations: CatalogObject[];
  /** Their parent `ITEM` objects, each once. */
  items: CatalogObject[];
}

/** Square's limit on values in one `setQuery`. */
const MAX_SET_QUERY_VALUES = 250;

/**
 * Options for searching the catalog
 */
export interface SearchCatalogOptions {
  objectTypes?: CatalogObjectType[];
  query?: string;
  categoryIds?: string[];
  limit?: number;
  cursor?: string;
}

/**
 * Catalog service for managing Square catalog items
 *
 * @example
 * ```typescript
 * // Create an item with variations
 * const item = await square.catalog.createItem({
 *   name: 'Coffee',
 *   variations: [
 *     { name: 'Small', price: 350 },
 *     { name: 'Large', price: 450 },
 *   ],
 * });
 *
 * // Search items
 * const results = await square.catalog.search({
 *   objectTypes: ['ITEM'],
 *   query: 'coffee',
 * });
 * ```
 */
export class CatalogService {
  constructor(
    private readonly client: SquareClient,
    private readonly defaultCurrency: CurrencyCode = 'USD'
  ) {}

  /**
   * Create a catalog item with variations
   *
   * @param options - Item creation options
   * @returns Created catalog object
   *
   * @example
   * ```typescript
   * const item = await square.catalog.createItem({
   *   name: 'Latte',
   *   description: 'Espresso with steamed milk',
   *   variations: [
   *     { name: 'Small', price: 400, sku: 'LATTE-S' },
   *     { name: 'Medium', price: 500, sku: 'LATTE-M' },
   *     { name: 'Large', price: 600, sku: 'LATTE-L' },
   *   ],
   * });
   * ```
   */
  async createItem(options: CreateCatalogItemOptions): Promise<CatalogObject> {
    if (!options.name) {
      throw new SquareValidationError('Item name is required', 'name');
    }
    if (options.variations.length === 0) {
      throw new SquareValidationError('At least one variation is required', 'variations');
    }

    const itemId = `#item_${String(Date.now())}`;

    try {
      const response = await this.client.catalog.object.upsert({
        idempotencyKey: options.idempotencyKey ?? createIdempotencyKey(),
        object: {
          type: 'ITEM',
          id: itemId,
          itemData: {
            name: options.name,
            description: options.description,
            categoryId: options.categoryId,
            variations: options.variations.map((v, i) => ({
              type: 'ITEM_VARIATION' as const,
              id: `#variation_${String(Date.now())}_${String(i)}`,
              itemVariationData: {
                itemId,
                name: v.name,
                sku: v.sku,
                upc: v.upc,
                pricingType: 'FIXED_PRICING' as const,
                priceMoney: {
                  amount: BigInt(v.price),
                  currency: v.currency ?? this.defaultCurrency,
                },
              },
            })),
          },
        },
      });
      assertNoResponseErrors(response);

      if (!response.catalogObject) {
        throw new Error('Catalog item was not created');
      }

      return response.catalogObject as CatalogObject;
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Create a category
   *
   * @param options - Category creation options
   * @returns Created category
   *
   * @example
   * ```typescript
   * const category = await square.catalog.createCategory({
   *   name: 'Beverages',
   * });
   * ```
   */
  async createCategory(options: CreateCategoryOptions): Promise<CatalogObject> {
    if (!options.name) {
      throw new SquareValidationError('Category name is required', 'name');
    }

    try {
      const response = await this.client.catalog.object.upsert({
        idempotencyKey: options.idempotencyKey ?? createIdempotencyKey(),
        object: {
          type: 'CATEGORY',
          id: `#category_${String(Date.now())}`,
          categoryData: {
            name: options.name,
          },
        },
      });
      assertNoResponseErrors(response);

      if (!response.catalogObject) {
        throw new Error('Category was not created');
      }

      return response.catalogObject as CatalogObject;
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Create a product set — a named collection of catalog objects used as the
   * match target of a pricing rule.
   *
   * @example
   * ```typescript
   * const set = await square.catalog.createProductSet({
   *   name: 'Wholesale items',
   *   productIdsAny: ['VAR_1', 'VAR_2'],
   * });
   * ```
   */
  async createProductSet(options: CreateProductSetOptions): Promise<CatalogObject> {
    if (!options.name) {
      throw new SquareValidationError('Product set name is required', 'name');
    }
    if (
      !options.allProducts &&
      !options.productIdsAny?.length &&
      !options.productIdsAll?.length
    ) {
      throw new SquareValidationError(
        'One of productIdsAny, productIdsAll, or allProducts is required',
        'productIdsAny'
      );
    }

    try {
      const response = await this.client.catalog.object.upsert({
        idempotencyKey: options.idempotencyKey ?? createIdempotencyKey(),
        object: {
          type: 'PRODUCT_SET',
          id: `#product_set_${String(Date.now())}`,
          productSetData: {
            name: options.name,
            productIdsAny: options.productIdsAny,
            productIdsAll: options.productIdsAll,
            allProducts: options.allProducts,
            quantityExact:
              options.quantityExact !== undefined ? BigInt(options.quantityExact) : undefined,
            quantityMin:
              options.quantityMin !== undefined ? BigInt(options.quantityMin) : undefined,
            quantityMax:
              options.quantityMax !== undefined ? BigInt(options.quantityMax) : undefined,
          },
        } as unknown as SquareCatalogObject,
      });
      assertNoResponseErrors(response);

      if (!response.catalogObject) {
        throw new Error('Product set was not created');
      }

      return response.catalogObject as CatalogObject;
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Create a pricing rule that applies a discount to a product set, optionally
   * restricted to members of given customer groups.
   *
   * @example
   * ```typescript
   * const rule = await square.catalog.createPricingRule({
   *   name: 'Wholesale 20% off',
   *   matchProductsId: productSet.id,
   *   discountId: discount.id,
   *   customerGroupIdsAny: [wholesaleGroup.id],
   * });
   * ```
   */
  async createPricingRule(options: CreatePricingRuleOptions): Promise<CatalogObject> {
    if (!options.name) {
      throw new SquareValidationError('Pricing rule name is required', 'name');
    }
    if (!options.discountId) {
      throw new SquareValidationError('discountId is required', 'discountId');
    }
    if (!options.matchProductsId) {
      throw new SquareValidationError('matchProductsId is required', 'matchProductsId');
    }

    try {
      const response = await this.client.catalog.object.upsert({
        idempotencyKey: options.idempotencyKey ?? createIdempotencyKey(),
        object: {
          type: 'PRICING_RULE',
          id: `#pricing_rule_${String(Date.now())}`,
          pricingRuleData: {
            name: options.name,
            discountId: options.discountId,
            matchProductsId: options.matchProductsId,
            applyProductsId: options.applyProductsId,
            excludeProductsId: options.excludeProductsId,
            customerGroupIdsAny: options.customerGroupIdsAny,
            timePeriodIds: options.timePeriodIds,
            validFromDate: options.validFromDate,
            validFromLocalTime: options.validFromLocalTime,
            validUntilDate: options.validUntilDate,
            validUntilLocalTime: options.validUntilLocalTime,
            minimumOrderSubtotalMoney:
              options.minimumOrderSubtotal !== undefined
                ? {
                    amount: BigInt(options.minimumOrderSubtotal),
                    currency: options.currency ?? this.defaultCurrency,
                  }
                : undefined,
          },
        } as unknown as SquareCatalogObject,
      });
      assertNoResponseErrors(response);

      if (!response.catalogObject) {
        throw new Error('Pricing rule was not created');
      }

      return response.catalogObject as CatalogObject;
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Create a time period (RFC 5545 iCalendar VEVENT) for use in time-bounded
   * pricing rules, e.g. happy-hour discounts.
   *
   * @example
   * ```typescript
   * const happyHour = await square.catalog.createTimePeriod({
   *   event: 'DTSTART:20260101T170000\nDURATION:PT2H\nRRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
   * });
   * ```
   */
  async createTimePeriod(options: CreateTimePeriodOptions): Promise<CatalogObject> {
    if (!options.event) {
      throw new SquareValidationError('Time period event is required', 'event');
    }

    try {
      const response = await this.client.catalog.object.upsert({
        idempotencyKey: options.idempotencyKey ?? createIdempotencyKey(),
        object: {
          type: 'TIME_PERIOD',
          id: `#time_period_${String(Date.now())}`,
          timePeriodData: {
            event: options.event,
          },
        } as unknown as SquareCatalogObject,
      });
      assertNoResponseErrors(response);

      if (!response.catalogObject) {
        throw new Error('Time period was not created');
      }

      return response.catalogObject as CatalogObject;
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Create a complete wholesale pricing configuration in a single atomic
   * batch upsert: a product set, a discount, and a pricing rule that links
   * them to the given customer group.
   *
   * The three objects are created together with temporary IDs so the pricing
   * rule can reference the just-created product set and discount. The customer
   * group must already exist — create it via `square.customerGroups.create`.
   *
   * @example
   * ```typescript
   * const group = await square.customerGroups.create({ name: 'Wholesale' });
   * const result = await square.catalog.createWholesalePricing({
   *   name: 'Wholesale 20% off',
   *   customerGroupId: group.id!,
   *   itemVariationIds: ['VAR_1', 'VAR_2'],
   *   discount: { percentage: '20' },
   * });
   * ```
   */
  async createWholesalePricing(
    options: CreateWholesalePricingOptions
  ): Promise<WholesalePricingResult> {
    if (!options.name) {
      throw new SquareValidationError('name is required', 'name');
    }
    if (!options.customerGroupId) {
      throw new SquareValidationError('customerGroupId is required', 'customerGroupId');
    }
    if (!options.itemVariationIds.length) {
      throw new SquareValidationError(
        'At least one itemVariationId is required',
        'itemVariationIds'
      );
    }

    const productSetId = `#wholesale_product_set_${String(Date.now())}`;
    const discountId = `#wholesale_discount_${String(Date.now())}`;
    const pricingRuleId = `#wholesale_pricing_rule_${String(Date.now())}`;

    const discountInput = options.discount;
    const discountData =
      'percentage' in discountInput
        ? {
            name: `${options.name} discount`,
            discountType: 'FIXED_PERCENTAGE' as const,
            percentage: discountInput.percentage,
          }
        : {
            name: `${options.name} discount`,
            discountType: 'FIXED_AMOUNT' as const,
            amountMoney: {
              amount: BigInt(discountInput.amount),
              currency: discountInput.currency ?? this.defaultCurrency,
            },
          };

    const batchObjects: SquareCatalogObject[] = [
      {
        type: 'PRODUCT_SET',
        id: productSetId,
        productSetData: {
          name: `${options.name} product set`,
          productIdsAny: options.itemVariationIds,
        },
      } as unknown as SquareCatalogObject,
      {
        type: 'DISCOUNT',
        id: discountId,
        discountData,
      } as unknown as SquareCatalogObject,
      {
        type: 'PRICING_RULE',
        id: pricingRuleId,
        pricingRuleData: {
          name: options.name,
          matchProductsId: productSetId,
          discountId,
          customerGroupIdsAny: [options.customerGroupId],
          validFromDate: options.validFromDate,
          validUntilDate: options.validUntilDate,
        },
      } as unknown as SquareCatalogObject,
    ];

    try {
      const response = await this.client.catalog.batchUpsert({
        idempotencyKey: options.idempotencyKey ?? createIdempotencyKey(),
        batches: [{ objects: batchObjects }],
      });
      assertNoResponseErrors(response);

      const responseObjects = (response.objects ?? []) as CatalogObject[];
      const productSet = responseObjects.find((o) => o.type === 'PRODUCT_SET');
      const discount = responseObjects.find((o) => o.type === 'DISCOUNT');
      const pricingRule = responseObjects.find((o) => o.type === 'PRICING_RULE');

      if (!productSet || !discount || !pricingRule) {
        throw new Error('Wholesale pricing batch upsert did not return all objects');
      }

      return { pricingRule, productSet, discount };
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Upsert (create or update) a catalog object
   *
   * @param catalogObject - The catalog object to upsert
   * @param idempotencyKey - Optional idempotency key
   * @returns The upserted catalog object
   *
   * @example
   * ```typescript
   * // Update an existing item's custom attributes
   * const updatedItem = await square.catalog.upsert({
   *   type: 'ITEM',
   *   id: 'EXISTING_ITEM_ID',
   *   version: existingItem.version,
   *   customAttributeValues: {
   *     'Square:some-key': { stringValue: 'new value' }
   *   },
   *   itemData: existingItem.itemData,
   * });
   *
   * // Update a variation price
   * const updatedVariation = await square.catalog.upsert({
   *   type: 'ITEM_VARIATION',
   *   id: 'EXISTING_VARIATION_ID',
   *   version: existingVariation.version,
   *   itemVariationData: {
   *     ...existingVariation.itemVariationData,
   *     priceMoney: { amount: BigInt(500), currency: 'USD' },
   *   },
   * });
   * ```
   */
  async upsert(
    catalogObject: CatalogObject,
    idempotencyKey?: string
  ): Promise<CatalogObject> {
    try {
      const response = await this.client.catalog.object.upsert({
        idempotencyKey: idempotencyKey ?? createIdempotencyKey(),
        object: catalogObject as unknown as SquareCatalogObject,
      });
      assertNoResponseErrors(response);

      if (!response.catalogObject) {
        throw new Error('Catalog object was not upserted');
      }

      return response.catalogObject as CatalogObject;
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Get a catalog object by ID
   *
   * @param objectId - Catalog object ID
   * @returns Catalog object
   *
   * @example
   * ```typescript
   * const item = await square.catalog.get('ITEM_123');
   * ```
   */
  async get(objectId: string): Promise<CatalogObject> {
    try {
      const response = await this.client.catalog.object.get({
        objectId,
        includeRelatedObjects: true,
      });
      assertNoResponseErrors(response);

      if (!response.object) {
        throw new Error('Catalog object not found');
      }

      return response.object as CatalogObject;
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Delete a catalog object
   *
   * @param objectId - Catalog object ID to delete
   *
   * @example
   * ```typescript
   * await square.catalog.delete('ITEM_123');
   * ```
   */
  async delete(objectId: string): Promise<void> {
    try {
      assertNoResponseErrors(await this.client.catalog.object.delete({ objectId }));
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Search the catalog
   *
   * @param options - Search options
   * @returns Matching catalog objects with pagination
   *
   * @example
   * ```typescript
   * // Search for items
   * const results = await square.catalog.search({
   *   objectTypes: ['ITEM'],
   *   query: 'coffee',
   * });
   *
   * // Get all categories
   * const categories = await square.catalog.search({
   *   objectTypes: ['CATEGORY'],
   * });
   * ```
   */
  async search(
    options?: SearchCatalogOptions
  ): Promise<{ data: CatalogObject[]; cursor?: string }> {
    try {
      const response = await this.client.catalog.search({
        cursor: options?.cursor,
        limit: options?.limit,
        objectTypes: options?.objectTypes,
        query: options?.query
          ? {
              textQuery: {
                keywords: [options.query],
              },
            }
          : undefined,
      });
      assertNoResponseErrors(response);

      return {
        data: (response.objects ?? []) as CatalogObject[],
        cursor: response.cursor,
      };
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Find item variations by UPC (barcode) or SKU, without listing the whole
   * catalog. Pages through every match, and returns the parent items too.
   *
   * Codes are matched exactly, not normalized: a UPC-A `012345678905` won't
   * find the same barcode stored as EAN-13 `0012345678905`. Pass both forms if
   * the catalog may hold either.
   *
   * @param options - UPCs and/or SKUs to match (exact, case insensitive)
   * @returns The matching variations and their parent items
   *
   * @example
   * ```typescript
   * const { variations, items } = await square.catalog.findVariationsByCode({
   *   upcs: ['012345678905'],
   *   skus: ['PICKLE-DILL-500'],
   * });
   * for (const v of variations) {
   *   const item = items.find((i) => i.id === v.itemVariationData?.itemId);
   *   console.log(item?.itemData?.name, v.itemVariationData?.upc);
   * }
   * ```
   */
  async findVariationsByCode(
    options: FindVariationsByCodeOptions
  ): Promise<FindVariationsByCodeResult> {
    const clean = (values?: string[]) => [
      ...new Set((values ?? []).map((v) => v.trim()).filter(Boolean)),
    ];
    const lookups = (
      [
        ['upc', clean(options.upcs)],
        ['sku', clean(options.skus)],
      ] as const
    ).filter(([, values]) => values.length > 0);
    if (lookups.length === 0) {
      throw new SquareValidationError('Give at least one UPC or SKU', 'upcs');
    }

    const variations = new Map<string, CatalogObject>();
    const items = new Map<string, CatalogObject>();

    try {
      for (const [attributeName, values] of lookups) {
        for (let i = 0; i < values.length; i += MAX_SET_QUERY_VALUES) {
          const attributeValues = values.slice(i, i + MAX_SET_QUERY_VALUES);
          let cursor: string | undefined;
          do {
            const response = await this.client.catalog.search({
              objectTypes: ['ITEM_VARIATION'],
              query: { setQuery: { attributeName, attributeValues } },
              includeRelatedObjects: true,
              cursor,
            });
            assertNoResponseErrors(response);

            for (const obj of response.objects ?? []) {
              if (obj.type === 'ITEM_VARIATION') {
                variations.set(obj.id, obj as CatalogObject);
              }
            }
            for (const obj of response.relatedObjects ?? []) {
              if (obj.type === 'ITEM') {
                items.set(obj.id, obj as CatalogObject);
              }
            }
            cursor = response.cursor;
          } while (cursor);
        }
      }

      return { variations: [...variations.values()], items: [...items.values()] };
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * List all catalog objects of a specific type
   *
   * @param objectType - Type of objects to list
   * @param options - List options
   * @returns Array of catalog objects
   *
   * @example
   * ```typescript
   * const items = await square.catalog.list('ITEM', { limit: 50 });
   * ```
   */
  async list(
    objectType: CatalogObjectType,
    options?: { limit?: number }
  ): Promise<CatalogObject[]> {
    try {
      const objects: CatalogObject[] = [];
      const limit = options?.limit;
      let cursor: string | undefined;

      do {
        const response = await this.client.catalog.search({
          objectTypes: [objectType],
          cursor,
        });
        assertNoResponseErrors(response);

        if (response.objects) {
          for (const obj of response.objects) {
            objects.push(obj as CatalogObject);
            if (limit !== undefined && objects.length >= limit) {
              return objects;
            }
          }
        }

        cursor = response.cursor;
      } while (cursor);

      return objects;
    } catch (error) {
      throw parseSquareError(error);
    }
  }

  /**
   * Batch retrieve multiple catalog objects
   *
   * @param objectIds - Array of object IDs to retrieve
   * @returns Array of catalog objects
   *
   * @example
   * ```typescript
   * const items = await square.catalog.batchGet(['ITEM_1', 'ITEM_2', 'ITEM_3']);
   * ```
   */
  async batchGet(objectIds: string[]): Promise<CatalogObject[]> {
    if (objectIds.length === 0) {
      return [];
    }

    try {
      const response = await this.client.catalog.batchGet({
        objectIds,
        includeRelatedObjects: true,
      });
      assertNoResponseErrors(response);

      return (response.objects ?? []) as CatalogObject[];
    } catch (error) {
      throw parseSquareError(error);
    }
  }
}
