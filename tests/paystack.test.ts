import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

describe("verifyWebhookSignature", () => {
  beforeEach(() => {
    process.env.PAYSTACK_WEBHOOK_SECRET = "whsec_test_secret";
  });

  it("returns true for a valid signature", async () => {
    const body = '{"event":"charge.success","data":{}}';
    const hmac = crypto.createHmac("sha512", "whsec_test_secret");
    hmac.update(body);
    const signature = hmac.digest("hex");

    const { verifyWebhookSignature } = await import("@/lib/paystack");
    expect(verifyWebhookSignature(body, signature)).toBe(true);
  });

  it("returns false for an invalid signature", async () => {
    const { verifyWebhookSignature } = await import("@/lib/paystack");
    expect(verifyWebhookSignature('{"event":"test"}', "invalidsignature")).toBe(false);
  });

  it("returns false for null signature", async () => {
    const { verifyWebhookSignature } = await import("@/lib/paystack");
    expect(verifyWebhookSignature('{"event":"test"}', null)).toBe(false);
  });

  it("returns false for empty string signature", async () => {
    const { verifyWebhookSignature } = await import("@/lib/paystack");
    expect(verifyWebhookSignature('{"event":"test"}', "")).toBe(false);
  });
});

describe("initializeTransaction", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends correct payload with kobo conversion", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ status: true, data: { authorization_url: "https://paystack.co/pay" } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { initializeTransaction } = await import("@/lib/paystack");
    const result = await initializeTransaction({
      amount: 5000,
      email: "test@example.com",
      reference: "ref-123",
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.amount).toBe(500000); // 5000 * 100 kobo
    expect(body.email).toBe("test@example.com");
    expect(body.reference).toBe("ref-123");
    expect(result.status).toBe(true);
  });
});

describe("verifyTransaction", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls correct endpoint with reference", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ status: true, data: { status: "success" } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { verifyTransaction } = await import("@/lib/paystack");
    const result = await verifyTransaction("ref-abc");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.paystack.co/transaction/verify/ref-abc",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer sk_test",
        }),
      })
    );
    expect(result.data.status).toBe("success");
  });
});
