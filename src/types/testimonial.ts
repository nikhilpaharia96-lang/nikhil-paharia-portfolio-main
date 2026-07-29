import type { LucideIcon } from "lucide-react";

/** A single client testimonial entry. */
export type Testimonial = {
  id: number;
  name: string;
  role: string;
  company: string;
  companyShort: string;
  companyColor: string;
  avatarFrom: string;
  avatarTo: string;
  initials: string;
  avatarImg: string;
  companyLogo: string;
  flag: string;
  country: string;
  projectType: string;
  result: string;
  content: string;
};

/** A single entry in the trust / stats bar. */
export type TrustStat = {
  icon: LucideIcon;
  /** Numeric value to count up to. Ignored when `staticText` is set. */
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  /** Decimal places to keep during the count animation (e.g. 4.9 rating). */
  decimals?: number;
  /** Use for non-numeric stats (e.g. "Global") — skips the count animation. */
  staticText?: string;
};

/** Visual weight of a carousel slide relative to the selected one. */
export type CardVariant = "featured" | "active" | "side";
