import type { LucideIcon } from "lucide-react";

export type FeaturedVideo = {
  title: string;
  category: string;
  duration: string;
  image: string;
  /** Optional YouTube or Instagram link — paste a normal share URL here. */
  videoUrl?: string;
};

export type Project = {
  id: number;
  title: string;
  category: string;
  duration: string;
  image: string;
  /** Optional YouTube or Instagram link — paste a normal share URL here. */
  videoUrl?: string;
};

export type ShowcaseFeature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export type CardVariant = "active" | "side";
