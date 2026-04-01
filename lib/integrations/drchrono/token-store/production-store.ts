import { Redis } from "@upstash/redis";
import type { TokenStore, StoredTokens } from "./types";

const REDIS_KEY = "drchrono:tokens";

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis credentials. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your environment variables."
    );
  }

  return new Redis({ url, token });
}

export class ProductionTokenStore implements TokenStore {
  async getTokens(): Promise<StoredTokens | null> {
    const redis = getRedis();
    return redis.get<StoredTokens>(REDIS_KEY);
  }

  async setTokens(tokens: StoredTokens): Promise<void> {
    const redis = getRedis();
    await redis.set(REDIS_KEY, tokens);
  }

  async clearTokens(): Promise<void> {
    const redis = getRedis();
    await redis.del(REDIS_KEY);
  }
}
