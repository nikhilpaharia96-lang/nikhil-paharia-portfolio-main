import type { ComponentType, CSSProperties } from "react";
import {
  SiReact, SiNodedotjs, SiTypescript, SiTailwindcss, SiVite, SiNetlify, SiVercel, SiGithub,
  SiGoogleads, SiGoogleanalytics, SiGooglesearchconsole, SiMeta, SiInstagram, SiFacebook, SiYoutube, SiSemrush, SiMailchimp,
  SiFigma, SiMiro, SiFramer, SiSketch,
  SiN8N, SiZapier, SiMake, SiWhatsapp, SiPostman, SiGooglesheets, SiAirtable, SiGooglegemini, SiHubspot,
  SiShopify, SiWordpress, SiWoocommerce, SiStripe, SiRazorpay,
  SiDavinciresolve, SiBlender, SiObsstudio, SiSony, SiDji, SiAudacity, SiGoogledrive,
} from "react-icons/si";
import { RiCameraLensLine, RiRobot2Line, RiPaletteLine, RiLightbulbFlashLine } from "react-icons/ri";
import premiereProLogo from "../assets/logos/premiere-pro.svg";
import afterEffectsLogo from "../assets/logos/after-effects.svg";
import { SERVICE_PRICES, type ServiceSlug } from "../../shared/servicePricing";
import { SERVICE_INFO } from "../../shared/serviceInfo";

export type Tool = {
  label: string;
  color: string;
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>;
  logo?: string;
  text?: string;
};

export type ProcessStep = { title: string; desc: string };

export interface ServiceDetail {
  slug: ServiceSlug;
  /** Short SEO description. */
  seoDescription: string;
  intro: {
    what: string;
    why: string;
    problems: string[];
    who: string[];
  };
  provide: string[];
  process: ProcessStep[];
  tools: Tool[];
  timeline: { label: string; value: string }[];
  /** Estimated delivery shown in the pricing card. */
  delivery: string;
  /** What the starting price includes. */
  included: string[];
  /** Suggested total shown as the calculator's default. */
  suggestedTotal: number;
  /** Quick-pick totals for the quote calculator (each >= starting price). */
  quickTotals: number[];
}

/** The same seven steps for every service; descriptions (and step 4's name) are adapted per service. */
function steps(four: string, d: [string, string, string, string, string, string, string]): ProcessStep[] {
  const titles = [
    "Client Requirement Discussion",
    "Project Planning",
    "Research & Strategy",
    four,
    "Client Review",
    "Revisions",
    "Final Delivery",
  ];
  return titles.map((title, i) => ({ title, desc: d[i] }));
}

export const WHY_CHOOSE_ME = [
  { title: "Professional Quality", desc: "Clean, polished work that holds up next to established agencies." },
  { title: "Modern Solutions", desc: "Current tools, trends and best practices — not outdated templates." },
  { title: "Transparent Pricing", desc: "A clear quote up front. No hidden charges, no surprise add-ons." },
  { title: "On-Time Delivery", desc: "Realistic timelines that I plan around and stick to." },
  { title: "Client Support", desc: "Quick replies and help even after the project is delivered." },
  { title: "Secure Payments", desc: "Pay your advance through a trusted payment gateway — the rest only after the work is done." },
] as const;

export const serviceDetails: Record<ServiceSlug, ServiceDetail> = {
  "website-development": {
    slug: "website-development",
    ...SERVICE_INFO["website-development"],
    seoDescription: "Fast, modern, responsive websites for businesses and brands — landing pages, business sites and custom web apps by Nikhil Paharia.",
    intro: {
      what: "I design and build fast, responsive, modern websites — from a single landing page to a complete business website or custom web application — that look great on every screen.",
      why: "Your website is your 24/7 shop front. A slow or outdated site loses customers before they ever call you; a good one builds trust, ranks on Google and turns visitors into enquiries.",
      problems: ["No online presence or an outdated website", "Slow pages and poor mobile experience", "Visitors leave without contacting you", "Hard to find on Google"],
      who: ["Small & local businesses", "Startups and founders", "Freelancers & personal brands", "Agencies needing a developer"],
    },
    provide: [
      "Custom responsive design (mobile, tablet, desktop)",
      "Landing pages, business websites and web apps",
      "Contact forms, WhatsApp & social integration",
      "Speed optimisation and basic on-page SEO",
      "Admin-friendly content structure",
      "Hosting & domain setup guidance",
      "Post-launch bug-fix support",
    ],
    process: steps("Design & Development", [
      "We talk about your business, goals, audience, pages and features you need.",
      "I prepare the sitemap, feature list, timeline and a clear quotation.",
      "Competitor and audience research, content outline and a visual direction.",
      "I design the layout and build the site with clean, modern code.",
      "You get a live preview link to check every page on any device.",
      "Feedback is applied in revision rounds until you are happy.",
      "Final testing, deployment on your domain and a handover of files and logins.",
    ]),
    tools: [
      { label: "React", icon: SiReact, color: "#61DAFB" },
      { label: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { label: "Node.js", icon: SiNodedotjs, color: "#339933" },
      { label: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4" },
      { label: "Vite", icon: SiVite, color: "#646CFF" },
      { label: "Figma", icon: SiFigma, color: "#F24E1E" },
      { label: "GitHub", icon: SiGithub, color: "#181717" },
      { label: "Vercel", icon: SiVercel, color: "#000000" },
      { label: "Netlify", icon: SiNetlify, color: "#00C7B7" },
    ],
    suggestedTotal: 9999,
    quickTotals: [2999, 9999, 19999, 39999],
  },

  "video-editing": {
    slug: "video-editing",
    ...SERVICE_INFO["video-editing"],
    seoDescription: "Professional video editing for YouTube, Instagram Reels, ads and corporate videos — cuts, colour, sound and motion graphics.",
    intro: {
      what: "Professional editing that turns raw footage into engaging videos — YouTube videos, Instagram Reels, ads, promos and corporate films — with sharp cuts, colour, sound and motion graphics.",
      why: "Attention lasts seconds. A well-edited video keeps viewers watching, makes your brand look professional and makes your message land.",
      problems: ["Raw footage that never gets published", "Videos that look amateur or drag on", "No time to edit consistently", "Weak hooks, audio and pacing"],
      who: ["YouTubers & creators", "Brands running video ads", "Coaches and educators", "Businesses and event teams"],
    },
    provide: [
      "Cutting, pacing and story flow",
      "Colour correction and grading",
      "Sound clean-up, music and effects",
      "Captions, titles and motion graphics",
      "Reels / Shorts / YouTube / widescreen formats",
      "Thumbnails on request",
      "Export in the right resolution for each platform",
    ],
    process: steps("Editing & Execution", [
      "You share your goal, platform, style references and the raw footage.",
      "I plan the structure, length, formats and delivery dates.",
      "I review the footage, pick the best moments and shape the story and hook.",
      "Rough cut, then colour, sound, captions and motion graphics.",
      "You receive a draft link and watch it at your convenience.",
      "Notes are applied precisely, round by round.",
      "Final files exported in every format you need.",
    ]),
    tools: [
      { label: "Premiere Pro", logo: premiereProLogo, color: "#9999FF" },
      { label: "After Effects", logo: afterEffectsLogo, color: "#9999FF" },
      { label: "DaVinci Resolve", icon: SiDavinciresolve, color: "#233A51" },
      { label: "Audacity", icon: SiAudacity, color: "#0000CC" },
      { label: "Google Drive", icon: SiGoogledrive, color: "#4285F4" },
      { label: "YouTube", icon: SiYoutube, color: "#FF0000" },
    ],
    suggestedTotal: 1499,
    quickTotals: [499, 1499, 4999, 9999],
  },

  "digital-marketing": {
    slug: "digital-marketing",
    ...SERVICE_INFO["digital-marketing"],
    seoDescription: "Social media marketing, Google Ads, SEO and lead generation to grow your brand — monthly digital marketing by Nikhil Paharia.",
    intro: {
      what: "Monthly digital marketing that grows your brand: social media management, Google & Meta ads, SEO and lead-generation funnels, all tracked with real numbers.",
      why: "Having a product or service isn't enough — people must find you. Marketing puts your business in front of the right audience and brings in steady leads.",
      problems: ["Low reach and followers who don't convert", "Ad budget spent without results", "Not visible on Google", "No system for generating leads"],
      who: ["Local businesses", "Online sellers and D2C brands", "Coaches, clinics and institutes", "Startups launching a product"],
    },
    provide: [
      "Social media content planning and posting",
      "Google Ads and Meta (Facebook/Instagram) ad campaigns",
      "On-page SEO and Google Business setup",
      "Lead-generation landing pages and funnels",
      "Audience research and competitor analysis",
      "Monthly performance report with next steps",
    ],
    process: steps("Execution & Campaign Setup", [
      "We discuss your offer, audience, budget and the results you want.",
      "A month-by-month plan with channels, content calendar and targets.",
      "Competitor study, keyword and audience research, positioning.",
      "Content, ads, tracking and landing pages go live.",
      "You get regular updates and a clear performance report.",
      "Creatives, targeting and messaging are refined from real data.",
      "Monthly report, learnings and the plan for the next month.",
    ]),
    tools: [
      { label: "Google Ads", icon: SiGoogleads, color: "#4285F4" },
      { label: "Google Analytics", icon: SiGoogleanalytics, color: "#E37400" },
      { label: "Search Console", icon: SiGooglesearchconsole, color: "#458CF5" },
      { label: "Meta Ads", icon: SiMeta, color: "#0866FF" },
      { label: "Instagram", icon: SiInstagram, color: "#E1306C" },
      { label: "Facebook", icon: SiFacebook, color: "#0866FF" },
      { label: "Semrush", icon: SiSemrush, color: "#FF642D" },
      { label: "Mailchimp", icon: SiMailchimp, color: "#FFE01B" },
    ],
    suggestedTotal: 4999,
    quickTotals: [1999, 4999, 9999, 19999],
  },

  "graphic-designing": {
    slug: "graphic-designing",
    ...SERVICE_INFO["graphic-designing"],
    seoDescription: "Logos, banners, social media posts, branding and print design — professional graphic design by Nikhil Paharia.",
    intro: {
      what: "Logos, social media creatives, banners, brochures, packaging and complete brand identities — designed to look professional and consistent everywhere.",
      why: "People judge a business by how it looks. Strong visuals build trust, make you memorable and make every post, ad and print piece work harder.",
      problems: ["No logo or an inconsistent brand look", "Social posts that look unprofessional", "Print material that doesn't match online", "No time or skill to design"],
      who: ["New businesses needing a brand", "Social media managers", "Shops, restaurants and events", "Creators and personal brands"],
    },
    provide: [
      "Logo design with variations",
      "Social media posts, stories and covers",
      "Banners, posters, flyers and brochures",
      "Brand colours, fonts and style guide",
      "Print-ready files (CMYK, bleed)",
      "Source files on request",
    ],
    process: steps("Design & Creation", [
      "You tell me about your brand, audience and what you need designed.",
      "Deliverables, formats, sizes and timeline are agreed in writing.",
      "Reference and competitor research, mood board and style direction.",
      "I create the first concepts and polish the chosen direction.",
      "You review the concepts and pick what fits best.",
      "Feedback is applied until the design feels right.",
      "Final files in PNG, JPG, PDF and source formats as needed.",
    ]),
    tools: [
      { label: "Photoshop", text: "Ps", color: "#31A8FF" },
      { label: "Illustrator", text: "Ai", color: "#FF9A00" },
      { label: "Figma", icon: SiFigma, color: "#F24E1E" },
      { label: "Palette & Branding", icon: RiPaletteLine, color: "#7C3AED" },
      { label: "Creative Concepts", icon: RiLightbulbFlashLine, color: "#F59E0B" },
    ],
    suggestedTotal: 999,
    quickTotals: [499, 999, 2999, 7999],
  },

  "ui-ux-design": {
    slug: "ui-ux-design",
    ...SERVICE_INFO["ui-ux-design"],
    seoDescription: "User-friendly UI/UX design for websites, web apps and mobile apps — wireframes, prototypes and design systems in Figma.",
    intro: {
      what: "User research, wireframes and polished interface design for websites and mobile apps — delivered as clickable Figma prototypes and developer-ready files.",
      why: "Good UX makes people understand your product instantly and finish what they came to do. It cuts development rework and lifts conversions.",
      problems: ["Confusing navigation and low conversions", "Apps that look dated or cluttered", "Developers building without a clear design", "Unclear user journeys"],
      who: ["Startups building an MVP", "Businesses redesigning a site or app", "Developers needing a designer", "Product teams and founders"],
    },
    provide: [
      "User flows and wireframes",
      "High-fidelity UI for web and mobile",
      "Clickable Figma prototype",
      "Design system: colours, type, components",
      "Responsive layouts and states",
      "Developer hand-off with assets",
    ],
    process: steps("Design & Prototyping", [
      "We cover your product, users, goals and the screens you need.",
      "Scope, screen list, user flows and timeline are defined.",
      "Competitor and user research, then low-fidelity wireframes.",
      "High-fidelity screens and an interactive prototype in Figma.",
      "You click through the prototype and share feedback.",
      "Screens are refined until the experience feels right.",
      "Organised Figma file, assets and a hand-off for development.",
    ]),
    tools: [
      { label: "Figma", icon: SiFigma, color: "#F24E1E" },
      { label: "Adobe XD", text: "Xd", color: "#FF2BC2" },
      { label: "Framer", icon: SiFramer, color: "#0055FF" },
      { label: "Miro", icon: SiMiro, color: "#FFD02F" },
      { label: "Sketch", icon: SiSketch, color: "#F7B500" },
    ],
    suggestedTotal: 4999,
    quickTotals: [1499, 4999, 9999, 19999],
  },

  "automation-ai-solutions": {
    slug: "automation-ai-solutions",
    ...SERVICE_INFO["automation-ai-solutions"],
    seoDescription: "WhatsApp chatbots, workflow automation, CRM and API integration — save hours every week with AI and automation by Nikhil Paharia.",
    intro: {
      what: "I automate repetitive work with chatbots, workflow automation, CRM set-ups and API integrations so your business replies faster and runs with less manual effort.",
      why: "Manual follow-ups, copy-pasting and slow replies cost you time and customers. Automation works 24/7, never forgets and scales without extra staff.",
      problems: ["Slow replies to enquiries", "Manual data entry between tools", "Leads lost in chats and spreadsheets", "No system for follow-ups"],
      who: ["Service businesses and clinics", "Online stores", "Agencies and consultants", "Teams drowning in repetitive tasks"],
    },
    provide: [
      "WhatsApp and website chatbots",
      "Workflow automation between your apps",
      "CRM and lead-capture set-up",
      "API and webhook integrations",
      "AI assistants trained on your business info",
      "Automatic reports and notifications",
      "Documentation and a walkthrough",
    ],
    process: steps("Development & Automation Build", [
      "We map the tasks eating your time and what you want automated.",
      "A flow diagram, tool list, scope and timeline.",
      "I research the best tools and design the logic and edge cases.",
      "I build and connect the automations, bots and integrations.",
      "You test it with real scenarios on a staging set-up.",
      "Flows and responses are tuned from your feedback.",
      "Go-live, a walkthrough and documentation for your team.",
    ]),
    tools: [
      { label: "AI Automation", icon: RiRobot2Line, color: "#7C3AED" },
      { label: "WhatsApp", icon: SiWhatsapp, color: "#25D366" },
      { label: "n8n", icon: SiN8N, color: "#EA4B71" },
      { label: "Zapier", icon: SiZapier, color: "#FF4F00" },
      { label: "Make", icon: SiMake, color: "#6D00CC" },
      { label: "Gemini", icon: SiGooglegemini, color: "#8E75B2" },
      { label: "Google Sheets", icon: SiGooglesheets, color: "#34A853" },
      { label: "Airtable", icon: SiAirtable, color: "#18BFFF" },
      { label: "HubSpot", icon: SiHubspot, color: "#FF7A59" },
      { label: "Postman", icon: SiPostman, color: "#FF6C37" },
    ],
    suggestedTotal: 9999,
    quickTotals: [4999, 9999, 19999, 39999],
  },

  "e-commerce-solutions": {
    slug: "e-commerce-solutions",
    ...SERVICE_INFO["e-commerce-solutions"],
    seoDescription: "Online store development, product setup, payment integration and store management on Shopify, WooCommerce and WordPress.",
    intro: {
      what: "Complete online stores — design, product upload, payment and shipping set-up and store management — so you can start selling online with confidence.",
      why: "An online store sells while you sleep and reaches customers far beyond your area. A smooth, trustworthy checkout is what turns browsers into buyers.",
      problems: ["Selling only via DMs and WhatsApp", "No way to accept online payments", "Messy product catalogue", "Abandoned carts and low sales"],
      who: ["Shops going online", "D2C and handmade brands", "Resellers and wholesalers", "Existing stores needing a revamp"],
    },
    provide: [
      "Store set-up on Shopify, WooCommerce or custom",
      "Product, category and inventory upload",
      "Payment gateway and shipping integration",
      "Mobile-first, conversion-focused design",
      "Coupons, taxes and order emails",
      "Store management and training",
    ],
    process: steps("Store Design & Development", [
      "We discuss your products, customers, platform preference and budget.",
      "Store structure, features, integrations and timeline are planned.",
      "Platform choice, competitor stores and checkout flow research.",
      "I build the store, add products and connect payments and shipping.",
      "You place test orders and review the whole shopping journey.",
      "Layout, product pages and settings are fine-tuned.",
      "Launch, a how-to guide and support for your first orders.",
    ]),
    tools: [
      { label: "Shopify", icon: SiShopify, color: "#7AB55C" },
      { label: "WordPress", icon: SiWordpress, color: "#21759B" },
      { label: "WooCommerce", icon: SiWoocommerce, color: "#96588A" },
      { label: "Razorpay", icon: SiRazorpay, color: "#0C2451" },
      { label: "Stripe", icon: SiStripe, color: "#635BFF" },
      { label: "Figma", icon: SiFigma, color: "#F24E1E" },
    ],
    suggestedTotal: 9999,
    quickTotals: [4999, 9999, 19999, 39999],
  },

  "cinematography-video-production": {
    slug: "cinematography-video-production",
    ...SERVICE_INFO["cinematography-video-production"],
    seoDescription: "Professional video shooting, cinematography, promotional videos and content creation — end-to-end video production by Nikhil Paharia.",
    intro: {
      what: "End-to-end video production — planning, shooting with cinematic cameras and lighting, and post-production — for promos, brand films, product videos and social content.",
      why: "Great visuals tell your story better than words. Cinematic footage makes your brand feel premium and gives you content that works across every platform.",
      problems: ["Shaky, poorly lit self-shot videos", "No planning or story behind videos", "Inconsistent content quality", "No time to shoot and edit"],
      who: ["Brands and businesses", "Real estate, restaurants and events", "Musicians and creators", "Startups needing promo videos"],
    },
    provide: [
      "Concept, script and shot list",
      "Professional shooting with proper lighting & audio",
      "Promotional, product and brand videos",
      "Reels and short-form content",
      "Editing, colour grading and sound",
      "Delivery in every required format",
    ],
    process: steps("Shoot & Production", [
      "We talk about your story, goals, location and where the video will run.",
      "Concept, script, shot list, schedule and crew/equipment plan.",
      "Location, look and reference research, and mood board.",
      "Shooting day(s) with cinematic cameras, lighting and sound.",
      "Edited draft is shared for your feedback.",
      "Edits and colour changes are applied in revision rounds.",
      "Final video delivered in all formats, plus raw footage if agreed.",
    ]),
    tools: [
      { label: "Cinema Camera", icon: RiCameraLensLine, color: "#0F172A" },
      { label: "Sony", icon: SiSony, color: "#000000" },
      { label: "DJI", icon: SiDji, color: "#1E1E1E" },
      { label: "DaVinci Resolve", icon: SiDavinciresolve, color: "#233A51" },
      { label: "Premiere Pro", logo: premiereProLogo, color: "#9999FF" },
      { label: "After Effects", logo: afterEffectsLogo, color: "#9999FF" },
      { label: "OBS Studio", icon: SiObsstudio, color: "#302E31" },
      { label: "Blender", icon: SiBlender, color: "#F5792A" },
    ],
    suggestedTotal: 7999,
    quickTotals: [2999, 7999, 14999, 29999],
  },
};

export function getServiceDetail(slug: string): ServiceDetail | undefined {
  return (serviceDetails as Record<string, ServiceDetail>)[slug];
}

export const getServiceTitle = (slug: ServiceSlug) => SERVICE_PRICES[slug].title;
