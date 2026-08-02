import { Users, Layers, Star, ThumbsUp, Globe2 } from "lucide-react";
import apunbazarLogo from "@/assets/images/testimonials/apunbazar-logo.png";
import type { Testimonial, TrustStat, TrustedBrand } from "@/types/testimonial";

/**
 * The hero/featured testimonial, shown large above the carousel.
 * NOTE: this is intentionally *not* repeated inside `testimonials` below —
 * the previous implementation duplicated it as the carousel's first slide,
 * which meant visitors saw the exact same quote twice in a row.
 */
export const featuredTestimonial: Testimonial = {
  id: 0,
  name: "Rohan Sharma",
  role: "Founder",
  company: "ApunBazar",
  companyShort: "AB",
  companyColor: "#1d6feb",
  avatarFrom: "#1d6feb",
  avatarTo: "#3b82f6",
  initials: "RS",
  avatarImg:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr7vL5Zw5rT5ojGVEJqaziZD5Jmi8l5K_BtahvYUh6Rw&s=10",
  companyLogo: apunbazarLogo,
  flag: "🇮🇳",
  country: "India",
  projectType: "E-Commerce Platform",
  result: "↑ 40% Conversion",
  content:
    "Nikhil is a highly skilled developer who delivers clean, modern and scalable solutions. He understood our vision instantly and shipped a platform that genuinely moved the needle on our business. Professional, dedicated and a pleasure to work with from day one.",
};

/** Carousel testimonials — the featured quote above is deliberately excluded. */
export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Anjan Kalita",
    role: "Student Leader",
    company: "Jagiroad College",
    companyShort: "JC",
    companyColor: "#7c3aed",
    avatarFrom: "#7c3aed",
    avatarTo: "#a78bfa",
    initials: "AK",
    avatarImg:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Anjan-Kalita-JagiroadCollege&backgroundColor=e0d4fd,f1e4fd",
    companyLogo:
      "https://api.dicebear.com/9.x/initials/svg?seed=JagiroadCollege&backgroundType=gradientLinear&backgroundColor=7c3aed,a78bfa&fontFamily=Arial&fontWeight=700&radius=20",
    flag: "🇮🇳",
    country: "India",
    projectType: "Community Web Platform",
    result: "3x More Engagement",
    content:
      "Working with Nikhil was a smooth experience from start to finish. He understood the requirements perfectly and built a fantastic platform for our entire college community.",
  },
  {
    id: 2,
    name: "Priya Deka",
    role: "Co-Founder",
    company: "FitBite",
    companyShort: "FB",
    companyColor: "#059669",
    avatarFrom: "#059669",
    avatarTo: "#34d399",
    initials: "PD",
    avatarImg: "https://api.dicebear.com/9.x/avataaars/svg?seed=Priya-Deka-FitBite&backgroundColor=c7f2dc,d4f7e5",
    companyLogo:
      "https://api.dicebear.com/9.x/initials/svg?seed=FitBite&backgroundType=gradientLinear&backgroundColor=059669,34d399&fontFamily=Arial&fontWeight=700&radius=20",
    flag: "🇮🇳",
    country: "India",
    projectType: "Mobile App Landing",
    result: "500K+ Views",
    content:
      "Nikhil is not just a developer but a genuine problem solver. He has a great eye for detail and consistently delivers results before the deadline.",
  },
  {
    id: 3,
    name: "Meera Bora",
    role: "Marketing Head",
    company: "Travel Assam",
    companyShort: "TA",
    companyColor: "#f59e0b",
    avatarFrom: "#f59e0b",
    avatarTo: "#fbbf24",
    initials: "MB",
    avatarImg: "https://api.dicebear.com/9.x/avataaars/svg?seed=Meera-Bora-TravelAssam&backgroundColor=fde7c4,ffe9c7",
    companyLogo:
      "https://api.dicebear.com/9.x/initials/svg?seed=TravelAssam&backgroundType=gradientLinear&backgroundColor=f59e0b,fbbf24&fontFamily=Arial&fontWeight=700&radius=20",
    flag: "🇮🇳",
    country: "India",
    projectType: "Travel Website",
    result: "2x More Leads",
    content:
      "The website Nikhil built captured the soul of Assam perfectly. Bookings picked up almost immediately after launch, and clients keep complimenting the design.",
  },
  {
    id: 4,
    name: "Kabir Singh",
    role: "Product Manager",
    company: "Nexlify",
    companyShort: "NX",
    companyColor: "#0ea5e9",
    avatarFrom: "#0ea5e9",
    avatarTo: "#38bdf8",
    initials: "KS",
    avatarImg: "https://api.dicebear.com/9.x/avataaars/svg?seed=Kabir-Singh-Nexlify&backgroundColor=c5eefc,d6f2fd",
    companyLogo:
      "https://api.dicebear.com/9.x/initials/svg?seed=Nexlify&backgroundType=gradientLinear&backgroundColor=0ea5e9,38bdf8&fontFamily=Arial&fontWeight=700&radius=20",
    flag: "🇦🇪",
    country: "UAE",
    projectType: "SaaS Dashboard",
    result: "↑ 55% Retention",
    content:
      "Even working across time zones, Nikhil was responsive, sharp and precise. The dashboard he shipped is faster and cleaner than what our last agency delivered.",
  },
  {
    id: 5,
    name: "Ishita Bhattacharya",
    role: "Creative Director",
    company: "PixelCraft Studio",
    companyShort: "PC",
    companyColor: "#e1306c",
    avatarFrom: "#e1306c",
    avatarTo: "#f472b6",
    initials: "IB",
    avatarImg:
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Ishita-Bhattacharya-PixelCraft&backgroundColor=fbd5e4,fde2ec",
    companyLogo:
      "https://api.dicebear.com/9.x/initials/svg?seed=PixelCraftStudio&backgroundType=gradientLinear&backgroundColor=e1306c,f472b6&fontFamily=Arial&fontWeight=700&radius=20",
    flag: "🇬🇧",
    country: "UK",
    projectType: "Brand Video Campaign",
    result: "1M+ Impressions",
    content:
      "Rare to find someone who edits with this much taste. Every cut, transition and grade felt intentional. The campaign outperformed everything we've run before.",
  },
];

/**
 * Flat list combining the featured quote with the rest — used to render every
 * testimonial as an equal-weight card in a single row/carousel (no
 * "one big card + smaller ones" split).
 */
export const allTestimonials: Testimonial[] = [featuredTestimonial, ...testimonials];

/** Trust bar stats — `value` is numeric so it can be counted up on scroll-into-view. */
export const trustStats: TrustStat[] = [
  { icon: Users, value: 30, suffix: "+", label: "Trusted by Clients" },
  { icon: Layers, value: 40, suffix: "+", label: "Projects Delivered" },
  { icon: Star, value: 5, decimals: 0, suffix: " Star", label: "Rated by Clients" },
  { icon: ThumbsUp, value: 98, suffix: "%", label: "Client Satisfaction" },
  { icon: Globe2, value: 0, staticText: "Global", label: "Remote Work" },
];

/**
 * "Trusted by People & Brands" — derived directly from the real clients
 * already in `allTestimonials` above, so this can never drift out of sync
 * with actual testimonial data or list a brand/company that isn't real.
 * Each entry reuses that client's existing logo (a real asset for ApunBazar,
 * a generated initials badge for the rest — same as their avatar system).
 */
export const trustedBrands: TrustedBrand[] = allTestimonials.map((t) => ({
  name: t.company,
  logo: t.companyLogo,
  shortName: t.companyShort,
  color: t.companyColor,
}));
