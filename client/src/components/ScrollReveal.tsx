import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeInUp } from "../lib/motion";

/** Envuelve una sección para que aparezca (fade + slide) cuando entra en el viewport. */
export function ScrollReveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeInUp}
    >
      {children}
    </motion.div>
  );
}
