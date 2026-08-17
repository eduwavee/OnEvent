import { animate, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  value: number;
  duration?: number;
}

/** Cuenta de 0 hasta `value` cuando entra en pantalla. Respeta reduced-motion. */
export function AnimatedCounter({ value, duration = 1.2 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString("es-AR"));

  useEffect(() => {
    if (!inView) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, value, duration, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}
