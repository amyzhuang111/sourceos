import { describe, expect, it } from "vitest";
import { canonicalizeDomain, canonicalizeUrl } from "@/lib/identity/canonicalize";

describe("canonicalizeDomain", () => {
  it("strips protocol and www", () => {
    expect(canonicalizeDomain("https://www.acme.com")).toBe("acme.com");
    expect(canonicalizeDomain("http://acme.com")).toBe("acme.com");
  });

  it("lowercases the host", () => {
    expect(canonicalizeDomain("https://ACME.com")).toBe("acme.com");
  });

  it("accepts a bare domain with no protocol", () => {
    expect(canonicalizeDomain("acme.com")).toBe("acme.com");
  });

  it("ignores the path", () => {
    expect(canonicalizeDomain("https://acme.com/about")).toBe("acme.com");
  });

  it("treats different subdomains as different companies", () => {
    expect(canonicalizeDomain("https://blog.acme.com")).not.toBe("acme.com");
  });

  it("throws on empty input", () => {
    expect(() => canonicalizeDomain("")).toThrow();
  });

  it("throws on unparseable input", () => {
    expect(() => canonicalizeDomain("not a url at all!!")).toThrow();
  });
});

describe("canonicalizeUrl", () => {
  it("strips tracking params but keeps real query params", () => {
    const out = canonicalizeUrl("https://acme.com/pricing?utm_source=x&plan=pro");
    expect(out).toBe("https://acme.com/pricing?plan=pro");
  });

  it("strips a trailing slash", () => {
    expect(canonicalizeUrl("https://acme.com/about/")).toBe("https://acme.com/about");
  });

  it("lowercases the host but preserves path casing", () => {
    expect(canonicalizeUrl("https://ACME.com/Pricing")).toBe("https://acme.com/Pricing");
  });
});
