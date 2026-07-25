import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  message?: string;
}

export function rateLimit(config: RateLimitConfig) {
  const { windowMs, max, keyPrefix = "rl", message = "Too many requests. Please try again later." } = config;

  return async function checkRateLimit(
    request: NextRequest
  ): Promise<{ success: boolean; response?: NextResponse; remaining: number; resetAt: number }> {
    cleanup();

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { success: true, remaining: max - 1, resetAt: now + windowMs };
    }

    entry.count++;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return {
        success: false,
        remaining: 0,
        resetAt: entry.resetAt,
        response: NextResponse.json(
          { error: message },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfter),
              "X-RateLimit-Limit": String(max),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
            },
          }
        ),
      };
    }

    return {
      success: true,
      remaining: max - entry.count,
      resetAt: entry.resetAt,
    };
  };
}

export function rateLimitResponse(remaining: number, resetAt: number, max: number) {
  return {
    "X-RateLimit-Limit": String(max),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };
}

// Pre-configured rate limiters for common use cases
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyPrefix: "rl:auth",
  message: "Too many authentication attempts. Please try again in 15 minutes.",
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyPrefix: "rl:register",
  message: "Too many registration attempts. Please try again in 1 hour.",
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  keyPrefix: "rl:pwreset",
  message: "Too many password reset attempts. Please try again in 15 minutes.",
});

export const verifyCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyPrefix: "rl:verify",
  message: "Too many verification attempts. Please try again in 15 minutes.",
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  keyPrefix: "rl:upload",
  message: "Too many uploads. Please try again later.",
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyPrefix: "rl:payment",
  message: "Too many payment attempts. Please try again later.",
});

export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  keyPrefix: "rl:order",
  message: "Too many order requests. Please try again later.",
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  keyPrefix: "rl:general",
  message: "Too many requests. Please slow down.",
});
