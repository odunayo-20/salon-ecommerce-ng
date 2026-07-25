import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  stripHtml,
  sanitizeString,
  sanitizeObject,
  isValidEmail,
  isValidUrl,
  clampLength,
  isAllowedFileType,
  isAllowedFileSize,
} from "@/lib/sanitize";

describe("stripHtml", () => {
  it("removes simple HTML tags", () => {
    expect(stripHtml("<p>Hello</p>")).toBe("Hello");
  });

  it("removes script tags with content", () => {
    expect(stripHtml('Hello <script>alert("xss")</script> world')).toBe("Hello  world");
  });

  it("removes event handlers", () => {
    expect(stripHtml('<div onclick="alert(1)">content</div>')).toBe("content");
  });

  it("removes javascript: URIs", () => {
    expect(stripHtml('click <a href="javascript:alert(1)">here</a>')).toBe("click here");
  });

  it("handles nested tags", () => {
    expect(stripHtml("<div><span><b>Bold</b></span></div>")).toBe("Bold");
  });

  it("handles empty string", () => {
    expect(stripHtml("")).toBe("");
  });

  it("preserves text without HTML", () => {
    expect(stripHtml("plain text")).toBe("plain text");
  });
});

describe("sanitizeString", () => {
  it("returns empty string for non-string input", () => {
    expect(sanitizeString(null)).toBe("");
    expect(sanitizeString(undefined)).toBe("");
    expect(sanitizeString(123)).toBe("");
  });

  it("sanitizes and truncates long strings", () => {
    const long = "a".repeat(15000);
    expect(sanitizeString(long).length).toBe(10000);
  });

  it("strips HTML from strings", () => {
    expect(sanitizeString("<img src=x onerror=alert(1)>")).toBe("");
  });
});

describe("sanitizeObject", () => {
  it("sanitizes all string values in an object", () => {
    const input = { name: "<b>John</b>", age: 30, desc: "Hello <script>xss</script>" };
    const result = sanitizeObject(input);
    expect(result.name).toBe("John");
    expect(result.age).toBe(30);
    expect(result.desc).toBe("Hello");
  });

  it("handles empty object", () => {
    expect(sanitizeObject({})).toEqual({});
  });
});

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name+tag@domain.co")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("user @domain.com")).toBe(false);
  });
});

describe("isValidUrl", () => {
  it("accepts http and https URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://localhost:3000")).toBe(true);
  });

  it("rejects non-http protocols", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("data:text/html,<h1>XSS</h1>")).toBe(false);
    expect(isValidUrl("ftp://files.example.com")).toBe(false);
  });

  it("rejects invalid URLs", () => {
    expect(isValidUrl("not a url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
  });
});

describe("clampLength", () => {
  it("returns original if within limit", () => {
    expect(clampLength("hello", 10)).toBe("hello");
  });

  it("truncates to max length", () => {
    expect(clampLength("hello world", 5)).toBe("hello");
  });

  it("returns exact length at boundary", () => {
    expect(clampLength("hello", 5)).toBe("hello");
  });
});

describe("isAllowedFileType", () => {
  it("accepts allowed types", () => {
    expect(isAllowedFileType("image/jpeg")).toBe(true);
    expect(isAllowedFileType("image/png")).toBe(true);
    expect(isAllowedFileType("image/webp")).toBe(true);
  });

  it("rejects disallowed types", () => {
    expect(isAllowedFileType("application/pdf")).toBe(false);
    expect(isAllowedFileType("text/html")).toBe(false);
    expect(isAllowedFileType("video/mp4")).toBe(false);
  });

  it("supports custom allowed list", () => {
    expect(isAllowedFileType("application/pdf", ["application/pdf"])).toBe(true);
  });
});

describe("isAllowedFileSize", () => {
  it("accepts files under 5MB", () => {
    expect(isAllowedFileSize(1024)).toBe(true);
    expect(isAllowedFileSize(5 * 1024 * 1024)).toBe(true);
  });

  it("rejects files over 5MB", () => {
    expect(isAllowedFileSize(6 * 1024 * 1024)).toBe(false);
  });

  it("rejects zero-byte files", () => {
    expect(isAllowedFileSize(0)).toBe(false);
  });

  it("supports custom max size", () => {
    expect(isAllowedFileSize(3 * 1024 * 1024, 2 * 1024 * 1024)).toBe(false);
  });
});
