export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

export interface TokenStore {
  getTokens(): Promise<StoredTokens | null>;
  setTokens(tokens: StoredTokens): Promise<void>;
  clearTokens(): Promise<void>;
}
