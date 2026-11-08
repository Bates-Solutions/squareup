import { SquareClient as SdkClient, SquareEnvironment as SdkEnvironment } from 'square';
import type { SquareEnvironment } from './types/index.js';
import { assertNoResponseErrors, parseSquareError, SquareError, SquareValidationError } from './errors.js';

/**
 * Square OAuth permission (scope) names.
 *
 * Any other string is also accepted so newly added Square scopes work without
 * a library update, but the known names autocomplete and catch typos.
 *
 * @see https://developer.squareup.com/docs/oauth-api/square-permissions
 */
export type OAuthScope =
  | 'APPOINTMENTS_ALL_READ'
  | 'APPOINTMENTS_ALL_WRITE'
  | 'APPOINTMENTS_BUSINESS_SETTINGS_READ'
  | 'APPOINTMENTS_READ'
  | 'APPOINTMENTS_WRITE'
  | 'BANK_ACCOUNTS_READ'
  | 'BANK_ACCOUNTS_WRITE'
  | 'CASH_DRAWER_READ'
  | 'CUSTOMERS_READ'
  | 'CUSTOMERS_WRITE'
  | 'DEVICE_CREDENTIAL_MANAGEMENT'
  | 'DEVICES_READ'
  | 'DISPUTES_READ'
  | 'DISPUTES_WRITE'
  | 'EMPLOYEES_READ'
  | 'EMPLOYEES_WRITE'
  | 'GIFTCARDS_READ'
  | 'GIFTCARDS_WRITE'
  | 'INVENTORY_READ'
  | 'INVENTORY_WRITE'
  | 'INVOICES_READ'
  | 'INVOICES_WRITE'
  | 'ITEMS_READ'
  | 'ITEMS_WRITE'
  | 'LOYALTY_READ'
  | 'LOYALTY_WRITE'
  | 'MERCHANT_PROFILE_READ'
  | 'MERCHANT_PROFILE_WRITE'
  | 'ONLINE_STORE_SITE_READ'
  | 'ONLINE_STORE_SNIPPETS_READ'
  | 'ONLINE_STORE_SNIPPETS_WRITE'
  | 'ORDERS_READ'
  | 'ORDERS_WRITE'
  | 'PAYMENTS_READ'
  | 'PAYMENTS_WRITE'
  | 'PAYMENTS_WRITE_ADDITIONAL_RECIPIENTS'
  | 'PAYOUTS_READ'
  | 'SUBSCRIPTIONS_READ'
  | 'SUBSCRIPTIONS_WRITE'
  | 'TIMECARDS_READ'
  | 'TIMECARDS_SETTINGS_READ'
  | 'TIMECARDS_SETTINGS_WRITE'
  | 'TIMECARDS_WRITE'
  | 'VENDOR_READ'
  | 'VENDOR_WRITE'
  // Preserves autocomplete for the names above while accepting any string.
  | (string & {});

/**
 * Options for {@link buildAuthorizeUrl}
 */
export interface BuildAuthorizeUrlOptions {
  /** Application ID (sandbox IDs start with `sandbox-`) */
  clientId: string;
  /**
   * Selects the authorize host: `connect.squareup.com` (production) or
   * `connect.squareupsandbox.com` (sandbox).
   * @default 'sandbox'
   */
  environment?: SquareEnvironment;
  /** Permissions to request from the seller. Must not be empty. */
  scopes: OAuthScope[];
  /**
   * Unguessable CSRF token, returned unchanged on the redirect. Verify it in
   * your callback before exchanging the code. You can also use it to carry
   * which tenant started the flow.
   */
  state: string;
  /**
   * Whether an existing Square Dashboard session may be reused. Square
   * requires `false` for production apps so the seller explicitly picks the
   * account. Ignored by Square in sandbox.
   * @default false
   */
  session?: boolean;
  /** Authorization page language, e.g. `en-US`, `en-CA`, `es-US`, `fr-CA`, `ja-JP` */
  locale?: string;
  /** Must match the redirect URL configured for the application, if set */
  redirectUri?: string;
}

/**
 * Build the URL that sends a seller to Square to authorize your application
 * (OAuth code flow). Pure function — no network call.
 *
 * @example
 * ```typescript
 * const url = buildAuthorizeUrl({
 *   clientId: process.env.SQUARE_APP_ID!,
 *   environment: 'production',
 *   scopes: ['ORDERS_READ', 'MERCHANT_PROFILE_READ'],
 *   state: csrfToken, // random per attempt; store it server side to check in the callback
 * });
 * // redirect the seller to `url`
 * ```
 */
export function buildAuthorizeUrl(options: BuildAuthorizeUrlOptions): string {
  requireNonEmpty(options.clientId, 'clientId');
  requireNonEmpty(options.state, 'state');
  if (options.scopes.length === 0) {
    throw new SquareValidationError('scopes must contain at least one permission', 'scopes');
  }

  const host =
    options.environment === 'production'
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';
  const url = new URL('/oauth2/authorize', host);

  url.searchParams.set('client_id', options.clientId);
  // URLSearchParams encodes the space separator as `+`, the form Square documents.
  url.searchParams.set('scope', options.scopes.join(' '));
  url.searchParams.set('session', String(options.session ?? false));
  url.searchParams.set('state', options.state);
  if (options.locale) url.searchParams.set('locale', options.locale);
  if (options.redirectUri) url.searchParams.set('redirect_uri', options.redirectUri);

  return url.toString();
}

/**
 * Configuration for {@link SquareOAuthClient}. Uses the application's
 * credentials, not a merchant access token.
 */
export interface SquareOAuthClientConfig {
  /** Application ID */
  clientId: string;
  /** Application secret (Developer Console → OAuth). Never logged or put in errors. */
  clientSecret: string;
  /** @default 'sandbox' */
  environment?: SquareEnvironment;
}

/**
 * Tokens returned by {@link SquareOAuthClient.obtainToken} and
 * {@link SquareOAuthClient.refreshToken}.
 */
export interface OAuthTokens {
  /** Merchant access token — use as `accessToken` in `createSquareClient` */
  accessToken: string;
  /** Always `'bearer'` */
  tokenType: string;
  /** When `accessToken` expires (30 days after issue). Refresh well before this. */
  expiresAt: Date;
  /** Merchant the tokens belong to */
  merchantId: string;
  /**
   * Refresh token. For the code flow with a client secret this does not
   * expire, and Square returns the same value on refresh.
   */
  refreshToken: string;
  /** Only set when the refresh token itself expires (PKCE flow) */
  refreshTokenExpiresAt?: Date;
}

/**
 * Status of a merchant access token, from `square.oauth.tokenStatus()`.
 */
export interface OAuthTokenStatus {
  /** Permissions granted to the token */
  scopes: string[];
  /** When the token expires. Absent for personal access tokens, which do not expire. */
  expiresAt?: Date;
  /** Application the token was issued to */
  clientId?: string;
  /** Merchant the token belongs to */
  merchantId?: string;
}

/**
 * OAuth client for the application-credential endpoints: exchanging an
 * authorization code, refreshing, and revoking tokens.
 *
 * These endpoints authenticate with the application's `clientId` /
 * `clientSecret`, not a merchant token — which is why this is separate from
 * {@link SquareClient}. To check a merchant token's status, use
 * `createSquareClient({ accessToken }).oauth.tokenStatus()`.
 *
 * @example
 * ```typescript
 * const oauth = createSquareOAuthClient({
 *   clientId: process.env.SQUARE_APP_ID!,
 *   clientSecret: process.env.SQUARE_APP_SECRET!,
 *   environment: 'production',
 * });
 *
 * // In the redirect handler, after verifying `state`: require a stored value,
 * // delete it (one use), then compare it with the query value. Then handle a
 * // deny (`error=access_denied`, no `code`) and require `code` to be a string.
 * // See docs/guides/core/oauth.md.
 * const tokens = await oauth.obtainToken({ code });
 * ```
 */
export class SquareOAuthClient {
  readonly #client: SdkClient;
  readonly #clientId: string;
  // ES private field: kept out of JSON.stringify, console.log and error output.
  readonly #clientSecret: string;

  constructor(config: SquareOAuthClientConfig) {
    requireNonEmpty(config.clientId, 'clientId');
    requireNonEmpty(config.clientSecret, 'clientSecret');

    this.#clientId = config.clientId;
    this.#clientSecret = config.clientSecret;
    const secret = config.clientSecret;

    this.#client = new SdkClient({
      environment:
        config.environment === 'production' ? SdkEnvironment.Production : SdkEnvironment.Sandbox,
      // RevokeToken requires `Authorization: Client <secret>`; ObtainToken sends
      // the secret in its body and ignores this header.
      auth: () => Promise.resolve({ headers: { Authorization: `Client ${secret}` } }),
    });
  }

  /**
   * Exchange the authorization `code` from the OAuth redirect for tokens.
   *
   * @param options.code - `code` query parameter from the redirect (valid for 5 minutes)
   * @param options.redirectUri - Required if the authorize URL included one; must match
   *
   * @example
   * ```typescript
   * // After the state check (see docs/guides/core/oauth.md)
   * if (typeof req.query.error === 'string') return res.redirect('/settings?connect=denied');
   * if (typeof req.query.code !== 'string') throw new Error('OAuth code missing');
   *
   * const { accessToken, refreshToken, expiresAt, merchantId } =
   *   await oauth.obtainToken({ code: req.query.code });
   * ```
   */
  async obtainToken(options: { code: string; redirectUri?: string }): Promise<OAuthTokens> {
    requireNonEmpty(options.code, 'code');

    return this.requestToken({
      grantType: 'authorization_code',
      code: options.code,
      redirectUri: options.redirectUri,
    });
  }

  /**
   * Get a new access token using a refresh token. Run this on a schedule
   * well before `expiresAt` — Square recommends every 7 days or less.
   *
   * @example
   * ```typescript
   * const refreshed = await oauth.refreshToken({ refreshToken: stored.refreshToken });
   * ```
   */
  async refreshToken(options: { refreshToken: string }): Promise<OAuthTokens> {
    requireNonEmpty(options.refreshToken, 'refreshToken');

    return this.requestToken({ grantType: 'refresh_token', refreshToken: options.refreshToken });
  }

  /**
   * Revoke this application's access to a merchant. Pass the merchant's
   * `merchantId` to revoke every token issued to them, or an `accessToken`
   * to revoke that token (and its merchant's other tokens).
   *
   * @param options.revokeOnlyAccessToken - Revoke only `accessToken`, leaving
   *   the refresh token and the authorization intact
   *
   * @example
   * ```typescript
   * await oauth.revokeToken({ merchantId: tenant.squareMerchantId });
   * ```
   */
  async revokeToken(
    options:
      | { merchantId: string; accessToken?: never; revokeOnlyAccessToken?: never }
      | { accessToken: string; merchantId?: never; revokeOnlyAccessToken?: boolean }
  ): Promise<void> {
    // The union guards typed callers only; check the shape untyped input can take.
    const { merchantId, accessToken, revokeOnlyAccessToken } = options as {
      merchantId?: string;
      accessToken?: string;
      revokeOnlyAccessToken?: boolean;
    };
    if (!merchantId && !accessToken) {
      throw new SquareValidationError('Provide merchantId or accessToken', 'merchantId');
    }
    if (merchantId && accessToken) {
      throw new SquareValidationError('Provide merchantId or accessToken, not both', 'merchantId');
    }
    if (merchantId && revokeOnlyAccessToken !== undefined) {
      throw new SquareValidationError(
        'revokeOnlyAccessToken requires accessToken',
        'revokeOnlyAccessToken'
      );
    }

    let response;
    try {
      response = await this.#client.oAuth.revokeToken({
        clientId: this.#clientId,
        merchantId,
        accessToken,
        revokeOnlyAccessToken,
      });
    } catch (error) {
      throw parseSquareError(error);
    }

    assertNoResponseErrors(response);
    if (!response.success) {
      throw new SquareError('Square did not confirm the token revocation');
    }
  }

  private async requestToken(grant: {
    grantType: 'authorization_code' | 'refresh_token';
    code?: string;
    redirectUri?: string;
    refreshToken?: string;
  }): Promise<OAuthTokens> {
    let response;
    try {
      response = await this.#client.oAuth.obtainToken({
        clientId: this.#clientId,
        clientSecret: this.#clientSecret,
        ...grant,
      });
    } catch (error) {
      throw parseSquareError(error);
    }

    assertNoResponseErrors(response);

    const { accessToken, tokenType, expiresAt, merchantId } = response;
    // The code flow keeps one refresh token; fall back if a refresh omits it.
    const refreshToken = response.refreshToken ?? grant.refreshToken;
    if (!accessToken || !expiresAt || !merchantId || !refreshToken) {
      throw new SquareError('Square returned an incomplete token response');
    }

    return {
      accessToken,
      tokenType: tokenType ?? 'bearer',
      expiresAt: parseSquareDate(expiresAt, 'expires_at'),
      merchantId,
      refreshToken,
      ...(response.refreshTokenExpiresAt && {
        refreshTokenExpiresAt: parseSquareDate(response.refreshTokenExpiresAt, 'refresh_token_expires_at'),
      }),
    };
  }
}

/**
 * Create an OAuth client for the application-credential endpoints.
 *
 * @example
 * ```typescript
 * const oauth = createSquareOAuthClient({
 *   clientId: process.env.SQUARE_APP_ID!,
 *   clientSecret: process.env.SQUARE_APP_SECRET!,
 *   environment: 'production',
 * });
 * ```
 */
export function createSquareOAuthClient(config: SquareOAuthClientConfig): SquareOAuthClient {
  return new SquareOAuthClient(config);
}

/**
 * Parse a Square timestamp, throwing rather than returning an `Invalid Date`
 * that would silently break expiry comparisons.
 *
 * @internal
 */
export function parseSquareDate(value: string, field: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new SquareError(`Square returned an invalid ${field}`);
  }
  return date;
}

function requireNonEmpty(value: string | undefined, field: string): void {
  if (!value) {
    throw new SquareValidationError(`${field} is required`, field);
  }
}
