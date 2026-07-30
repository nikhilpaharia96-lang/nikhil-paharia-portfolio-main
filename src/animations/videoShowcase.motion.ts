import type { Transition } from "framer-motion";

export const ease = [0.16, 1, 0.3, 1] as const;

/** Spring for the active/side project card scale + opacity transitions. */
export const cardSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.7,
};

/** Spring for the pagination indicator. */
export const pillSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
};

/** Spring for magnetic hover elements (arrows, play button). */
export const magneticSpring = { stiffness: 220, damping: 18, mass: 0.4 };

/** Spring for the subtle 3D tilt on glass cards. */
export const tiltSpring = { stiffness: 150, damping: 22, mass: 0.6 };
