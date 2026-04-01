import type { TokenStore } from "./types";
import { LocalFileTokenStore } from "./local-file-store";
import { ProductionTokenStore } from "./production-store";

export type { TokenStore, StoredTokens } from "./types";

let _store: TokenStore | null = null;

export function getTokenStore(): TokenStore {
  if (_store) return _store;

  const hasUpstash =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

  if (hasUpstash) {
    _store = new ProductionTokenStore();
  } else {
    _store = new LocalFileTokenStore();
  }

  return _store;
}
