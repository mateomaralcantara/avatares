type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const globalCache = globalThis as typeof globalThis & {
  __avataresIdempotency?: Map<string, CacheEntry<unknown>>;
};

const cache = globalCache.__avataresIdempotency || new Map<string, CacheEntry<unknown>>();
globalCache.__avataresIdempotency = cache;

export function getIdempotentResult<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function saveIdempotentResult<T>(key: string, value: T) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + 60 * 60 * 1000
  });
}
