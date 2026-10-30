import { motion, useScroll, useSpring } from 'framer-motion';

/** A top-of-page scroll progress bar in the brand gradient. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[60] h-1 w-full origin-left bg-gradient-to-r from-emerald-700 via-green-500 to-lime-400"
    />
  );
}
