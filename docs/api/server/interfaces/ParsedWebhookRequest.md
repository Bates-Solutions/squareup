[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / ParsedWebhookRequest

# Interface: ParsedWebhookRequest

Defined in: [server/types.ts:141](https://github.com/Bates-Solutions/squareup/blob/main/src/server/types.ts#L141)

Parsed webhook request

## Properties

### event

> **event**: [`WebhookEvent`](WebhookEvent.md)

Defined in: [server/types.ts:147](https://github.com/Bates-Solutions/squareup/blob/main/src/server/types.ts#L147)

Parsed event data

***

### rawBody

> **rawBody**: `string`

Defined in: [server/types.ts:143](https://github.com/Bates-Solutions/squareup/blob/main/src/server/types.ts#L143)

The raw request body

***

### signature

> **signature**: `string`

Defined in: [server/types.ts:145](https://github.com/Bates-Solutions/squareup/blob/main/src/server/types.ts#L145)

The signature from headers
