/**
 * Turns a plain YouTube / Instagram link (the kind you'd copy from the share
 * button) into an embeddable player URL, so a plain string in the constants
 * file is enough to make a video playable — no manual embed-code wrangling.
 */

export type EmbedKind = "youtube" | "instagram" | "unknown";

export type ParsedEmbed = {
  kind: EmbedKind;
  /** Iframe src to render the player. Empty for "unknown". */
  embedUrl: string;
  /** Original URL — used as a "watch on..." fallback link. */
  sourceUrl: string;
  /** True for YouTube Shorts / Instagram Reels — rendered as a tall 9:16 player. */
  isVertical: boolean;
};

function extractYouTubeId(url: URL): string | null {
  // youtu.be/<id>
  if (url.hostname.includes("youtu.be")) {
    return url.pathname.slice(1).split("/")[0] || null;
  }
  // youtube.com/watch?v=<id>
  const v = url.searchParams.get("v");
  if (v) return v;
  // youtube.com/shorts/<id> or /embed/<id>
  const match = url.pathname.match(/\/(shorts|embed)\/([^/?]+)/);
  if (match) return match[2];
  return null;
}

export function parseVideoUrl(rawUrl: string | undefined | null): ParsedEmbed | null {
  if (!rawUrl) return null;
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    const id = extractYouTubeId(url);
    const isShort = url.pathname.includes("/shorts/");
    if (!id) return { kind: "unknown", embedUrl: "", sourceUrl: rawUrl, isVertical: isShort };
    return {
      kind: "youtube",
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      sourceUrl: rawUrl,
      isVertical: isShort,
    };
  }

  if (host === "instagram.com") {
    // Reels/posts embed at <permalink>/embed — strip query params first.
    const cleanPath = url.pathname.replace(/\/$/, "");
    return {
      kind: "instagram",
      embedUrl: `https://www.instagram.com${cleanPath}/embed`,
      sourceUrl: rawUrl,
      isVertical: true,
    };
  }

  return { kind: "unknown", embedUrl: "", sourceUrl: rawUrl, isVertical: false };
}
