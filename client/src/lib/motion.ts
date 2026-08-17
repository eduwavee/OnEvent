import type { Variants } from "framer-motion";

// Variantes de animación compartidas, para que el movimiento se sienta como
// un mismo sistema en toda la app en vez de efectos sueltos por página.

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0.7, 0.2, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};
