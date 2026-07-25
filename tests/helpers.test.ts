import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
  generateOrderNumber,
  generateReferralCode,
  generateGiftCardCode,
  generateBookingReference,
  slugify,
  truncate,
  calculateAge,
  getInitials,
  getStarRating,
  getWhatsAppLink,
} from "@/utils/helpers";

describe("formatCurrency", () => {
  it("formats NGN currency by default", () => {
    expect(formatCurrency(5000)).toContain("5,000");
  });

  it("formats with explicit currency", () => {
    const result = formatCurrency(1500, "USD");
    expect(result).toBeTruthy();
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toContain("0");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const result = formatDate(new Date("2025-06-15"));
    expect(result).toContain("June");
    expect(result).toContain("2025");
    expect(result).toContain("15");
  });

  it("formats a date string", () => {
    const result = formatDate("2025-01-01");
    expect(result).toContain("2025");
  });
});

describe("formatDuration", () => {
  it("formats minutes under 60", () => {
    expect(formatDuration(30)).toBe("30 min");
  });

  it("formats exact hours", () => {
    expect(formatDuration(120)).toBe("2h");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30min");
  });

  it("formats 1 hour", () => {
    expect(formatDuration(60)).toBe("1h");
  });
});

describe("generateOrderNumber", () => {
  it("starts with MB-", () => {
    expect(generateOrderNumber()).toMatch(/^MB-/);
  });

  it("generates unique values", () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    expect(a).not.toBe(b);
  });
});

describe("generateBookingReference", () => {
  it("starts with BK-", () => {
    expect(generateBookingReference()).toMatch(/^BK-/);
  });
});

describe("generateReferralCode", () => {
  it("uses first 4 chars of name uppercase", () => {
    const code = generateReferralCode("Adaobi");
    expect(code).toMatch(/^ADAO/);
  });

  it("strips spaces and uppercases", () => {
    const code = generateReferralCode("Chi Chi");
    expect(code).toMatch(/^CHIC/);
  });
});

describe("generateGiftCardCode", () => {
  it("starts with MB- and has dashes", () => {
    const code = generateGiftCardCode();
    expect(code).toMatch(/^MB-/);
    expect(code.split("-").length).toBe(5); // MB + 4 groups
  });

  it("generates unique codes", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateGiftCardCode()));
    expect(codes.size).toBe(50);
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! @World#")).toBe("hello-world");
  });

  it("collapses underscores and hyphens", () => {
    expect(slugify("a___b---c")).toBe("a-b-c");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });
});

describe("truncate", () => {
  it("returns original if within length", () => {
    expect(truncate("hi", 10)).toBe("hi");
  });

  it("truncates with ellipsis", () => {
    expect(truncate("hello world this is long", 10)).toBe("hello worl...");
  });

  it("handles exact length", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("calculateAge", () => {
  it("calculates age from a past date", () => {
    const age = calculateAge("1990-01-01");
    expect(age).toBeGreaterThanOrEqual(35);
    expect(age).toBeLessThanOrEqual(37);
  });

  it("calculates age from a Date object", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 25);
    expect(calculateAge(dob)).toBe(25);
  });
});

describe("getInitials", () => {
  it("returns first 2 initials", () => {
    expect(getInitials("Adaobi Nwosu")).toBe("AN");
  });

  it("caps at 2 characters", () => {
    expect(getInitials("Chinedu Obi Eze")).toBe("CO");
  });

  it("handles single name", () => {
    expect(getInitials("Ada")).toBe("A");
  });
});

describe("getStarRating", () => {
  it("returns correct breakdown for 4.5", () => {
    const r = getStarRating(4.5);
    expect(r.full).toBe(4);
    expect(r.half).toBe(1);
    expect(r.empty).toBe(0);
  });

  it("returns correct breakdown for 3.0", () => {
    const r = getStarRating(3.0);
    expect(r.full).toBe(3);
    expect(r.half).toBe(0);
    expect(r.empty).toBe(2);
  });

  it("returns correct breakdown for 0", () => {
    const r = getStarRating(0);
    expect(r.full).toBe(0);
    expect(r.half).toBe(0);
    expect(r.empty).toBe(5);
  });

  it("returns correct breakdown for 5", () => {
    const r = getStarRating(5);
    expect(r.full).toBe(5);
    expect(r.half).toBe(0);
    expect(r.empty).toBe(0);
  });
});

describe("getWhatsAppLink", () => {
  it("strips non-numeric characters from phone", () => {
    const link = getWhatsAppLink("+234 801 234 5678");
    expect(link).toContain("https://wa.me/2348012345678");
  });

  it("encodes message", () => {
    const link = getWhatsAppLink("2348012345678", "Hello World");
    expect(link).toContain("text=");
  });
});
