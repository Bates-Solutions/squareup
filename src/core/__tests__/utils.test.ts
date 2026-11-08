import { describe, it, expect, vi } from 'vitest';
import { toCents, fromCents, formatMoney, createIdempotencyKey, toSquareMoney } from '../utils.js';

describe('Money Utilities', () => {
  describe('toCents', () => {
    it('should convert dollars to cents as bigint', () => {
      expect(toCents(10)).toBe(BigInt(1000));
      expect(toCents(1.5)).toBe(BigInt(150));
      expect(toCents(0.01)).toBe(BigInt(1));
      expect(toCents(99.99)).toBe(BigInt(9999));
    });

    it('should handle zero', () => {
      expect(toCents(0)).toBe(BigInt(0));
    });

    it('should round to nearest cent', () => {
      expect(toCents(1.555)).toBe(BigInt(156));
      expect(toCents(1.554)).toBe(BigInt(155));
    });

    it('should handle JPY (zero-decimal currency)', () => {
      expect(toCents(1000, 'JPY')).toBe(BigInt(1000));
    });
  });

  describe('fromCents', () => {
    it('should convert cents to dollars', () => {
      expect(fromCents(1000)).toBe(10);
      expect(fromCents(150)).toBe(1.5);
      expect(fromCents(1)).toBe(0.01);
      expect(fromCents(9999)).toBe(99.99);
    });

    it('should handle zero', () => {
      expect(fromCents(0)).toBe(0);
    });

    it('should handle bigint', () => {
      expect(fromCents(BigInt(1000))).toBe(10);
      expect(fromCents(BigInt(150))).toBe(1.5);
    });

    it('should handle JPY (zero-decimal currency)', () => {
      expect(fromCents(1000, 'JPY')).toBe(1000);
    });
  });

  describe('formatMoney', () => {
    it('should format USD correctly', () => {
      expect(formatMoney(1000, 'USD')).toBe('$10.00');
      expect(formatMoney(150, 'USD')).toBe('$1.50');
      expect(formatMoney(1, 'USD')).toBe('$0.01');
    });

    it('should default to USD', () => {
      expect(formatMoney(1000)).toBe('$10.00');
    });

    it('should format EUR correctly', () => {
      const result = formatMoney(1000, 'EUR');
      expect(result).toContain('10');
      expect(result).toContain('00');
    });

    it('should format GBP correctly', () => {
      const result = formatMoney(1000, 'GBP');
      expect(result).toContain('10');
    });

    it('should handle bigint amounts', () => {
      expect(formatMoney(BigInt(1000), 'USD')).toBe('$10.00');
    });
  });
});

describe('createIdempotencyKey', () => {
  it('should generate a unique key', () => {
    const key1 = createIdempotencyKey();
    const key2 = createIdempotencyKey();
    expect(key1).not.toBe(key2);
  });

  it('should generate a string', () => {
    const key = createIdempotencyKey();
    expect(typeof key).toBe('string');
  });

  it('should generate a non-empty key', () => {
    const key = createIdempotencyKey();
    expect(key.length).toBeGreaterThan(0);
  });

  it('should generate a UUID format', () => {
    const key = createIdempotencyKey();
    // UUID format: 8-4-4-4-12
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('uses the portable globalThis.crypto.randomUUID', () => {
    const spy = vi
      .spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000000');
    try {
      expect(createIdempotencyKey()).toBe('00000000-0000-4000-8000-000000000000');
      expect(spy).toHaveBeenCalledOnce();
    } finally {
      spy.mockRestore();
    }
  });
});

describe('toSquareMoney', () => {
  it('should convert number amount to Square money format', () => {
    const result = toSquareMoney(10.5);
    expect(result).toEqual({
      amount: BigInt(1050),
      currency: 'USD',
    });
  });

  it('should use default USD currency', () => {
    const result = toSquareMoney(100);
    expect(result.currency).toBe('USD');
  });

  it('should use provided currency', () => {
    const result = toSquareMoney(100, 'EUR');
    expect(result.currency).toBe('EUR');
  });

  it('should handle bigint input directly', () => {
    const result = toSquareMoney(BigInt(1500), 'USD');
    expect(result).toEqual({
      amount: BigInt(1500),
      currency: 'USD',
    });
  });

  it('should handle zero amount', () => {
    const result = toSquareMoney(0);
    expect(result.amount).toBe(BigInt(0));
  });

  it('should handle JPY (zero-decimal currency)', () => {
    const result = toSquareMoney(1000, 'JPY');
    expect(result).toEqual({
      amount: BigInt(1000),
      currency: 'JPY',
    });
  });
});
