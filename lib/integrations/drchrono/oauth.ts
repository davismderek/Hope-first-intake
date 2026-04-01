import { getTokenStore, type StoredTokens } from "./token-store";

const TOKEN_ENDPOINT = "https://drchrono.com/o/token/";
const AUTHORIZE_ENDPOINT = "https://drchrono.com/o/authorize/";
const DEFAULT_SCOPES = "patients:read patients:write calendar:read calendar:write clinical:read clinical:write";
const REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh when < 5 minutes remain

function getOAuthConfig() {
  const clientId = process.env.DRCHRONO_CLIENT_ID;
  const clientSecret = process.env.DRCHRONO_CLIENT_SECRET;
  const redirectUri = process.env.DRCHRONO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing DrChrono OAuth config. Set DRCHRONO_CLIENT_ID, DRCHRONO_CLIENT_SECRET, and DRCHRONO_REDIRECT_URI."
    );
  }

  return { clientId, clientSecret, redirectUri };
}

export function buildAuthorizeUrl(): string {
  const { clientId, redirectUri } = getOAuthConfig();
  const scopes = process.env.DRCHRONO_SCOPES ?? DEFAULT_SCOPES;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
  });

  return `${AUTHORIZE_ENDPOINT}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<StoredTokens> {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DrChrono token exchange failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const tokens = toStoredTokens(data);

  const store = getTokenStore();
  await store.setTokens(tokens);

  return tokens;
}

export async function refreshAccessToken(currentRefreshToken: string): Promise<StoredTokens> {
  const { clientId, clientSecret } = getOAuthConfig();

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: currentRefreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DrChrono token refresh failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const tokens = toStoredTokens(data);

  const store = getTokenStore();
  await store.setTokens(tokens);

  return tokens;
}

/**
 * Returns a valid access token, refreshing automatically if needed.
 * Pass forceRefresh=true to bypass the expiry check (e.g. after a 401).
 * Throws if no tokens exist (user must complete OAuth flow first).
 */
export async function getValidAccessToken(forceRefresh = false): Promise<string> {
  const store = getTokenStore();
  const tokens = await store.getTokens();

  if (!tokens) {
    throw new Error(
      "DrChrono is not connected. Visit /admin/drchrono to complete the OAuth flow."
    );
  }

  const now = Date.now();
  if (!forceRefresh && tokens.expiresAt - now > REFRESH_BUFFER_MS) {
    return tokens.accessToken;
  }

  const refreshed = await refreshAccessToken(tokens.refreshToken);
  return refreshed.accessToken;
}

function toStoredTokens(data: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}): StoredTokens {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}
