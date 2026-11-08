import { describe, it, expect, vi } from 'vitest';
import { createHmac } from 'crypto';
import { readFileSync } from 'node:fs';
import {
  verifySignature,
  parseWebhookEvent,
  parseAndVerifyWebhook,
  processWebhookEvent,
  createWebhookProcessor,
  getPaymentId,
  getOrderId,
  getCustomerId,
  SIGNATURE_HEADER,
} from '../webhook.js';
import type { WebhookEvent, WebhookConfig } from '../types.js';

// Helper to generate valid signature
function generateSignature(body: string, key: string, url?: string): string {
  const stringToSign = url ? url + body : body;
  return createHmac('sha256', key).update(stringToSign).digest('base64');
}

// Independent WebCrypto-only signer, as an edge caller would compute it
async function webCryptoSignature(body: string, key: string, url?: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode((url ?? '') + body));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

// Sample webhook event
const sampleEvent: WebhookEvent = {
  event_id: 'evt_123',
  merchant_id: 'M123',
  type: 'payment.created',
  created_at: '2025-01-03T00:00:00Z',
  data: {
    type: 'payment',
    id: 'PAY_123',
    object: { payment: { id: 'PAY_123', status: 'COMPLETED' } },
  },
};

describe('webhook', () => {
  describe('SIGNATURE_HEADER', () => {
    it('should be the correct header name', () => {
      expect(SIGNATURE_HEADER).toBe('x-square-hmacsha256-signature');
    });
  });

  describe('verifySignature', () => {
    const signatureKey = 'test-signature-key';
    const rawBody = JSON.stringify(sampleEvent);

    it('returns a promise', () => {
      const signature = generateSignature(rawBody, signatureKey);
      expect(verifySignature(rawBody, signature, signatureKey)).toBeInstanceOf(Promise);
    });

    it('should return valid for correct signature', async () => {
      const signature = generateSignature(rawBody, signatureKey);
      const result = await verifySignature(rawBody, signature, signatureKey);

      expect(result).toEqual({ valid: true });
    });

    it('should return valid for correct signature with notification URL', async () => {
      const notificationUrl = 'https://example.com/webhook';
      const signature = generateSignature(rawBody, signatureKey, notificationUrl);
      const result = await verifySignature(rawBody, signature, signatureKey, notificationUrl);

      expect(result).toEqual({ valid: true });
    });

    it('rejects a body-only signature when a notification URL is given', async () => {
      const signature = generateSignature(rawBody, signatureKey);
      const result = await verifySignature(
        rawBody,
        signature,
        signatureKey,
        'https://example.com/webhook'
      );

      expect(result).toEqual({ valid: false, error: 'Invalid signature' });
    });

    it('rejects a URL signature when no notification URL is given', async () => {
      const signature = generateSignature(rawBody, signatureKey, 'https://example.com/webhook');
      const result = await verifySignature(rawBody, signature, signatureKey);

      expect(result).toEqual({ valid: false, error: 'Invalid signature' });
    });

    it('rejects a signature made with a different key', async () => {
      const signature = generateSignature(rawBody, 'other-key');
      const result = await verifySignature(rawBody, signature, signatureKey);

      expect(result).toEqual({ valid: false, error: 'Invalid signature' });
    });

    it('rejects a signature for a tampered body', async () => {
      const signature = generateSignature(rawBody, signatureKey);
      const result = await verifySignature(rawBody + ' ', signature, signatureKey);

      expect(result).toEqual({ valid: false, error: 'Invalid signature' });
    });

    it('rejects a same-length signature that differs only in the last character', async () => {
      const signature = generateSignature(rawBody, signatureKey);
      const last = signature.at(-2) === 'A' ? 'B' : 'A';
      // Base64 of 32 bytes ends in '=', so flip the last data character instead.
      const tampered = signature.slice(0, -2) + last + signature.slice(-1);
      expect(tampered).toHaveLength(signature.length);

      const result = await verifySignature(rawBody, tampered, signatureKey);

      expect(result).toEqual({ valid: false, error: 'Invalid signature' });
    });

    it('rejects a same-length signature that differs only in the first character', async () => {
      const signature = generateSignature(rawBody, signatureKey);
      const tampered = (signature[0] === 'A' ? 'B' : 'A') + signature.slice(1);

      const result = await verifySignature(rawBody, tampered, signatureKey);

      expect(result).toEqual({ valid: false, error: 'Invalid signature' });
    });

    it('should return invalid for wrong signature', async () => {
      const result = await verifySignature(rawBody, 'wrong-signature', signatureKey);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });

    it('should return invalid for missing body', async () => {
      const signature = generateSignature(rawBody, signatureKey);
      const result = await verifySignature('', signature, signatureKey);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing request body');
    });

    it('should return invalid for missing signature', async () => {
      const result = await verifySignature(rawBody, '', signatureKey);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing signature header');
    });

    it('should return invalid for missing signature key', async () => {
      const signature = generateSignature(rawBody, signatureKey);
      const result = await verifySignature(rawBody, signature, '');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing signature key');
    });

    it('should return invalid for signature length mismatch', async () => {
      const shortSignature = Buffer.from('short').toString('base64');
      const result = await verifySignature(rawBody, shortSignature, signatureKey);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });

    it('rejects a non-string signature', async () => {
      const result = await verifySignature(
        rawBody,
        { invalid: true } as unknown as string,
        signatureKey
      );

      expect(result).toEqual({ valid: false, error: 'Invalid signature' });
    });

    it('returns the WebCrypto error message when crypto.subtle fails', async () => {
      const spy = vi
        .spyOn(globalThis.crypto.subtle, 'importKey')
        .mockRejectedValueOnce(new Error('subtle unavailable'));
      try {
        const signature = generateSignature(rawBody, signatureKey);
        const result = await verifySignature(rawBody, signature, signatureKey);

        expect(result).toEqual({ valid: false, error: 'subtle unavailable' });
      } finally {
        spy.mockRestore();
      }
    });

    it('falls back to a generic message when crypto.subtle rejects with a non-Error', async () => {
      const spy = vi
        .spyOn(globalThis.crypto.subtle, 'sign')
        .mockRejectedValueOnce('nope');
      try {
        const signature = generateSignature(rawBody, signatureKey);
        const result = await verifySignature(rawBody, signature, signatureKey);

        expect(result).toEqual({ valid: false, error: 'Signature verification failed' });
      } finally {
        spy.mockRestore();
      }
    });

    it('verifies a signature computed purely with WebCrypto (no node:crypto)', async () => {
      const notificationUrl = 'https://edge.example/webhook';
      const signature = await webCryptoSignature(rawBody, signatureKey, notificationUrl);

      expect(signature).toBe(generateSignature(rawBody, signatureKey, notificationUrl));
      expect(await verifySignature(rawBody, signature, signatureKey, notificationUrl)).toEqual({
        valid: true,
      });
    });

    it('handles non-ASCII bodies and keys as UTF-8', async () => {
      const body = JSON.stringify({ ...sampleEvent, note: 'caf\u00e9 \u2615' });
      const key = 'cl\u00e9';
      const signature = generateSignature(body, key);

      expect(await verifySignature(body, signature, key)).toEqual({ valid: true });
    });

    it('does not import node:crypto', () => {
      const source = readFileSync(new URL('../webhook.ts', import.meta.url), 'utf8');
      expect(source).not.toMatch(/from ['"](node:)?crypto['"]/);
    });
  });

  describe('parseWebhookEvent', () => {
    it('should parse valid JSON body', () => {
      const rawBody = JSON.stringify(sampleEvent);
      const event = parseWebhookEvent(rawBody);

      expect(event.event_id).toBe('evt_123');
      expect(event.type).toBe('payment.created');
      expect(event.data.id).toBe('PAY_123');
    });

    it('should throw for invalid JSON', () => {
      expect(() => parseWebhookEvent('not valid json')).toThrow(
        'Invalid webhook payload: failed to parse JSON'
      );
    });

    it('should throw for empty body', () => {
      expect(() => parseWebhookEvent('')).toThrow(
        'Invalid webhook payload: failed to parse JSON'
      );
    });
  });

  describe('parseAndVerifyWebhook', () => {
    const signatureKey = 'test-key';
    const rawBody = JSON.stringify(sampleEvent);

    it('should return parsed request for valid signature', async () => {
      const signature = generateSignature(rawBody, signatureKey);
      const result = await parseAndVerifyWebhook(rawBody, signature, signatureKey);

      expect(result.rawBody).toBe(rawBody);
      expect(result.signature).toBe(signature);
      expect(result.event.event_id).toBe('evt_123');
    });

    it('verifies against the notification URL when given', async () => {
      const url = 'https://example.com/webhook';
      const signature = generateSignature(rawBody, signatureKey, url);

      await expect(parseAndVerifyWebhook(rawBody, signature, signatureKey, url)).resolves.toMatchObject({
        event: { event_id: 'evt_123' },
      });
      await expect(parseAndVerifyWebhook(rawBody, signature, signatureKey)).rejects.toThrow(
        'Invalid signature'
      );
    });

    it('should throw for invalid signature', async () => {
      await expect(parseAndVerifyWebhook(rawBody, 'wrong', signatureKey)).rejects.toThrow(
        'Invalid signature'
      );
    });

    it('should throw for missing body', async () => {
      const signature = generateSignature(rawBody, signatureKey);
      await expect(parseAndVerifyWebhook('', signature, signatureKey)).rejects.toThrow(
        'Missing request body'
      );
    });
  });

  describe('processWebhookEvent', () => {
    it('should call handler for matching event type', async () => {
      const handler = vi.fn();
      const config: WebhookConfig = {
        signatureKey: 'key',
        handlers: {
          'payment.created': handler,
        },
      };

      await processWebhookEvent(sampleEvent, config);

      expect(handler).toHaveBeenCalledWith(sampleEvent);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not throw for unhandled event type', async () => {
      const config: WebhookConfig = {
        signatureKey: 'key',
        handlers: {
          'order.created': vi.fn(),
        },
      };

      await expect(processWebhookEvent(sampleEvent, config)).resolves.toBeUndefined();
    });

    it('should await async handlers', async () => {
      let resolved = false;
      const asyncHandler = vi.fn(async () => {
        await new Promise((r) => setTimeout(r, 10));
        resolved = true;
      });

      const config: WebhookConfig = {
        signatureKey: 'key',
        handlers: {
          'payment.created': asyncHandler,
        },
      };

      await processWebhookEvent(sampleEvent, config);

      expect(resolved).toBe(true);
    });
  });

  describe('createWebhookProcessor', () => {
    const signatureKey = 'test-key';
    const rawBody = JSON.stringify(sampleEvent);

    it('should return success for valid request', async () => {
      const handler = vi.fn();
      const processor = createWebhookProcessor({
        signatureKey,
        handlers: { 'payment.created': handler },
      });

      const signature = generateSignature(rawBody, signatureKey);
      const result = await processor(rawBody, signature);

      expect(result.success).toBe(true);
      expect(result.event).toBeDefined();
      expect(result.event?.event_id).toBe('evt_123');
      expect(handler).toHaveBeenCalled();
    });

    it('should return error for invalid signature', async () => {
      const processor = createWebhookProcessor({
        signatureKey,
        handlers: {},
      });

      const result = await processor(rawBody, 'wrong-signature');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });

    it('should never dispatch a forged event, even with throwOnInvalidSignature: false', async () => {
      const handler = vi.fn();
      const processor = createWebhookProcessor({
        signatureKey,
        throwOnInvalidSignature: false,
        handlers: { 'payment.created': handler },
      });

      const result = await processor(rawBody, 'wrong-signature');

      expect(result.success).toBe(false);
      expect(result.event).toBeUndefined();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should return error for invalid JSON body', async () => {
      const processor = createWebhookProcessor({
        signatureKey,
        handlers: {},
      });

      const invalidBody = 'not json';
      const signature = generateSignature(invalidBody, signatureKey);
      const result = await processor(invalidBody, signature);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid webhook payload');
    });

    it('should catch handler errors', async () => {
      const processor = createWebhookProcessor({
        signatureKey,
        handlers: {
          'payment.created': () => {
            throw new Error('Handler error');
          },
        },
      });

      const signature = generateSignature(rawBody, signatureKey);
      const result = await processor(rawBody, signature);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Handler error');
    });

    it('should use notification URL when provided', async () => {
      const notificationUrl = 'https://example.com/webhook';
      const processor = createWebhookProcessor({
        signatureKey,
        notificationUrl,
        handlers: {},
      });

      // Signature without URL should fail
      const signatureWithoutUrl = generateSignature(rawBody, signatureKey);
      const result1 = await processor(rawBody, signatureWithoutUrl);
      expect(result1.success).toBe(false);

      // Signature with URL should succeed
      const signatureWithUrl = generateSignature(rawBody, signatureKey, notificationUrl);
      const result2 = await processor(rawBody, signatureWithUrl);
      expect(result2.success).toBe(true);
    });
  });

  describe('getPaymentId', () => {
    it('should extract payment ID from payment event', () => {
      const event: WebhookEvent = {
        event_id: 'evt_1', merchant_id: 'M1', type: 'payment.completed', created_at: '',
        data: { type: 'payment', id: 'PAY_1', object: { payment: { id: 'PAY_1', status: 'COMPLETED' } } },
      };
      expect(getPaymentId(event)).toBe('PAY_1');
    });

    it('should extract payment ID from refund event', () => {
      const event: WebhookEvent = {
        event_id: 'evt_1', merchant_id: 'M1', type: 'refund.created', created_at: '',
        data: { type: 'refund', id: 'REF_1', object: { refund: { id: 'REF_1', payment_id: 'PAY_1', status: 'PENDING' } } },
      };
      expect(getPaymentId(event)).toBe('PAY_1');
    });

    it('should handle malformed payment payload gracefully', () => {
      const event: WebhookEvent = {
        event_id: 'evt_1', merchant_id: 'M1', type: 'payment.completed', created_at: '',
        data: { type: 'payment', id: 'PAY_1', object: {} },
      };
      expect(getPaymentId(event)).toBe('PAY_1');
    });

    it('should return undefined for unrelated event', () => {
      const event: WebhookEvent = {
        event_id: 'evt_1', merchant_id: 'M1', type: 'order.created', created_at: '',
        data: { type: 'order', id: 'ORD_1', object: {} },
      };
      expect(getPaymentId(event)).toBeUndefined();
    });
  });

  describe('getOrderId', () => {
    it('should extract order ID from payment event', () => {
      const event: WebhookEvent = {
        event_id: 'evt_1', merchant_id: 'M1', type: 'payment.completed', created_at: '',
        data: { type: 'payment', id: 'PAY_1', object: { payment: { id: 'PAY_1', order_id: 'ORD_1', status: 'COMPLETED' } } },
      };
      expect(getOrderId(event)).toBe('ORD_1');
    });

    it('should extract order ID from order event', () => {
      const event: WebhookEvent = {
        event_id: 'evt_1', merchant_id: 'M1', type: 'order.updated', created_at: '',
        data: { type: 'order', id: 'ORD_1', object: { order_update: { order_id: 'ORD_1', state: 'OPEN', version: 1 } } },
      };
      expect(getOrderId(event)).toBe('ORD_1');
    });

    it('should extract order ID from refund event', () => {
      const event: WebhookEvent = {
        event_id: 'evt_1', merchant_id: 'M1', type: 'refund.updated', created_at: '',
        data: { type: 'refund', id: 'REF_1', object: { refund: { id: 'REF_1', payment_id: 'PAY_1', order_id: 'ORD_1', status: 'COMPLETED' } } },
      };
      expect(getOrderId(event)).toBe('ORD_1');
    });

    it('should handle malformed payment payload gracefully', () => {
      const event: WebhookEvent = {
        event_id: 'evt_1', merchant_id: 'M1', type: 'payment.completed', created_at: '',
        data: { type: 'payment', id: 'PAY_1', object: {} },
      };
      expect(getOrderId(event)).toBeUndefined();
    });

    it('should return undefined for unrelated event', () => {
      const event: WebhookEvent = {
        event_id: 'evt_1', merchant_id: 'M1', type: 'customer.created', created_at: '',
        data: { type: 'customer', id: 'CUST_1', object: {} },
      };
      expect(getOrderId(event)).toBeUndefined();
    });
  });

  describe('getCustomerId', () => {
    it('should extract customer ID from payment event', () => {
      const event: WebhookEvent = {
        event_id: 'evt_1', merchant_id: 'M1', type: 'payment.created', created_at: '',
        data: { type: 'payment', id: 'PAY_1', object: { payment: { id: 'PAY_1', customer_id: 'CUST_1', status: 'COMPLETED' } } },
      };
      expect(getCustomerId(event)).toBe('CUST_1');
    });

    it('should extract customer ID from customer event', () => {
      const event: WebhookEvent = {
        event_id: 'evt_1', merchant_id: 'M1', type: 'customer.updated', created_at: '',
        data: { type: 'customer', id: 'CUST_1', object: {} },
      };
      expect(getCustomerId(event)).toBe('CUST_1');
    });

    it('should handle malformed payment payload gracefully', () => {
      const event: WebhookEvent = {
        event_id: 'evt_1', merchant_id: 'M1', type: 'payment.created', created_at: '',
        data: { type: 'payment', id: 'PAY_1', object: {} },
      };
      expect(getCustomerId(event)).toBeUndefined();
    });

    it('should return undefined for unrelated event', () => {
      const event: WebhookEvent = {
        event_id: 'evt_1', merchant_id: 'M1', type: 'order.created', created_at: '',
        data: { type: 'order', id: 'ORD_1', object: {} },
      };
      expect(getCustomerId(event)).toBeUndefined();
    });
  });
});
