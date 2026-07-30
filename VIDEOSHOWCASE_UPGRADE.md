# VideoShowcase Section Upgrade — Deliverables

## Files Removed
- `src/components/VideoShowcase.tsx` (676-line monolith, replaced below)

## Files Modified
- `src/App.tsx` — import path updated to the new module
- `src/utils/carousel.ts` — added `plainDistance()`, a non-looped version of the distance helper already used by Testimonials

## New Files
```
src/components/video-showcase/
├── VideoShowcase.tsx       — section shell / layout
├── FeaturedVideoCard.tsx   — hero video card (now with a real play/pause button)
├── ProjectCard.tsx         — carousel card, active/side variants
├── ProjectCarousel.tsx     — Embla-based reel + pagination + arrows
├── CarouselControls.tsx    — magnetic glass prev/next arrows
├── Pagination.tsx          — expanding-pill dot indicator
├── FloatingChip.tsx        — ambient floating icon decoration
├── FeatureStrip.tsx        — 4-up production-capability grid
└── BackgroundGlow.tsx      — cinematic bg, golden sweep, fog, particles

src/hooks/useProjectCarousel.ts     — Embla setup, keyboard nav, distance calc
src/animations/videoShowcase.motion.ts — shared easing/spring configs
src/constants/videoShowcase.ts      — featured/project/feature data
src/types/video.ts                  — Project / FeaturedVideo / feature types
```

## What changed and why

**Fixed a real functionality/accessibility bug**: the featured card's Play button was a plain `<div>` — no `onClick`, no keyboard focus, no ARIA role. Touch and keyboard users could never trigger it; only mouse-hover worked. It's now a real `<button>` with `aria-pressed`, toggles play/pause, and works via click, tap, or Enter/Space. The same fix applies to each project card's "preview" control.

**Added active-card carousel treatment**: the project reel used to be a plain scroll strip with no visual distinction between cards. It now uses Embla Carousel (same pattern as the Testimonials upgrade) with the centered card scaling up (`1.05`) and gaining a subtle primary-colored ring, while neighbors recede in scale/opacity — driven by the shared spring config, not a new one-off animation.

**Mobile navigation gap closed**: arrows were `hidden md:flex` with no substitute, so mobile had no way to see project count or jump to one. Added the same expanding-dot pagination used in Testimonials, visible at all breakpoints, plus keyboard arrow-key support and a screen-reader live region announcing the active project.

**Reduced-motion support added throughout**: previously nothing in this component checked `prefers-reduced-motion` — the floating chips, golden light sweep, particles, and background parallax all ran unconditionally. Every animated element now branches on `useReducedMotion()` (JS-driven `animate` props aren't caught by the site's CSS-level reduced-motion backstop, so this needed doing explicitly, same as the Testimonials fix).

**Performance**: `viewport={{ once: false }}` switched to `once: true` across all entrance animations (no more re-triggering on repeated scroll), and the ambient background now checks the existing `useReducedFx()` hook to drop particle count and skip parallax/drift on lower-power devices — consistent with the Testimonials and LoadingScreen updates.

## Verified
- `tsc --noEmit`: no new type errors
- `vite build`: succeeds — `VideoShowcase` chunk builds at ~24KB (~7.2KB gzipped)
