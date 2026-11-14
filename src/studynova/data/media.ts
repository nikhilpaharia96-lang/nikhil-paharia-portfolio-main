/**
 * Media registry. Files dropped in src/studynova/assets/{images,videos}/ are detected by file name
 * (see assets/README.md). A missing file simply returns undefined → the UI shows a placeholder.
 */
const found = import.meta.glob("../assets/**/*.{png,jpg,jpeg,webp,gif,svg,mp4,webm,mov}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const byName: Record<string, string> = {};
for (const [path, url] of Object.entries(found)) {
  const file = path.split("/").pop() as string;
  byName[file.replace(/\.[^.]+$/, "").toLowerCase()] = url;
}

export type MediaSlotId =
  | "learn-lecture" | "learn-diagram" | "creator-promo" | "whatsapp-demo"
  | "wearable-concept" | "presentation-cover" | "logo";

export const getMedia = (slot: MediaSlotId | string): string | undefined => byName[slot];
export const getPoster = (slot: string): string | undefined => byName[`poster-${slot}`];
export const getGallery = (): string[] =>
  Object.keys(byName).filter((k) => k.startsWith("gallery-")).sort().map((k) => byName[k]);
export const hasAnyMedia = () => Object.keys(byName).length > 0;
