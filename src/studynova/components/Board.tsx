import { getMedia } from "../data/media";

type BoardId = "hero" | "problem" | "vision" | "how" | "brain" | "learn";

/** One of the StudyNova poster boards (src/studynova/assets/images/board-*.webp), shown uncropped. */
export default function Board({ id, alt, caption, stamp }: { id: BoardId; alt: string; caption?: string; stamp?: string }) {
  const url = getMedia(`board-${id}`);
  if (!url) return null;
  return (
    <figure className="sn-board">
      <img src={url} alt={alt} loading={id === "hero" ? "eager" : "lazy"} decoding="async" />
      {(caption || stamp) && (
        <figcaption><span>{caption}</span>{stamp && <span className="sn-stamp" style={{ transform: "none" }}>{stamp}</span>}</figcaption>
      )}
    </figure>
  );
}
