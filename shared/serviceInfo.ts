/**
 * Plain-data service facts (no icons/images) so BOTH the browser (pricing card) and the
 * Vercel functions (quotation email to the client) read the same text.
 */

export interface ServiceInfo {
  /** Typical turnaround per kind of project. */
  timeline: { label: string; value: string }[];
  /** Estimated delivery shown in the pricing card / quotation. */
  delivery: string;
  /** What the starting price includes. */
  included: string[];
}

export const SERVICE_INFO: Record<string, ServiceInfo> = {
  "website-development": {
    timeline: [
      { label: "Landing page", value: "3 – 5 days" },
      { label: "Business website (5–8 pages)", value: "7 – 12 days" },
      { label: "Custom web app", value: "3 – 6 weeks" },
    ],
    delivery: "3 – 12 days (depending on pages)",
    included: ["Responsive single-page website", "Contact form", "Basic SEO setup", "1 round of revisions", "Deployment support"],
  },
  "video-editing": {
    timeline: [
      { label: "Reel / Short", value: "1 – 2 days" },
      { label: "YouTube video (up to 10 min)", value: "3 – 5 days" },
      { label: "Ad / promo / corporate video", value: "4 – 7 days" },
    ],
    delivery: "1 – 5 days (depending on length)",
    included: ["Edit up to 60 seconds", "Colour correction", "Music & basic sound design", "Captions", "1 round of revisions"],
  },
  "digital-marketing": {
    timeline: [
      { label: "Setup & strategy", value: "3 – 5 days" },
      { label: "First campaign live", value: "Within 1 week" },
      { label: "Visible results", value: "30 – 60 days" },
    ],
    delivery: "Setup in ~1 week, then monthly",
    included: ["Monthly content plan", "Social media posting", "Basic ad setup", "Monthly report"],
  },
  "graphic-designing": {
    timeline: [
      { label: "Social post / banner", value: "1 – 2 days" },
      { label: "Logo design", value: "3 – 5 days" },
      { label: "Full branding kit", value: "7 – 10 days" },
    ],
    delivery: "1 – 7 days (depending on scope)",
    included: ["Up to 2 concepts", "Print & web-ready files", "1 round of revisions"],
  },
  "ui-ux-design": {
    timeline: [
      { label: "Wireframes", value: "2 – 3 days" },
      { label: "Website UI (5 screens)", value: "5 – 7 days" },
      { label: "Mobile app UI", value: "2 – 3 weeks" },
    ],
    delivery: "5 – 14 days (depending on screens)",
    included: ["Up to 5 screens", "Clickable prototype", "Basic design system", "1 round of revisions"],
  },
  "automation-ai-solutions": {
    timeline: [
      { label: "Simple automation", value: "2 – 4 days" },
      { label: "WhatsApp chatbot", value: "5 – 8 days" },
      { label: "CRM + multi-app workflow", value: "10 – 15 days" },
    ],
    delivery: "3 – 12 days (depending on complexity)",
    included: ["1 workflow or chatbot", "Up to 3 app integrations", "Testing & walkthrough", "Basic documentation"],
  },
  "e-commerce-solutions": {
    timeline: [
      { label: "Store setup (up to 20 products)", value: "5 – 8 days" },
      { label: "Custom design store", value: "10 – 15 days" },
      { label: "Large catalogue / custom features", value: "3 – 5 weeks" },
    ],
    delivery: "5 – 15 days (depending on catalogue)",
    included: ["Store set-up", "Up to 10 products", "Payment gateway integration", "Basic shipping set-up", "1 round of revisions"],
  },
  "cinematography-video-production": {
    timeline: [
      { label: "Pre-production", value: "2 – 3 days" },
      { label: "Shoot", value: "1 – 2 days" },
      { label: "Post-production", value: "4 – 7 days" },
    ],
    delivery: "7 – 12 days (shoot to final)",
    included: ["Half-day shoot", "1 short promo / reel", "Editing & colour grading", "1 round of revisions"],
  },
};
