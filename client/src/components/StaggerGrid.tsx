import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeInUp, staggerContainer } from "../lib/motion";

/** Grilla cuyos hijos directos entran con stagger. Envolvé cada item en <StaggerItem>. */
export function StaggerGrid({ children, className = "grid" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerContainer} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: ReactNode }) {
  return <motion.div variants={fadeInUp}>{children}</motion.div>;
}
