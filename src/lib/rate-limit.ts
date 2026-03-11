type RateLimitConfig = {
  maxAttempts: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

type SubmissionBucket = {
  state: "pending" | "completed";
  inquiryPublicId?: string;
  resetAt: number;
};

const globalForRateLimit = globalThis as unknown as {
  inquiryRateLimit?: Map<string, Bucket>;
  inquirySubmissionGuard?: Map<string, SubmissionBucket>;
};

const store = globalForRateLimit.inquiryRateLimit ?? new Map<string, Bucket>();
const submissionGuardStore =
  globalForRateLimit.inquirySubmissionGuard ?? new Map<string, SubmissionBucket>();

if (!globalForRateLimit.inquiryRateLimit) {
  globalForRateLimit.inquiryRateLimit = store;
}

if (!globalForRateLimit.inquirySubmissionGuard) {
  globalForRateLimit.inquirySubmissionGuard = submissionGuardStore;
}

function removeExpiredEntries<T extends { resetAt: number }>(
  targetStore: Map<string, T>,
  now: number,
) {
  for (const [key, value] of targetStore.entries()) {
    if (value.resetAt <= now) {
      targetStore.delete(key);
    }
  }
}

export function checkRateLimit(key: string, config: RateLimitConfig) {
  const now = Date.now();
  removeExpiredEntries(store, now);
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

export function beginSubmissionGuard(key: string, windowMs: number) {
  const now = Date.now();
  removeExpiredEntries(submissionGuardStore, now);
  const current = submissionGuardStore.get(key);

  if (current && current.resetAt > now) {
    return {
      allowed: false,
      isPending: current.state === "pending",
      inquiryPublicId: current.inquiryPublicId,
      resetAt: current.resetAt,
    };
  }

  submissionGuardStore.set(key, {
    state: "pending",
    resetAt: now + windowMs,
  });

  return {
    allowed: true,
    isPending: true,
    inquiryPublicId: undefined,
    resetAt: now + windowMs,
  };
}

export function completeSubmissionGuard(key: string, inquiryPublicId: string) {
  const current = submissionGuardStore.get(key);

  if (!current) {
    return;
  }

  submissionGuardStore.set(key, {
    ...current,
    state: "completed",
    inquiryPublicId,
  });
}

export function clearSubmissionGuard(key: string) {
  submissionGuardStore.delete(key);
}
