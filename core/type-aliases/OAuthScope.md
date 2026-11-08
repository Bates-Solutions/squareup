[**@bates-solutions/squareup API Reference v2.3.0**](../../README.md)

***

[@bates-solutions/squareup API Reference](../../README.md) / [core](../README.md) / OAuthScope

# Type Alias: OAuthScope

> **OAuthScope** = `"APPOINTMENTS_ALL_READ"` \| `"APPOINTMENTS_ALL_WRITE"` \| `"APPOINTMENTS_BUSINESS_SETTINGS_READ"` \| `"APPOINTMENTS_READ"` \| `"APPOINTMENTS_WRITE"` \| `"BANK_ACCOUNTS_READ"` \| `"BANK_ACCOUNTS_WRITE"` \| `"CASH_DRAWER_READ"` \| `"CUSTOMERS_READ"` \| `"CUSTOMERS_WRITE"` \| `"DEVICE_CREDENTIAL_MANAGEMENT"` \| `"DEVICES_READ"` \| `"DISPUTES_READ"` \| `"DISPUTES_WRITE"` \| `"EMPLOYEES_READ"` \| `"EMPLOYEES_WRITE"` \| `"GIFTCARDS_READ"` \| `"GIFTCARDS_WRITE"` \| `"INVENTORY_READ"` \| `"INVENTORY_WRITE"` \| `"INVOICES_READ"` \| `"INVOICES_WRITE"` \| `"ITEMS_READ"` \| `"ITEMS_WRITE"` \| `"LOYALTY_READ"` \| `"LOYALTY_WRITE"` \| `"MERCHANT_PROFILE_READ"` \| `"MERCHANT_PROFILE_WRITE"` \| `"ONLINE_STORE_SITE_READ"` \| `"ONLINE_STORE_SNIPPETS_READ"` \| `"ONLINE_STORE_SNIPPETS_WRITE"` \| `"ORDERS_READ"` \| `"ORDERS_WRITE"` \| `"PAYMENTS_READ"` \| `"PAYMENTS_WRITE"` \| `"PAYMENTS_WRITE_ADDITIONAL_RECIPIENTS"` \| `"PAYOUTS_READ"` \| `"SUBSCRIPTIONS_READ"` \| `"SUBSCRIPTIONS_WRITE"` \| `"TIMECARDS_READ"` \| `"TIMECARDS_SETTINGS_READ"` \| `"TIMECARDS_SETTINGS_WRITE"` \| `"TIMECARDS_WRITE"` \| `"VENDOR_READ"` \| `"VENDOR_WRITE"` \| `string` & `object`

Defined in: [core/oauth.ts:13](https://github.com/Bates-Solutions/squareup/blob/main/src/core/oauth.ts#L13)

Square OAuth permission (scope) names.

Any other string is also accepted so newly added Square scopes work without
a library update, but the known names autocomplete and catch typos.

## See

https://developer.squareup.com/docs/oauth-api/square-permissions
