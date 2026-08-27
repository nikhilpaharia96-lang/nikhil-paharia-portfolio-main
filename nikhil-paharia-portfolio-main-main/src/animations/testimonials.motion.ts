import type { Transition, Variants } from "framer-motion";

/** Apple/Linear-style deceleration curve used for entrance fades. */
export const ease = [0.16, 1, 0.3, 1] as const;

/** Spring used for the active/side card scale + opacity transitions. */
export const cardSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.7,
};

/** Softer spring for the pagination indicator's width/position changes. */
export const pillSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
};

/** Spring used for magnetic hover elements (arrows, buttons). */
export const magneticSpring = { stiffness: 220, damping: 18, mass: 0.4 };

/** Spring used for the subtle 3D tilt on glass cards. */
export const tiltSpring = { stiffness: 150, damping: 22, mass: 0.6 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export const staggerChildren: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};
