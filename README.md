# Nikhil Paharia — Portfolio

A cinematic, mobile-first portfolio site built with React, TypeScript, Vite, Tailwind CSS v4,
Framer Motion, GSAP, and Lenis smooth scrolling.

## Requirements

- Node.js 18+ (Node 20 LTS recommended)
- npm 9+

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local dev server (hot reload, http://localhost:5173):

```bash
npm run dev
```

Type-check the project (no emitted output, just validation):

```bash
npm run typecheck
```

Build for production (outputs to `dist/`):

```bash
npm run build
```

Preview the production build locally:

```bash
npm run serve
```

## Project Structure

```
├── index.html              # HTML entry point, meta/OG tags, fonts
├── src/
│   ├── main.tsx             # React root
│   ├── App.tsx              # App shell: Lenis smooth scroll, section layout,
│   │                         # lazy-loaded below-the-fold sections
│   ├── index.css            # Tailwind v4 theme, design tokens, global
│   │                         # animations, safe-area & reduced-motion rules
│   ├── components/          # One component per page section (Hero, About,
│   │                         # Skills, Projects, VideoShowcase, Services,
│   │                         # Testimonials, Contact, Footer, Navbar, etc.)
│   │   └── ui/               # shadcn/ui-based primitives (button, input, ...)
│   ├── hooks/                # useIsMobile, useReducedFx (low-power/reduced
│   │                         # motion detection), use-toast
│   ├── lib/                  # Shared utilities (className merge helper)
│   ├── pages/                # Route-level pages (404)
│   └── assets/               # Images (WebP), logos, and video clips
├── public/                  # Static files served as-is (favicon, robots.txt,
│                             # opengraph.jpg)
├── vite.config.ts           # Vite config: path aliases, manual vendor
│                             # chunking for framer-motion/gsap
├── tsconfig.json            # TypeScript configuration
└── components.json          # shadcn/ui configuration
```

## Notable Implementation Details

- **Mobile-first & responsive**: every section is built mobile-first with
  Tailwind breakpoints (`xs` @480px is a custom breakpoint defined in
  `index.css`, in addition to the default `sm`/`md`/`lg`/`xl`), safe-area-aware
  spacing for notches/gesture nav (`.pb-safe`, `.pt-safe` utilities), and
  44×44px minimum touch targets enforced globally on touch devices.
- **Performance**: images are pre-optimized WebP; below-the-fold sections
  (`Skills`, `Projects`, `VideoShowcase`, `Services`, `Testimonials`,
  `Contact`, `Footer`) are code-split with `React.lazy`/`Suspense`; heavy
  vendor libraries (`gsap`, `framer-motion`) are split into their own chunks
  in `vite.config.ts`.
- **Accessibility & motion**: the `useReducedFx` hook and `prefers-reduced-motion`
  media query throughout `index.css` and components scale back or disable
  decorative animation for users who request reduced motion, and for
  low-end/small-screen devices.
- **Smooth scrolling**: powered by Lenis, driven off the GSAP ticker so scroll
  and any GSAP-based animation stay in sync.

## Deployment

The `npm run build` command produces a fully static site in `dist/` that can
be deployed to any static host (Vercel, Netlify, Cloudflare Pages, GitHub
Pages, S3 + CloudFront, etc.) with no server-side runtime required.
