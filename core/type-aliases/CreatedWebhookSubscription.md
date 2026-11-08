[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / CreatedWebhookSubscription

# Type Alias: CreatedWebhookSubscription

> **CreatedWebhookSubscription** = `Square.WebhookSubscription` & `object`

Defined in: [core/services/webhook-subscriptions.service.ts:19](https://github.com/Bates-Solutions/squareup/blob/main/src/core/services/webhook-subscriptions.service.ts#L19)

A webhook subscription as returned by `create`, where `signatureKey` is
present and must be persisted immediately — it is never returned again.

## Type Declaration

### signatureKey

> **signatureKey**: `string`
