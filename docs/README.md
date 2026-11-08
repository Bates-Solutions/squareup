# @bates-solutions/squareup Documentation

Welcome to the documentation for `@bates-solutions/squareup`, a TypeScript wrapper for the Square API with webhook support for Node.js backends.

## Getting Started

- [Installation](./getting-started/installation.md) - How to install the package
- [Quick Start](./getting-started/quick-start.md) - Get running in 5 minutes
- [Configuration](./getting-started/configuration.md) - Environment setup and options

## Guides

### Core (Backend)

- [Payments](./guides/core/payments.md) - Processing payments
- [Orders](./guides/core/orders.md) - Managing orders
- [Customers](./guides/core/customers.md) - Customer operations
- [Customer Groups](./guides/core/customer-groups.md) - Customer groups for wholesale tiers and member pricing
- [Catalog](./guides/core/catalog.md) - Product catalog and pricing rules
- [Subscriptions](./guides/core/subscriptions.md) - Recurring billing (flat-rate and product-driven via order templates)
- [Invoices](./guides/core/invoices.md) - Create/update invoices, incl. accepted payment methods
- [Gift Cards](./guides/core/gift-cards.md) - Gift card lifecycle: issue, activate, load, redeem, link to customers
- [Locations](./guides/core/locations.md) - List/get merchant locations; derive currency, country, status
- [Inventory](./guides/core/inventory.md) - Stock counts, adjustments, transfers; upgrading from 1.x
- [OAuth](./guides/core/oauth.md) - Connect sellers' Square accounts: authorize URL, tokens, refresh, revoke
- [Errors and Retries](./guides/core/errors.md) - Error classes, network failures, and retrying safely

### Server

- [Webhooks](./guides/server/webhooks.md) - Webhook handling
- [Webhook Subscriptions](./guides/server/webhook-subscriptions.md) - Manage subscriptions (create/list/update/delete/test/rotate key)
- [Middleware](./guides/server/middleware.md) - Express, Next.js integration

### Deployment

- [Bundle Size & Memory on AWS Lambda](./guides/deployment/lambda-bundle-size.md) - `--external:square`, memory sizing, why RSS is upstream

## API Reference

Complete API reference generated from source code with TypeDoc:

- [Core Module](./api/core/README.md) - Client, services, utilities, error handling
- [Server Module](./api/server/README.md) - Webhook handlers, middleware

See also the [Quick Reference](./api-reference.md) for a summary of all exports.

## Additional Resources

- [GitHub Repository](https://github.com/Bates-Solutions/squareup)
- [Square Developer Documentation](https://developer.squareup.com/docs)
- [Changelog](../CHANGELOG.md)
