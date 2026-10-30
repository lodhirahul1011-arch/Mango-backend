import { motion } from 'framer-motion';

type FruitProps = {
  className?: string;
  delay?: number;
  duration?: number;
};

/** Floating mango slice emoji with parallax drift */
export function FloatingMango({ className = '', delay = 0, duration = 6 }: FruitProps) {
  return (
    <motion.div
      className={`pointer-events-none select-none text-4xl ${className}`}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      🥭
    </motion.div>
  );
}

/** Floating lychee emoji */
export function FloatingLychee({ className = '', delay = 0, duration = 6 }: FruitProps) {
  return (
    <motion.div
      className={`pointer-events-none select-none text-3xl ${className}`}
      animate={{
        y: [0, -16, 0],
        x: [0, 8, 0],
        rotate: [0, -12, 0],
      }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      🍒
    </motion.div>
  );
}

/** Floating leaf */
export function FloatingLeaf({ className = '', delay = 0, duration = 7 }: FruitProps) {
  return (
    <motion.div
      className={`pointer-events-none select-none text-2xl ${className}`}
      animate={{
        y: [0, -14, 0],
        rotate: [0, 20, 0],
      }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      🍃
    </motion.div>
  );
}

/** A floating juice splash burst using CSS */
export function SplashBurst({ className = '', color = '#f98207' }: { className?: string; color?: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`}>
      <motion.div
        className="rounded-full"
        style={{ background: `radial-gradient(circle, ${color}40, transparent 70%)` }}
        animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/** Fruity particle dots that drift */
export function FruitParticles({ count = 8, color = '#f98207' }: { count?: number; color?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 13 + 5) % 100;
        const top = (i * 27 + 10) % 100;
        const size = 4 + (i % 3) * 3;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background: color,
              opacity: 0.3,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        );
      })}
    </div>
  );
}
