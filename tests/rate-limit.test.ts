import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

function createMockRequest(ip?: string) {
  const headers = new Headers();
  if (ip) headers.set("x-forwarded-for", ip);
  return new Request("http://localhost:3000/api/test", { headers }) as never;
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within the limit", async () => {
    const limiter = rateLimit({ windowMs: 60000, max: 5, keyPrefix: "test-allow" });
    const request = createMockRequest("1.2.3.4");

    const result = await limiter(request);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests over the limit", async () => {
    const limiter = rateLimit({ windowMs: 60000, max: 3, keyPrefix: "test-block" });
    const request = createMockRequest("5.6.7.8");

    await limiter(request);
    await limiter(request);
    await limiter(request);
    const result = await limiter(request);

    expect(result.success).toBe(false);
    expect(result.response).toBeDefined();
    expect(result.remaining).toBe(0);
  });

  it("returns 429 status code when blocked", async () => {
    const limiter = rateLimit({ windowMs: 60000, max: 1, keyPrefix: "test-429" });
    const request = createMockRequest("9.10.11.12");

    await limiter(request);
    const result = await limiter(request);

    expect(result.response?.status).toBe(429);
  });

  it("includes custom error message", async () => {
    const limiter = rateLimit({
      windowMs: 60000,
      max: 1,
      keyPrefix: "test-msg",
      message: "Slow down!",
    });
    const request = createMockRequest("13.14.15.16");

    await limiter(request);
    const result = await limiter(request);

    const body = await result.response?.json();
    expect(body?.error).toBe("Slow down!");
  });

  it("resets after window expires", async () => {
    vi.useFakeTimers();
    const limiter = rateLimit({ windowMs: 1000, max: 2, keyPrefix: "test-reset" });
    const request = createMockRequest("17.18.19.20");

    await limiter(request);
    await limiter(request);
    const blocked = await limiter(request);
    expect(blocked.success).toBe(false);

    vi.advanceTimersByTime(1001);
    const after = await limiter(request);
    expect(after.success).toBe(true);
    vi.useRealTimers();
  });

  it("tracks different IPs separately", async () => {
    const limiter = rateLimit({ windowMs: 60000, max: 1, keyPrefix: "test-separate" });
    const req1 = createMockRequest("1.1.1.1");
    const req2 = createMockRequest("2.2.2.2");

    await limiter(req1);
    const result1 = await limiter(req1);
    expect(result1.success).toBe(false);

    const result2 = await limiter(req2);
    expect(result2.success).toBe(true);
  });

  it("uses default IP for requests without forwarding headers", async () => {
    const limiter = rateLimit({ windowMs: 60000, max: 1, keyPrefix: "test-default-ip" });
    const request = createMockRequest();

    await limiter(request);
    const result = await limiter(request);
    expect(result.success).toBe(false);
  });
});

describe("rateLimitResponse", () => {
  it("returns correct headers", () => {
    const headers = rateLimitResponse(5, Date.now() + 60000, 10);
    expect(headers["X-RateLimit-Limit"]).toBe("10");
    expect(headers["X-RateLimit-Remaining"]).toBe("5");
    expect(headers["X-RateLimit-Reset"]).toBeDefined();
  });
});
