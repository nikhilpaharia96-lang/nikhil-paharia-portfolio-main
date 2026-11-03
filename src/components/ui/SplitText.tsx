interface SplitTextProps {
  children: string;
  className?: string;
  charClassName?: string;
  type?: "words" | "chars";
  // Accepted for call-site compatibility with the source design; unused (no animation).
  delay?: number;
  duration?: number;
  once?: boolean;
}

/**
 * Static text. Keeps the source's inline-flex/word-box layout (same wrapping and
 * spacing) but renders every word in place with no reveal or stagger.
 */
export default function SplitText({
  children,
  className = "",
  charClassName = "",
  type = "chars",
}: SplitTextProps) {
  const words = children.split(" ");
  return (
    <span className={`inline-flex flex-wrap ${className}`} aria-label={children}>
      <span className="sr-only">{children}</span>
      {words.map((word, wIdx) =>
        type === "words" ? (
          <span
            key={wIdx}
            className="relative inline-block overflow-hidden mr-[0.24em] py-[0.1em] -my-[0.1em]"
            aria-hidden="true"
          >
            <span className={`inline-block ${charClassName}`}>{word}</span>
          </span>
        ) : (
          <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.24em]" aria-hidden="true">
            {word.split("").map((ch, cIdx) => (
              <span key={cIdx} className={`inline-block ${charClassName}`}>
                {ch}
              </span>
            ))}
          </span>
        ),
      )}
    </span>
  );
}
