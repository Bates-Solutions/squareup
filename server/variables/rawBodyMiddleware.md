[**@bates-solutions/squareup API Reference v2.4.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [server](../README.md) / rawBodyMiddleware

# Variable: rawBodyMiddleware

> `const` **rawBodyMiddleware**: [`ExpressRequestHandler`](../type-aliases/ExpressRequestHandler.md)

Defined in: [server/middleware/express.ts:208](https://github.com/Bates-Solutions/squareup/blob/main/src/server/middleware/express.ts#L208)

Raw body parser middleware for Express

Captures the raw body before JSON parsing for signature verification.
Use this if you need to parse JSON but also need the raw body.

## Example

```typescript
import express from 'express';
import { rawBodyMiddleware } from '@bates-solutions/squareup/server';

const app = express();
app.use('/webhook', rawBodyMiddleware);
app.use('/webhook', express.json());
```
