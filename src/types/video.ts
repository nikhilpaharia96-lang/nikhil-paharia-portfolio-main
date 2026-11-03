import type { LucideIcon } from "lucide-react";

export type VideoFilter = "All" | "Travel Film" | "Documentary" | "Commercial" | "Social Media" | "Cinematic" | "Others";

export type FeaturedVideo = {
  title: string;
  subtitle: string;
  category: string;
  duration: string;
  image: string;
  /** Optional YouTube or Instagram link — paste a normal share URL here. */
  videoUrl?: string;
};

export type Project = {
  id: number;
  title: string;
  category: Exclude<VideoFilter, "All">;
  duration: string;
  image: string;
  description: string;
  location: string;
  /** Optional YouTube or Instagram link — paste a normal share URL here. */
  videoUrl?: string;
};

export type ShowcaseFeature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export type ShowcaseStat = {
  icon: LucideIcon;
  value: string;
  label: string;
};

export type CardVariant = "featured" | "active" | "side";
