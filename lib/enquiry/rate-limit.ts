import { createHash } from "node:crypto";
import type { EnquiryMode } from "./config";

/** Rule from the Day 4 brief: 3 enquiries per IP address per hour. */
export const RATE_LIMIT = { max: 3, windowMs: 60 * 60 * 1000 } as const;

export interface RateResult {
  ok: boolean;
  remaining: number;
}

export interface RateLimiter {
  consume(clientKey: string): Promise<RateResult>;
}

/** Hash the IP so the raw address never reaches the rate-limit store or logs. */
export function hashClient(ip: string): string {
  return createHash("sha256").update(`naalya-enquiry|${ip}`).digest("hex").slice(0, 32);
}

/** Resolve the client address. Relies on the host overwriting these headers at the edge. Verify on the host. */
export function clientIp(headers: Headers): string {
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

/** Test-only sliding window in memory. */
class MemoryLimiter implements RateLimiter {
  private hits = new Map<string, number[]>();

  async consume(clientKey: string): Promise<RateResult> {
    const now = Date.now();
    const recent = (this.hits.get(clientKey) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
    if (recent.length >= RATE_LIMIT.max) {
      this.hits.set(clientKey, recent);
      return { ok: false, remaining: 0 };
    }
    recent.push(now);
    this.hits.set(clientKey, recent);
    return { ok: true, remaining: RATE_LIMIT.max - recent.length };
  }
}

/** Production limiter backed by Upstash Redis (sliding window). */
class UpstashLimiter implements RateLimiter {
  private limiterPromise: Promise<{ limit: (key: string) => Promise<{ success: boolean; remaining: number }> }> | null = null;

  private getLimiter() {
    if (!this.limiterPromise) {
      this.limiterPromise = (async () => {
        const { Ratelimit } = await import("@upstash/ratelimit");
        const { Redis } = await import("@upstash/redis");
        return new Ratelimit({
          redis: new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL ?? "",
            token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
          }),
          limiter: Ratelimit.slidingWindow(RATE_LIMIT.max, "1 h"),
          prefix: "naalya:enquiry",
        });
      })();
    }
    return this.limiterPromise;
  }

  async consume(clientKey: string): Promise<RateResult> {
    const limiter = await this.getLimiter();
    const result = await limiter.limit(clientKey);
    return { ok: result.success, remaining: result.remaining };
  }
}

const globalForLimiter = globalThis as unknown as { __enquiryMemoryLimiter?: MemoryLimiter };

export function createRateLimiter(mode: EnquiryMode): RateLimiter {
  if (mode === "test-file") {
    globalForLimiter.__enquiryMemoryLimiter ??= new MemoryLimiter();
    return globalForLimiter.__enquiryMemoryLimiter;
  }
  return new UpstashLimiter();
}
