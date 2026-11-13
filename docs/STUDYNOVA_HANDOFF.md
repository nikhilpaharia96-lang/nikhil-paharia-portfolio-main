# StudyNova AI — Handoff for the Next AI

Repo: `nikhilpaharia96-lang/nikhil-paharia-portfolio-main`
Tagline: **One AI. Your Entire World.**
Goal: a presentation-ready, clickable PROTOTYPE at `/studynova` inside the existing portfolio, for a college Ideathon/Hackathon. NOT production software.

## Status
- Nothing built yet. Repo has NOT been audited or modified.
- Next AI starts at Step 0.

## Hard rules
- Do not redesign, delete or break the existing portfolio, routes or navigation.
- Reuse the existing stack and dependencies; avoid new packages.
- No real AI, WhatsApp, Meta, Twilio or Evolution API calls. No API keys, payments, auth, backend or database.
- Everything is simulated with local mock data. Label it "Prototype Simulation" / "Demo Mode" clearly.
- No fake testimonials or fake statistics.
- Missing assets: use professional placeholders, never fake screenshots.
- Do not deploy without the user's permission.

## Build order
0. **Audit**: framework, router, folder structure, styling, design tokens, fonts, existing components. Write findings down.
1. **Scaffold**: route `/studynova`, nav entry or project card on the portfolio, folder `studynova/` (components, data, assets), shared mock-data files.
2. **Design system**: dark navy background, electric blue, cyan and violet accents, glassmorphism, subtle glow. Responsive for desktop, tablet and mobile. Light animation only.
3. **Dashboard**: header (logo, tagline, Demo Mode badge, profile, nav), hero ("Your entire world, powered by one AI."), large command box (text, simulated voice, upload UI, send), 5 example prompt chips.
4. **Nova Brain engine** (the core): a reusable component with 5 steps: Understanding, Planning, Selecting Tools, Processing (progress), Result. Driven by predefined workflows keyed by prompt. Include a "simulated" label.
5. **Four demos**:
   - A. Nova Learn: Photosynthesis in Assamese. 7 steps, result with explanation, notes, diagram placeholder, video placeholder, clickable MCQ quiz.
   - B. Nova Business: marketing plan (analysis, strategy, audience, content calendar, ad ideas, budget, final plan).
   - C. Nova Creator: promo video (script, scenes, voiceover, subtitles, mock timeline editor, preview placeholder).
   - D. Nova Life: sample daily dashboard (schedule, completed, pending, deadlines, notes, next actions).
6. **WhatsApp simulation** ("StudyNova AI — Coming to WhatsApp"): WhatsApp-style chat UI. Conversation 1: Newton's Laws in Assamese, with a Nova Brain pipeline and a "Your learning package is ready!" message with buttons Read Notes / View Lecture / Take Quiz. Conversation 2: "Remind me to follow up with my client tomorrow." Architecture diagram: WhatsApp User → WhatsApp Business API → StudyNova Backend → Nova Brain → Specialized AI Module → Response to WhatsApp. Visual only.
7. **Ecosystem cards** (9 modules, each with icon, description and interactive preview): Brain, Learn, Memory, Life, Business, Creator, Builder, Research, Automation.
8. **Wearable AI concept**: mockup/illustration labelled "Future Concept — not an existing device". Features: voice interaction, consent-based lecture recording, summaries, deadlines, meeting summaries. Privacy: consent required, visible recording indicator, pause/delete controls.
9. **Innovation architecture diagram**: User → Multimodal Input (text/voice/camera/files) → Nova Brain → Orchestration Engine → Specialized Modules → Result Generation → User, with WhatsApp as an extra input/output channel.
10. **Presentation Mode** ("Launch Presentation Mode"): fullscreen slides with next/previous and keyboard controls (arrows, Esc, F). Slides: Problem, Vision, Solution, How it works, Live demo, WhatsApp concept, Architecture, Social impact, Roadmap. Projector-friendly large text.
11. **Assets**: user will supply videos, images and logos. Build dedicated video preview cards and image galleries (playable video, clickable images, original aspect ratios) in Nova Learn, Nova Creator, WhatsApp and Presentation Mode. Put them in `studynova/assets/` with placeholders until provided.
12. **QA**: test every interaction, desktop and mobile layouts, console errors, and that all original portfolio pages still work.

## Final report must include
Files created or modified, features implemented, testing results, known limitations, how to open the demo, a clear list of what is simulated vs actually implemented, and confirmation the original portfolio still works.

## Suggested first message to the next AI
"Read STUDYNOVA_HANDOFF.md fully. Start with Step 0 (audit the repo), show me your plan, then build in the listed order."

## Repo audit findings (done)
- Stack: Vite 5 + React 18 + TypeScript, Tailwind v4 (`@import "tailwindcss"`), wouter router, framer-motion, lucide-react, Radix UI (shadcn, see `components.json`), TanStack Query.
- Routing: `src/App.tsx` uses wouter `<Switch>`. Existing routes: `/`, `/services/:slug`, `/payment`, `/admin`, plus NotFound. Add `<Route path="/studynova">` (lazy-loaded with `Suspense`, like `/admin`) BEFORE the NotFound fallback.
- Deploy: Vercel (`vercel.json` rewrites everything except `/api/` to `index.html`, so `/studynova` works without config). Pushing to `main` may auto-deploy: work on a branch.
- Fonts already loaded: Space Grotesk, Syne, Caveat. Reuse them; theme tokens live in `src/index.css` and `src/dark-theme.css`.
- Assets go in `src/assets/` (images, videos, audio, logos) or `public/`.
- Existing components to leave alone: `Navbar.tsx`, `Projects.tsx`, `Hero.tsx`, etc. Add a StudyNova project card in `Projects.tsx` and a nav link in `Navbar.tsx` with minimal edits.
- Other branches exist (booking, supabase, perf, redesign). Branch off `main` and do not touch them.
- Scripts: `npm run dev`, `npm run build`, `npm run typecheck`, `npm test`.
- Suggested folder: `src/pages/StudyNova.tsx` + `src/studynova/{components,data,assets}`.
