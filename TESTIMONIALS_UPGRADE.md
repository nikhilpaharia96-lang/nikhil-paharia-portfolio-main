# Testimonials Section Upgrade — Deliverables

## 1. Files Modified
| File | Change |
|---|---|
| `src/App.tsx` | Updated the lazy import to point at the new `components/testimonials/Testimonials` module instead of the old single-file component. |

## 2. Files Removed
| File | Reason |
|---|---|
| `src/components/Testimonials.tsx` | Replaced by the modular `components/testimonials/` folder below. |

## 3. New Files Created
```
src/components/testimonials/
├── Testimonials.tsx       — section shell: intro copy, layout, assembly
├── TestimonialCard.tsx    — shared glass card (featured / active / side variants)
├── StatsCard.tsx          — single trust-bar stat with count-up + hover glow
├── CarouselControls.tsx   — magnetic glass prev/next arrows
├── Pagination.tsx         — expanding-pill dot indicator
├── QuoteIcon.tsx          — floating quote-mark decoration
├── BackgroundGlow.tsx     — cinematic bg, fog, particles, active-card glow
├── AvatarImage.tsx        — avatar/logo image w/ initials fallback on error
└── StarRating.tsx         — animated 5-star row

src/hooks/
└── useTestimonialsCarousel.ts   — Embla setup, autoplay, keyboard nav, distance calc

src/animations/
└── testimonials.motion.ts       — shared easing curves, spring configs, variants

src/constants/
└── testimonials.ts              — testimonial + trust-stat data (deduped)

src/types/
└── testimonial.ts               — Testimonial / TrustStat / CardVariant types

src/utils/
└── carousel.ts                  — loopedDistance() / distanceToWeight() helpers

src/assets/images/testimonials/
└── apunbazar-logo.png           — extracted from an inline base64 string
```

## 4. Why Each Change Was Made

- **Data deduplication** (`constants/testimonials.ts`): the featured testimonial was previously *also* the carousel's first slide — visitors saw the exact same quote twice. It's now defined once and excluded from the carousel list.
- **Extracted base64 logo → real asset**: a ~3KB PNG was stored as a base64 string directly in the component source, bloating the JS bundle and parse time for no benefit. It's now a normal imported, bundler-optimized asset.
- **Split into modules**: the original was an 850-line single file mixing data, five distinct components, and the section shell. Splitting by responsibility makes each piece independently testable/reusable and keeps diffs small going forward.
- **`useTestimonialsCarousel` hook**: centralizes all Embla wiring (autoplay, pause conditions, keyboard nav, distance calc) so `Testimonials.tsx` stays declarative and the logic is reusable/testable in isolation.
- **`utils/carousel.ts`**: the "active card pops, side cards recede" effect needs to know how far a slide is from the selected one *on a looped track* (so slide 0 and the last slide are "adjacent," not maximally far apart). This is pure, easily-testable math pulled out of the component.

## 5. Performance Improvements
- Removed the inline base64 image from the JS bundle (smaller parse/exec cost).
- Autoplay now uses one interval that's properly cleared and re-evaluated on `visibilitychange`, hover, and focus — it no longer runs in a backgrounded tab.
- Entrance animations (`whileInView`) switched from `once: false` to `once: true` throughout, so scrolling back and forth over the section no longer keeps re-triggering the same fade/pop-in work.
- Background ambient effects (particles, fog, photo drift) now check the repo's existing `useReducedFx()` signal (small viewports / low-end hardware / reduced motion) and render a cheaper variant — this hook existed in the codebase already but the Testimonials section wasn't using it.
- All animated properties are transform/opacity-based (scale, x, y, rotate) — no layout-triggering properties are animated, so there's no layout shift or forced reflow during transitions.

## 6. Accessibility Improvements
- Carousel region now has `role="region"`, `aria-roledescription="carousel"`, per-slide `role="group"`/`aria-roledescription="slide"` with position labels, and `aria-hidden` on non-active slides.
- Added a `sr-only` `aria-live="polite"` status region announcing the current slide to screen reader users.
- Full keyboard support: the carousel region is focusable and responds to ArrowLeft/ArrowRight; autoplay pauses on keyboard focus (not just mouse hover), addressing WCAG 2.2.2 (pause/stop moving content) for keyboard and screen-reader users.
- Autoplay now also respects `prefers-reduced-motion` outright (stays paused) rather than only slowing decorative loops.
- Pagination dots use `role="tablist"`/`role="tab"`/`aria-selected`, arrow buttons have descriptive `aria-label`s, and all interactive elements have visible `focus-visible` rings.
- Decorative-only elements (fog orbs, particles, background photo, sparkle glyphs) are consistently `aria-hidden`.

## 7. Design Improvements
- **Background**: heavier blur (`6–10px` vs `2px`), lower base opacity, and a new soft radial glow anchored behind the carousel — so the Assam photo reads as atmosphere rather than competing with card content.
- **Active vs. side cards**: the carousel now visually distinguishes the centered card (scale `1.06`, full opacity, stronger shadow/glow) from its neighbors (down to `0.9` scale, ~45–70% opacity, softer shadow) — satisfying the "active card should immediately attract attention" goal that the previous uniform-card carousel didn't address at all.
- **Consistent glass system**: one shared card component (`TestimonialCard`) now drives both the hero card and carousel cards, so glass surface, border gradient, inner highlight, and shadow treatment stay visually consistent instead of being hand-tuned twice.
- **Stats bar**: added real count-up numbers, per-item hover glow, and a divider line between stats on the single-row (`lg`) layout — previously these were static strings with no motion or separation.

## 8. Animation Improvements
- Active/side card scale, opacity, and elevation now animate via a shared spring config (`cardSpring`) driven by the slide's distance from the selected index, rather than every card looking identical regardless of carousel position.
- Count-up numbers animate once on viewport entry using a lightweight `IntersectionObserver` + `requestAnimationFrame` easing curve — no numbers change on repeated scroll.
- Pagination dots expand/contract and recolor via a dedicated spring (`pillSpring`) instead of a plain width tween.
- All entrance/float/rotate animations branch on `useReducedMotion()`; combined with the CSS-level `prefers-reduced-motion` backstop already in `index.css`, motion is fully disabled for users who've asked for it — not just slowed down.

## Note on "spring-based carousel movement"
The horizontal slide-to-slide scroll position is still driven by Embla Carousel's own tween (`duration: 28`), which is the standard, jank-free way to animate scroll-snap positions — a physical spring isn't a good fit for a draggable/loopable track. The *visual* transitions that sit on top of that (scale, opacity, elevation, glow) all use real spring physics, which is what actually reads as "premium" motion during a slide change.
