/**
 * Lightweight input sanitization without external deps.
 * Strips HTML tags and dangerous characters from strings.
 */

const HTML_TAG_REGEX = /<[^>]*>/g;
const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_REGEX = /\bon\w+\s*=/gi;
const JAVASCRIPT_URI_REGEX = /javascript:/gi;

export function stripHtml(input: string): string {
  return input
    .replace(SCRIPT_REGEX, "")
    .replace(HTML_TAG_REGEX, "")
    .replace(EVENT_HANDLER_REGEX, "")
    .replace(JAVASCRIPT_URI_REGEX, "")
    .trim();
}

export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return stripHtml(input).slice(0, 10000);
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === "string") {
      (result as Record<string, unknown>)[key] = sanitizeString(result[key]);
    }
  }
  return result;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function clampLength(input: string, max: number): string {
  return input.length > max ? input.slice(0, max) : input;
}

export function isAllowedFileType(
  mimeType: string,
  allowed: string[] = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
): boolean {
  return allowed.includes(mimeType);
}

export function isAllowedFileSize(sizeBytes: number, maxBytes: number = 5 * 1024 * 1024): boolean {
  return sizeBytes > 0 && sizeBytes <= maxBytes;
}
