import type { LucideIcon } from "lucide-react";

export type TestimonialCategory = "Creators" | "Businesses" | "Travel & Tourism" | "Education" | "Startups";

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
  category: TestimonialCategory;
  projectType: string;
  result: string;
  content: string;
  /** Optional client video message: a direct .mp4/.webm file (local import or URL) or a YouTube / Instagram link. */
  videoUrl?: string;
  /** Optional poster image shown behind the play button (defaults to the scenic background). */
  videoPoster?: string;
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

/** A single entry in the "Trusted by People & Brands" strip — a real client's logo. */
export type TrustedBrand = {
  name: string;
  /** Real logo image (or generated initials badge) — never a generic icon. */
  logo: string;
  shortName: string;
  color: string;
};

/** Visual weight of a carousel slide relative to the selected one. */
export type CardVariant = "featured" | "active" | "side";

/** Payload sent when a visitor submits the "Worked with me?" form. */
export interface TestimonialSubmission {
  name: string;
  company: string;
  role: string;
  rating: number;
  content: string;
  projectName?: string;
  website?: string;
  photoDataUrl?: string;
  submittedAt: string;
}
