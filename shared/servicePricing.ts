/**
 * Single source of truth for service pricing and the token / advance / balance split.
 *
 * Imported by BOTH the browser (src/pages/ServiceDetail.tsx, BookingDialog)
 * and the Vercel functions (api/cashfree/*-booking-*.ts), so the amount the
 * visitor sees is always the amount the server charges — and the server never
 * trusts the amount it receives from the browser.
 */

export const SERVICE_SLUGS = [
  "website-development",
  "video-editing",
  "digital-marketing",
  "graphic-designing",
  "ui-ux-design",
  "automation-ai-solutions",
  "e-commerce-solutions",
  "cinematography-video-production",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export interface ServicePrice {
  title: string;
  /** Starting price in whole rupees. */
  startingPrice: number;
  /** "/month" for retainers, otherwise empty. */
  unit: string;
}

export const SERVICE_PRICES: Record<ServiceSlug, ServicePrice> = {
  "website-development": { title: "Website Development", startingPrice: 2999, unit: "" },
  "video-editing": { title: "Video Editing", startingPrice: 499, unit: "" },
  "digital-marketing": { title: "Digital Marketing", startingPrice: 1999, unit: "/month" },
  "graphic-designing": { title: "Graphic Designing", startingPrice: 499, unit: "" },
  "ui-ux-design": { title: "UI/UX Design", startingPrice: 1499, unit: "" },
  "automation-ai-solutions": { title: "Automation & AI Solutions", startingPrice: 4999, unit: "" },
  "e-commerce-solutions": { title: "E-Commerce Solutions", startingPrice: 4999, unit: "" },
  "cinematography-video-production": { title: "Cinematography & Video Production", startingPrice: 2999, unit: "" },
};

export function isServiceSlug(value: unknown): value is ServiceSlug {
  return typeof value === "string" && (SERVICE_SLUGS as readonly string[]).includes(value);
}

/** Payment split: 5% booking token (paid on "Book Now") + 25% at project start + 70% on completion. */
export const DEFAULT_TOKEN_PERCENT = 5;
export const DEFAULT_START_PERCENT = 25;

/** Sanity ceiling, same as the existing payment endpoints. */
export const MAX_PROJECT_TOTAL_INR = 500000;

function pct(value: unknown, fallback: number): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) && n >= 1 && n <= 90 ? Math.round(n) : fallback;
}

export interface SplitPercents {
  tokenPercent: number;
  startPercent: number;
}

/** Reads the (optional) overrides; falls back to 5% / 25%. Token + start can never exceed 90%. */
export function normalizeSplit(token?: unknown, start?: unknown): SplitPercents {
  const tokenPercent = pct(token, DEFAULT_TOKEN_PERCENT);
  const startPercent = pct(start, DEFAULT_START_PERCENT);
  return tokenPercent + startPercent > 90
    ? { tokenPercent: DEFAULT_TOKEN_PERCENT, startPercent: DEFAULT_START_PERCENT }
    : { tokenPercent, startPercent };
}

export interface Quote {
  total: number;
  tokenPercent: number;
  startPercent: number;
  remainingPercent: number;
  /** Paid online when the client books. */
  token: number;
  /** Additional advance, due when the project starts. */
  startAdvance: number;
  /** Balance, due after completion. */
  remaining: number;
}

/** e.g. total 20,000 → token 1,000 (5%) + start 5,000 (25%) + remaining 14,000 (70%). Whole rupees only. */
export function computeQuote(total: number, split: SplitPercents = normalizeSplit()): Quote {
  const token = Math.max(1, Math.round((total * split.tokenPercent) / 100));
  const startAdvance = Math.round((total * split.startPercent) / 100);
  return {
    total,
    tokenPercent: split.tokenPercent,
    startPercent: split.startPercent,
    remainingPercent: 100 - split.tokenPercent - split.startPercent,
    token,
    startAdvance,
    remaining: total - token - startAdvance,
  };
}

/** Returns an error message, or null when `total` is an acceptable project total for this service. */
export function validateTotal(slug: ServiceSlug, total: unknown): string | null {
  const min = SERVICE_PRICES[slug].startingPrice;
  if (typeof total !== "number" || !Number.isFinite(total) || !Number.isInteger(total)) {
    return "Enter a valid project total.";
  }
  if (total < min) return `The total can't be lower than the starting price of ₹${min.toLocaleString("en-IN")}.`;
  if (total > MAX_PROJECT_TOTAL_INR) return "For projects above ₹5,00,000 please use the contact form.";
  return null;
}

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
