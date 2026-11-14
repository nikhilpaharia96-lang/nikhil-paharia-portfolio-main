/** Scripted (pre-built) workflows. Nothing here calls an AI model — it is local mock data. */
export type DemoId = "learn" | "business" | "creator" | "life" | "builder";

export interface DemoMeta {
  id: DemoId;
  module: string;          // Nova Learn …
  tagline: string;
  prompt: string;          // canonical example prompt
  accent: string;          // css colour
  understanding: string[]; // "Nova Brain is analysing…" lines
  plan: string[];          // planned tasks (step 2)
  tools: { name: string; why: string }[]; // selected modules (step 3)
  tasks: { label: string; ms: number }[]; // processing (step 4)
}

export const DEMOS: Record<DemoId, DemoMeta> = {
  learn: {
    id: "learn", module: "Nova Learn", tagline: "Personalised education", accent: "#22d3ee",
    prompt: "Explain Photosynthesis in Assamese.",
    understanding: ["Intent → learn a science topic", "Topic → Photosynthesis (Biology)", "Language → Assamese", "Output → explanation + notes + visuals + quiz"],
    plan: ["Understand the topic and learner level", "Prepare a structured explanation in Assamese", "Create concise study notes", "Generate a labelled diagram", "Prepare lecture narration", "Create a lecture-video preview", "Generate MCQs for self-check"],
    tools: [
      { name: "Nova Learn", why: "Curriculum-style explanation and notes" },
      { name: "Nova Creator", why: "Diagram + lecture video preview" },
      { name: "Nova Memory", why: "Remember language and level" },
    ],
    tasks: [
      { label: "Understanding the topic", ms: 800 }, { label: "Preparing structured explanation", ms: 1100 },
      { label: "Creating study notes", ms: 900 }, { label: "Generating diagram", ms: 1000 },
      { label: "Preparing lecture narration", ms: 900 }, { label: "Creating lecture-video preview", ms: 1100 },
      { label: "Generating MCQs", ms: 800 },
    ],
  },
  business: {
    id: "business", module: "Nova Business", tagline: "Business intelligence", accent: "#8b5cf6",
    prompt: "Create a marketing plan for my digital agency.",
    understanding: ["Intent → business growth", "Business type → digital agency", "Goal → generate leads and brand trust", "Output → complete marketing plan"],
    plan: ["Analyse business requirements", "Define marketing strategy", "Identify target audience", "Build a 4-week content calendar", "Suggest advertisement ideas", "Break down a sample budget", "Compile the final marketing plan"],
    tools: [
      { name: "Nova Business", why: "Strategy, audience and budget planning" },
      { name: "Nova Research", why: "Market and competitor angles" },
      { name: "Nova Creator", why: "Ad concepts and creative direction" },
    ],
    tasks: [
      { label: "Analysing business requirements", ms: 900 }, { label: "Drafting marketing strategy", ms: 1100 },
      { label: "Profiling target audience", ms: 900 }, { label: "Building content calendar", ms: 1000 },
      { label: "Brainstorming ad ideas", ms: 900 }, { label: "Estimating budget split", ms: 800 },
      { label: "Compiling final plan", ms: 800 },
    ],
  },
  creator: {
    id: "creator", module: "Nova Creator", tagline: "Video, image & audio", accent: "#f472b6",
    prompt: "Create a promotional video for StudyNova AI.",
    understanding: ["Intent → create a promotional video", "Subject → StudyNova AI", "Format → short (≈ 30 s) landscape video", "Output → script, scenes, voiceover, subtitles, timeline"],
    plan: ["Write the video script", "Plan scenes and shots", "Plan the voiceover", "Generate subtitles", "Assemble the video timeline", "Prepare the final preview"],
    tools: [
      { name: "Nova Creator", why: "Script, scenes and timeline assembly" },
      { name: "Nova Brain", why: "Pacing and story structure" },
      { name: "Nova Automation", why: "Subtitle timing and export steps" },
    ],
    tasks: [
      { label: "Generating script", ms: 1000 }, { label: "Planning scenes", ms: 1000 },
      { label: "Planning voiceover", ms: 900 }, { label: "Generating subtitles", ms: 900 },
      { label: "Assembling video timeline", ms: 1200 }, { label: "Preparing final preview", ms: 900 },
    ],
  },
  life: {
    id: "life", module: "Nova Life", tagline: "Personal assistant", accent: "#34d399",
    prompt: "Organize my daily tasks.",
    understanding: ["Intent → organise the day", "Sources → sample calendar, tasks, notes", "Goal → clear schedule and next actions", "Output → personal dashboard"],
    plan: ["Collect today's schedule", "Sort completed and pending tasks", "Check upcoming deadlines", "Pull important notes", "Suggest the next best actions"],
    tools: [
      { name: "Nova Life", why: "Daily planning and reminders" },
      { name: "Nova Memory", why: "Personal context and preferences" },
      { name: "Nova Automation", why: "Recurring tasks and reminders" },
    ],
    tasks: [
      { label: "Reading today's schedule", ms: 800 }, { label: "Sorting tasks", ms: 900 },
      { label: "Checking deadlines", ms: 900 }, { label: "Collecting important notes", ms: 800 },
      { label: "Suggesting next actions", ms: 1000 },
    ],
  },
  builder: {
    id: "builder", module: "Nova Builder", tagline: "Websites & apps", accent: "#fbbf24",
    prompt: "Build a website for my business.",
    understanding: ["Intent → build a website", "Subject → small business", "Output → sitemap, wireframe and tech plan"],
    plan: ["Clarify the business and goals", "Draft a sitemap", "Design a wireframe", "Recommend a tech stack"],
    tools: [
      { name: "Nova Builder", why: "Site structure and wireframing" },
      { name: "Nova Creator", why: "Brand visuals and copy direction" },
    ],
    tasks: [
      { label: "Clarifying business goals", ms: 900 }, { label: "Drafting sitemap", ms: 900 },
      { label: "Designing wireframe", ms: 1100 }, { label: "Choosing tech stack", ms: 800 },
    ],
  },
};

export const EXAMPLE_PROMPTS: { text: string; demo: DemoId }[] = [
  { text: "Explain Photosynthesis in Assamese.", demo: "learn" },
  { text: "Create a professional lecture video.", demo: "creator" },
  { text: "Build a website for my business.", demo: "builder" },
  { text: "Create a marketing campaign.", demo: "business" },
  { text: "Organize my daily tasks.", demo: "life" },
];

/** Keyword router: maps free text to the closest PRE-BUILT workflow (no AI involved). */
export function matchDemo(prompt: string): { id: DemoId; exact: boolean } {
  const t = prompt.toLowerCase().trim();
  const ex = EXAMPLE_PROMPTS.find((e) => e.text.toLowerCase() === t);
  if (ex) return { id: ex.demo, exact: true };
  if (/web ?site|landing page|\bapp\b|portfolio site|build/.test(t)) return { id: "builder", exact: false };
  if (/task|schedule|daily|organi[sz]e|remind|deadline|to-?do|plan my/.test(t)) return { id: "life", exact: false };
  if (/video|reel|script|promo|voice ?over|subtitle|edit/.test(t)) return { id: "creator", exact: false };
  if (/market|campaign|agency|business plan|\bads?\b|budget|strategy|client/.test(t)) return { id: "business", exact: false };
  return { id: "learn", exact: false };
}
