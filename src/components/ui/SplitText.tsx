import { motion, useReducedMotion } from "framer-motion";

interface SplitTextProps {
  children: string;
  className?: string;
  /** Extra class applied to each character/word span (e.g. "gradient-text"). */
  charClassName?: string;
  delay?: number;
  duration?: number;
  type?: "words" | "chars";
  once?: boolean;
}

export default function SplitText({
  children,
  className = "",
  charClassName = "",
  delay = 0,
  duration = 0.7,
  type = "chars",
  once = false,
}: SplitTextProps) {
  const rm = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: rm ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: rm
        ? { duration: 0 }
        : {
            staggerChildren: type === "chars" ? 0.025 : 0.08,
            delayChildren: delay,
          },
    },
  };

  const childVariants = {
    hidden: { y: rm ? 0 : "110%", opacity: rm ? 1 : 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: rm
        ? { duration: 0 }
        : {
            duration: duration,
            ease: [0.16, 1, 0.3, 1], // Expo-out curve (Stripe/Apple style)
          },
    },
  };

  const textContent = children;
  const words = textContent.split(" ");

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px" }}
      aria-label={textContent}
    >
      {/* Screen reader semantic text fallback */}
      <span className="sr-only">{textContent}</span>

      {type === "words" ? (
        words.map((word, idx) => (
          <span
            key={idx}
            className="relative inline-block overflow-hidden mr-[0.24em] py-[0.1em] -my-[0.1em]"
            aria-hidden="true"
          >
            <motion.span className={`inline-block ${charClassName}`} variants={childVariants}>
              {word}
            </motion.span>
          </span>
        ))
      ) : (
        words.map((word, wIdx) => (
          <span
            key={wIdx}
            className="relative inline-flex overflow-hidden mr-[0.24em] py-[0.1em] -my-[0.1em]"
            aria-hidden="true"
          >
            {word.split("").map((char, cIdx) => (
              <motion.span
                key={cIdx}
                className={`inline-block ${charClassName}`}
                variants={childVariants}
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))
      )}
    </motion.span>
  );
}
