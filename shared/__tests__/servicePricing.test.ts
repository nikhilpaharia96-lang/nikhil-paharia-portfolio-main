import { describe, expect, it } from "vitest";
import { computeQuote, normalizeSplit, validateTotal } from "../servicePricing";

describe("computeQuote", () => {
  it("splits ₹20,000 into 1,000 / 5,000 / 14,000 (5% / 25% / 70%)", () => {
    const q = computeQuote(20000);
    expect(q.token).toBe(1000);
    expect(q.startAdvance).toBe(5000);
    expect(q.remaining).toBe(14000);
    expect(q.token + q.startAdvance + q.remaining).toBe(q.total);
  });

  it("always sums to the total and keeps whole rupees", () => {
    for (const total of [499, 2999, 4999, 12345, 99999, 500000]) {
      const q = computeQuote(total);
      expect(q.token + q.startAdvance + q.remaining).toBe(total);
      expect(Number.isInteger(q.token)).toBe(true);
      expect(Number.isInteger(q.startAdvance)).toBe(true);
      expect(q.remaining).toBeGreaterThan(0);
    }
  });

  it("charges at least ₹1 as the token", () => {
    expect(computeQuote(10).token).toBeGreaterThanOrEqual(1);
  });
});

describe("normalizeSplit", () => {
  it("defaults to 5 / 25", () => {
    expect(normalizeSplit()).toEqual({ tokenPercent: 5, startPercent: 25 });
  });
  it("falls back to defaults when token + start exceed 90%", () => {
    expect(normalizeSplit("60", "40")).toEqual({ tokenPercent: 5, startPercent: 25 });
  });
  it("ignores invalid values", () => {
    expect(normalizeSplit("abc", "0")).toEqual({ tokenPercent: 5, startPercent: 25 });
  });
});

describe("validateTotal", () => {
  it("rejects totals below the service starting price", () => {
    expect(validateTotal("website-development", 2998)).toMatch(/starting price/);
  });
  it("accepts the starting price", () => {
    expect(validateTotal("website-development", 2999)).toBeNull();
  });
  it("rejects non-integers and non-numbers", () => {
    expect(validateTotal("video-editing", 499.5)).not.toBeNull();
    expect(validateTotal("video-editing", "500")).not.toBeNull();
    expect(validateTotal("video-editing", NaN)).not.toBeNull();
  });
  it("rejects totals above the ceiling", () => {
    expect(validateTotal("video-editing", 500001)).not.toBeNull();
  });
});
