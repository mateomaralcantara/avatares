type RateEntry = {
  count: number;
  resetAt: number;
};

type RateStore = Map<string, RateEntry>;

const globalRateStore = globalThis as typeof globalThis & {
  __avataresRateStore?: RateStore;
};

const store = globalRateStore.__avataresRateStore || new Map<string, RateEntry>();
globalRateStore.__avataresRateStore = store;

export function checkRateLimit(identity: string) {
  const now = Date.now();
  const limit = Number(process.env.AI_RATE_LIMIT_PER_MINUTE || 60);
  const existing = store.get(identity);

  if (!existing || existing.resetAt <= now) {
    const entry = { count: 1, resetAt: now + 60_000 };
    store.set(identity, entry);
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt: entry.resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}
