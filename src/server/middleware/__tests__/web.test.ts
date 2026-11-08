import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createWebhookHandler } from '../web.js';
import { createNextWebhookHandler } from '../nextjs.js';
import { SIGNATURE_HEADER } from '../../webhook.js';

const KEY = 'test-signature-key';
const URL_ = 'https://edge.example/webhook';

// WebCrypto-only signer: the same primitive an edge runtime has.
async function sign(body: string, key = KEY, url = URL_): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(url + body));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

const BODY = JSON.stringify({
  event_id: 'evt_edge_1',
  merchant_id: 'M123',
  type: 'payment.updated',
  created_at: '2026-11-07T00:00:00Z',
  data: { type: 'payment', id: 'PAY_1', object: { payment: { id: 'PAY_1' } } },
});

function request(body: string, signature?: string, method = 'POST'): Request {
  return new Request(URL_, {
    method,
    body: method === 'POST' || method === 'PUT' ? body : undefined,
    headers: signature ? { [SIGNATURE_HEADER]: signature } : {},
  });
}

describe('createWebhookHandler (edge)', () => {
  it('verifies via WebCrypto and dispatches the parsed event', async () => {
    const handler = vi.fn();
    const webhook = createWebhookHandler({
      signatureKey: KEY,
      notificationUrl: URL_,
      handlers: { 'payment.updated': handler },
    });

    const res = await webhook(request(BODY, await sign(BODY)));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true, eventId: 'evt_edge_1' });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(JSON.parse(BODY));
  });

  it('returns 200 and runs nothing for an event type without a handler', async () => {
    const other = vi.fn();
    const webhook = createWebhookHandler({
      signatureKey: KEY,
      notificationUrl: URL_,
      handlers: { 'order.created': other },
    });

    const res = await webhook(request(BODY, await sign(BODY)));

    expect(res.status).toBe(200);
    expect(other).not.toHaveBeenCalled();
  });

  it('awaits an async handler before responding', async () => {
    let done = false;
    const webhook = createWebhookHandler({
      signatureKey: KEY,
      notificationUrl: URL_,
      handlers: {
        'payment.updated': async () => {
          await new Promise((r) => setTimeout(r, 5));
          done = true;
        },
      },
    });

    await webhook(request(BODY, await sign(BODY)));

    expect(done).toBe(true);
  });

  it.each(['GET', 'PUT'])('rejects %s with 405 without dispatching', async (method) => {
    const handler = vi.fn();
    const webhook = createWebhookHandler({
      signatureKey: KEY,
      notificationUrl: URL_,
      handlers: { 'payment.updated': handler },
    });

    const res = await webhook(request(BODY, await sign(BODY), method));

    expect(res.status).toBe(405);
    expect(await res.json()).toEqual({ error: 'Method not allowed' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns 401 for a missing signature', async () => {
    const webhook = createWebhookHandler({ signatureKey: KEY, handlers: {} });

    const res = await webhook(request(BODY));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Missing signature header' });
  });

  it('returns 401 for an invalid signature without dispatching', async () => {
    const handler = vi.fn();
    const webhook = createWebhookHandler({
      signatureKey: KEY,
      notificationUrl: URL_,
      handlers: { 'payment.updated': handler },
    });

    const res = await webhook(request(BODY, await sign(BODY, 'wrong-key')));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Invalid signature' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('verifies against config.notificationUrl', async () => {
    const webhook = createWebhookHandler({
      signatureKey: KEY,
      notificationUrl: 'https://elsewhere.example/hook',
      handlers: {},
    });

    const res = await webhook(request(BODY, await sign(BODY)));

    expect(res.status).toBe(401);
  });

  it('returns 500 when the body is not JSON', async () => {
    const body = 'not json';
    const webhook = createWebhookHandler({ signatureKey: KEY, notificationUrl: URL_, handlers: {} });

    const res = await webhook(request(body, await sign(body)));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Invalid webhook payload: failed to parse JSON' });
  });

  it('returns 500 with the handler error message when a handler throws', async () => {
    const webhook = createWebhookHandler({
      signatureKey: KEY,
      notificationUrl: URL_,
      handlers: {
        'payment.updated': () => {
          throw new Error('boom');
        },
      },
    });

    const res = await webhook(request(BODY, await sign(BODY)));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'boom' });
  });

  it('returns a generic 500 message when a handler throws a non-Error', async () => {
    const webhook = createWebhookHandler({
      signatureKey: KEY,
      notificationUrl: URL_,
      handlers: {
        'payment.updated': () => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw 'boom';
        },
      },
    });

    const res = await webhook(request(BODY, await sign(BODY)));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Webhook processing failed' });
  });

  it('uses only Web APIs (no Node imports)', () => {
    const source = readFileSync(new URL('../web.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(/from ['"]node:/);
    expect(source).not.toMatch(/Buffer/);
  });
});

describe('createNextWebhookHandler delegates to createWebhookHandler', () => {
  it('rejects non-POST with 405 like the Web handler', async () => {
    const webhook = createNextWebhookHandler({ signatureKey: KEY, handlers: {} });

    const res = await webhook(request(BODY, undefined, 'GET'));

    expect(res.status).toBe(405);
  });

  it('verifies and dispatches', async () => {
    const handler = vi.fn();
    const webhook = createNextWebhookHandler({
      signatureKey: KEY,
      notificationUrl: URL_,
      handlers: { 'payment.updated': handler },
    });

    const res = await webhook(request(BODY, await sign(BODY)));

    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalledOnce();
  });
});
