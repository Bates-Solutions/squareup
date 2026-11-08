import { describe, it, expect, vi } from 'vitest';
import { createHmac } from 'node:crypto';
import { verifySignatureAsync } from '../webcrypto.js';
import { verifySignature } from '../webhook.js';

// Node oracle (independent of the code under test)
function nodeSignature(body: string, key: string, url?: string): string {
  return createHmac('sha256', key)
    .update(url ? url + body : body)
    .digest('base64');
}

// WebCrypto-only signer, as an edge caller would compute it
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

const KEY = 'test-signature-key';
const URL_ = 'https://example.com/webhook';
const BODY = JSON.stringify({
  event_id: 'evt_123',
  merchant_id: 'M123',
  type: 'payment.created',
  created_at: '2025-01-03T00:00:00Z',
  data: { type: 'payment', id: 'PAY_123', object: { payment: { id: 'PAY_123' } } },
});

describe('verifySignatureAsync', () => {
  it('returns a promise', () => {
    expect(verifySignatureAsync(BODY, nodeSignature(BODY, KEY), KEY)).toBeInstanceOf(Promise);
  });

  it('accepts a valid signature without a notification URL', async () => {
    expect(await verifySignatureAsync(BODY, nodeSignature(BODY, KEY), KEY)).toEqual({ valid: true });
  });

  it('accepts a valid signature with a notification URL', async () => {
    expect(await verifySignatureAsync(BODY, nodeSignature(BODY, KEY, URL_), KEY, URL_)).toEqual({
      valid: true,
    });
  });

  it('accepts a signature computed purely with WebCrypto', async () => {
    const signature = await webCryptoSignature(BODY, KEY, URL_);
    expect(signature).toBe(nodeSignature(BODY, KEY, URL_));
    expect(await verifySignatureAsync(BODY, signature, KEY, URL_)).toEqual({ valid: true });
  });

  it('rejects a body-only signature when a notification URL is given', async () => {
    expect(await verifySignatureAsync(BODY, nodeSignature(BODY, KEY), KEY, URL_)).toEqual({
      valid: false,
      error: 'Invalid signature',
    });
  });

  it('rejects a URL signature when no notification URL is given', async () => {
    expect(await verifySignatureAsync(BODY, nodeSignature(BODY, KEY, URL_), KEY)).toEqual({
      valid: false,
      error: 'Invalid signature',
    });
  });

  it('rejects a signature made with a different key', async () => {
    expect(await verifySignatureAsync(BODY, nodeSignature(BODY, 'other-key'), KEY)).toEqual({
      valid: false,
      error: 'Invalid signature',
    });
  });

  it('rejects a signature for a tampered body', async () => {
    expect(await verifySignatureAsync(BODY + ' ', nodeSignature(BODY, KEY), KEY)).toEqual({
      valid: false,
      error: 'Invalid signature',
    });
  });

  it('rejects an equal-length signature differing only in the first character', async () => {
    const signature = nodeSignature(BODY, KEY);
    const tampered = (signature[0] === 'A' ? 'B' : 'A') + signature.slice(1);
    expect(await verifySignatureAsync(BODY, tampered, KEY)).toEqual({
      valid: false,
      error: 'Invalid signature',
    });
  });

  it('rejects an equal-length signature differing only in the last data character', async () => {
    const signature = nodeSignature(BODY, KEY);
    // Base64 of 32 bytes ends in '=', so flip the character before it.
    const tampered = signature.slice(0, -2) + (signature.at(-2) === 'A' ? 'B' : 'A') + '=';
    expect(tampered).toHaveLength(signature.length);
    expect(await verifySignatureAsync(BODY, tampered, KEY)).toEqual({
      valid: false,
      error: 'Invalid signature',
    });
  });

  it('rejects a shorter signature', async () => {
    expect(await verifySignatureAsync(BODY, btoa('short'), KEY)).toEqual({
      valid: false,
      error: 'Invalid signature',
    });
  });

  it('rejects a non-string signature', async () => {
    expect(await verifySignatureAsync(BODY, { invalid: true } as unknown as string, KEY)).toEqual({
      valid: false,
      error: 'Invalid signature',
    });
  });

  it.each([
    ['', 'sig', KEY, 'Missing request body'],
    [BODY, '', KEY, 'Missing signature header'],
    [BODY, 'sig', '', 'Missing signature key'],
  ])('reports missing input (%#)', async (body, sig, key, error) => {
    expect(await verifySignatureAsync(body, sig, key)).toEqual({ valid: false, error });
  });

  it('returns the WebCrypto error message when crypto.subtle fails', async () => {
    const spy = vi
      .spyOn(globalThis.crypto.subtle, 'importKey')
      .mockRejectedValueOnce(new Error('subtle unavailable'));
    try {
      expect(await verifySignatureAsync(BODY, nodeSignature(BODY, KEY), KEY)).toEqual({
        valid: false,
        error: 'subtle unavailable',
      });
    } finally {
      spy.mockRestore();
    }
  });

  it('falls back to a generic message when crypto.subtle rejects with a non-Error', async () => {
    const spy = vi.spyOn(globalThis.crypto.subtle, 'sign').mockRejectedValueOnce('nope');
    try {
      expect(await verifySignatureAsync(BODY, nodeSignature(BODY, KEY), KEY)).toEqual({
        valid: false,
        error: 'Signature verification failed',
      });
    } finally {
      spy.mockRestore();
    }
  });

  it('handles non-ASCII bodies and keys as UTF-8', async () => {
    const body = JSON.stringify({ note: 'café ☕' });
    const key = 'clé';
    expect(await verifySignatureAsync(body, nodeSignature(body, key), key)).toEqual({ valid: true });
  });

  it('agrees with the synchronous verifySignature on valid and invalid inputs', async () => {
    const cases: Array<[string, string, string, string | undefined]> = [
      [BODY, nodeSignature(BODY, KEY), KEY, undefined],
      [BODY, nodeSignature(BODY, KEY, URL_), KEY, URL_],
      [BODY, nodeSignature(BODY, KEY), KEY, URL_],
      [BODY, nodeSignature(BODY, 'other'), KEY, undefined],
      [BODY, 'wrong-signature', KEY, undefined],
      ['', 'sig', KEY, undefined],
      [BODY, '', KEY, undefined],
      [BODY, 'sig', '', undefined],
    ];
    for (const [body, sig, key, url] of cases) {
      expect(await verifySignatureAsync(body, sig, key, url)).toEqual(
        verifySignature(body, sig, key, url)
      );
    }
  });
});
