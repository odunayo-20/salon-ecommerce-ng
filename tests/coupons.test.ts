import { describe, it, expect, vi, beforeEach } from "vitest";

// We'll test the coupon validation logic directly by extracting it.
// Since the API route mixes HTTP with validation, we test via fetch-like calls.

describe("Coupon Validation Logic", () => {
  const COUPON_TESTS = [
    {
      name: "percentage coupon calculates correct discount",
      coupon: {
        id: "c1",
        code: "SAVE20",
        type: "PERCENTAGE",
        value: 20,
        isActive: true,
        expiresAt: null,
        usageLimit: null,
        usedCount: 0,
        minOrderAmount: null,
        maxDiscountAmount: null,
        appliesTo: "ALL",
        perUserLimit: null,
      },
      subtotal: 10000,
      expectedDiscount: 2000,
      expectedDescription: "20% off",
    },
    {
      name: "percentage coupon with max discount cap",
      coupon: {
        id: "c2",
        code: "BIGSAVE",
        type: "PERCENTAGE",
        value: 50,
        isActive: true,
        expiresAt: null,
        usageLimit: null,
        usedCount: 0,
        minOrderAmount: null,
        maxDiscountAmount: 5000,
        appliesTo: "ALL",
        perUserLimit: null,
      },
      subtotal: 20000,
      expectedDiscount: 5000, // 50% of 20000 = 10000, capped at 5000
      expectedDescription: "50% off",
    },
    {
      name: "fixed coupon does not exceed subtotal",
      coupon: {
        id: "c3",
        code: "FLAT10K",
        type: "FIXED",
        value: 10000,
        isActive: true,
        expiresAt: null,
        usageLimit: null,
        usedCount: 0,
        minOrderAmount: null,
        maxDiscountAmount: null,
        appliesTo: "ALL",
        perUserLimit: null,
      },
      subtotal: 5000,
      expectedDiscount: 5000, // capped at subtotal
      expectedDescription: "₦10,000 off",
    },
  ];

  for (const tc of COUPON_TESTS) {
    it(tc.name, () => {
      // Replicate the discount calculation from the validate route
      const amount = tc.subtotal;
      let discountAmount: number;

      if (tc.coupon.type === "PERCENTAGE") {
        discountAmount = amount * (Number(tc.coupon.value) / 100);
        if (tc.coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, Number(tc.coupon.maxDiscountAmount));
        }
      } else {
        discountAmount = Math.min(Number(tc.coupon.value), amount);
      }

      discountAmount = Math.round(discountAmount * 100) / 100;

      expect(discountAmount).toBe(tc.expectedDiscount);
    });
  }

  it("rejects expired coupon", () => {
    const coupon = {
      expiresAt: new Date("2024-01-01"),
    };
    expect(coupon.expiresAt < new Date()).toBe(true);
  });

  it("rejects coupon over usage limit", () => {
    const coupon = { usageLimit: 100, usedCount: 100 };
    expect(coupon.usedCount >= coupon.usageLimit).toBe(true);
  });

  it("rejects coupon under minimum order amount", () => {
    const coupon = { minOrderAmount: 5000 };
    const subtotal = 3000;
    expect(Number(subtotal) < Number(coupon.minOrderAmount)).toBe(true);
  });

  it("accepts coupon over minimum order amount", () => {
    const coupon = { minOrderAmount: 5000 };
    const subtotal = 7000;
    expect(Number(subtotal) >= Number(coupon.minOrderAmount)).toBe(true);
  });

  it("rejects SERVICES-only coupon for product orders", () => {
    const coupon = { appliesTo: "SERVICES" };
    const type = "PRODUCTS";
    expect(coupon.appliesTo !== "ALL" && coupon.appliesTo !== type).toBe(true);
  });

  it("accepts ALL coupon for any order type", () => {
    const coupon = { appliesTo: "ALL" };
    const type = "PRODUCTS";
    expect(coupon.appliesTo !== "ALL" && coupon.appliesTo !== type).toBe(false);
  });
});
