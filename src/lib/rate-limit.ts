type RateLimitConfig = {
  maxAttempts: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as unknown as {
  inquiryRateLimit?: Map<string, Bucket>;
};

const store = globalForRateLimit.inquiryRateLimit ?? new Map<string, Bucket>();

if (!globalForRateLimit.inquiryRateLimit) {
  globalForRateLimit.inquiryRateLimit = store;
}

export function checkRateLimit(key: string, config: RateLimitConfig) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (current.count >= config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    allowed: true,
    remaining: config.maxAttempts - current.count,
    resetAt: current.resetAt,
  };
}
