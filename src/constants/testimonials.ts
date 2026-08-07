import { Users, Layers, Star, ThumbsUp, Globe2 } from "lucide-react";
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
  // Was a local imported asset (src/assets/images/testimonials/apunbazar-logo.png).
  // Replace with your own hosted URL, e.g. after uploading to your CDN/GitHub:
  companyLogo:
    "https://raw.githubusercontent.com/nikhilpaharia96-lang/nikhil-paharia-portfolio-main/main/src/assets/images/testimonials/apunbazar-logo.png",
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
      "https://prideofassam.shop/cdn/shop/files/FB_IMG_1773725885203_600x600_crop_center.jpg?v=1774086143",
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
    avatarImg: "https://www.shutterstock.com/image-photo/head-shot-portrait-beautiful-indian-260nw-2595362193.jpg",
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
    avatarImg: "https://www.shutterstock.com/image-photo/happy-handsome-young-indian-man-260nw-2315729087.jpg",
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
  // ─────────────────────────────────────────────────────────────
  // 👇 EXAMPLE: naya real testimonial add karne ka tarika (URL system).
  // Apna real client ka data daal ke ise uncomment kar do, ya isko
  // template ki tarah copy karke naya object bana lo.
  // ─────────────────────────────────────────────────────────────
  // {
  //   id: 6,
  //   name: "Real Client Name",
  //   role: "Their Role",
  //   company: "Their Company",
  //   companyShort: "TC",
  //   companyColor: "#2563eb",
  //   avatarFrom: "#2563eb",
  //   avatarTo: "#60a5fa",
  //   initials: "RC",
  //   avatarImg: "https://your-image-url.com/client-photo.jpg",
  //   companyLogo: "https://your-image-url.com/client-logo.png",
  //   flag: "🇮🇳",
  //   country: "India",
  //   projectType: "Type of project",
  //   result: "↑ 30% Something",
  //   content: "Client ka actual quote yaha likho.",
  // },
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
 * "Trusted by People & Brands" — its own dedicated logo list, separate from
 * the testimonials above. Pehle yeh list testimonials se auto-generate hoti
 * thi (1 testimonial = 1 logo), isliye naya brand add karne ke liye poora
 * testimonial likhna padta tha. Ab yeh apna alag URL-based system hai —
 * bas logo ka URL paste karo, testimonial likhne ki zarurat nahi.
 *
 * Naya logo add karne ka tarika:
 *   1. Neeche list mein ek naya object add karo (comma se separate).
 *   2. `logo` mein apni image ka direct URL daalo — ya to:
 *        a) kisi bhi image-hosting URL (imgur, cloudinary, apna CDN, etc.), ya
 *        b) GitHub mein image upload karke uska "raw" URL, jaise:
 *           https://raw.githubusercontent.com/<user>/<repo>/main/path/to/logo.png
 *   3. Agar logo URL load nahi hota (broken link), to automatically `shortName`
 *      ke initials wala badge dikh jaayega — koi crash nahi hoga.
 *   4. `color` us initials-badge ka background color hai (jab tak real logo load ho).
 */
export const trustedBrands: TrustedBrand[] = [
  {
    name: "ApunBazar",
    logo: "https://trulyassamtea.com/wp-content/uploads/2025/05/Truly-Assam-logo-d-bg.svg",
    shortName: "AB",
    color: "#1d6feb",
  },
  {
    name: "Jagiroad College",
    logo: "https://api.dicebear.com/9.x/initials/svg?seed=JagiroadCollege&backgroundType=gradientLinear&backgroundColor=7c3aed,a78bfa&fontFamily=Arial&fontWeight=700&radius=20",
    shortName: "JC",
    color: "#7c3aed",
  },
  {
    name: "FitBite",
    logo: "https://api.dicebear.com/9.x/initials/svg?seed=FitBite&backgroundType=gradientLinear&backgroundColor=059669,34d399&fontFamily=Arial&fontWeight=700&radius=20",
    shortName: "FB",
    color: "#059669",
  },
  {
    name: "Travel Assam",
    logo: "https://assamtourism.gov.in/images/logo.png",
    shortName: "TA",
    color: "#f59e0b",
  },
  {
    name: "Ventae",
    logo: "https://www.logoai.com/uploads/output/2026/03/29/19261b0f4f945737e4abb1dadab463e1.jpg",
    shortName: "NX",
    color: "#0ea5e9",
  },
  {
    name: "PixelCraft Studio",
    logo: "https://api.dicebear.com/9.x/initials/svg?seed=PixelCraftStudio&backgroundType=gradientLinear&backgroundColor=e1306c,f472b6&fontFamily=Arial&fontWeight=700&radius=20",
    shortName: "PC",
    color: "#e1306c",
  },
  // ─────────────────────────────────────────────────────────────
  // 👇 EXAMPLE: naya brand logo add karne ka tarika — bas uncomment
  // karke apna data daal do.
  // ─────────────────────────────────────────────────────────────
  // {
  //   name: "Naya Client Ka Naam",
  //   logo: "https://your-image-url.com/logo.png",
  //   shortName: "NC",
  //   color: "#2563eb",
  // },
];
