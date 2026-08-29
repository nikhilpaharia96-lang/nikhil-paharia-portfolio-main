/**
 * Semester-wise contribution rules for Teacher's Day Celebration 2026.
 *
 * This is the single source of truth for minimum/default amounts per
 * semester. It is imported by:
 *   - src/pages/Support.tsx        (client-side UI: auto-fill, quick amounts, inline validation)
 *   - api/create-order.ts          (server-side enforcement — the browser's
 *                                   selected amount is never trusted as-is)
 *
 * Keeping the rules in one file means the UI and the server can never
 * silently drift apart.
 */

export const SEMESTERS = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
] as const;

export type Semester = (typeof SEMESTERS)[number];

// Semesters with an enforced minimum contribution. 6th/7th/8th are
// intentionally absent — they fall back to DEFAULT_MIN_AMOUNT /
// DEFAULT_QUICK_AMOUNTS below ("keep existing/default behavior").
const SEMESTER_MIN_AMOUNT: Partial<Record<Semester, number>> = {
  "1st Semester": 150,
  "2nd Semester": 150,
  "3rd Semester": 200,
  "4th Semester": 200,
  "5th Semester": 200,
};

const SEMESTER_QUICK_AMOUNTS: Partial<Record<Semester, number[]>> = {
  "1st Semester": [150, 200, 500, 1000],
  "2nd Semester": [150, 200, 500, 1000],
  "3rd Semester": [200, 300, 500, 1000],
  "4th Semester": [200, 300, 500, 1000],
  "5th Semester": [200, 300, 500, 1000],
};

// Pre-existing default behavior, unchanged, used for 6th/7th/8th semester
// and as a fallback before any semester is selected.
export const DEFAULT_MIN_AMOUNT = 1;
// The amount the field pre-fills with when no semester-specific minimum
// applies (6th/7th/8th semester, or no semester chosen yet) — matches the
// page's original default contribution amount.
export const DEFAULT_AMOUNT = 500;
export const DEFAULT_QUICK_AMOUNTS = [50, 100, 200, 500];

export function isValidSemester(value: unknown): value is Semester {
  return typeof value === "string" && (SEMESTERS as readonly string[]).includes(value);
}

/** Minimum allowed contribution (in whole rupees) for a given semester. */
export function getMinAmountForSemester(semester: Semester | ""): number {
  if (!semester) return DEFAULT_MIN_AMOUNT;
  return SEMESTER_MIN_AMOUNT[semester] ?? DEFAULT_MIN_AMOUNT;
}

/** The amount to auto-fill into the amount field when this semester is selected. */
export function getDefaultAmountForSemester(semester: Semester | ""): number {
  if (!semester) return DEFAULT_AMOUNT;
  return SEMESTER_MIN_AMOUNT[semester] ?? DEFAULT_AMOUNT;
}

/** Quick-select amount chips for a given semester, always >= that semester's minimum. */
export function getQuickAmountsForSemester(semester: Semester | ""): number[] {
  if (!semester) return DEFAULT_QUICK_AMOUNTS;
  return SEMESTER_QUICK_AMOUNTS[semester] ?? DEFAULT_QUICK_AMOUNTS;
}
