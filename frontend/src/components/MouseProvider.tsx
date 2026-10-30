import { createContext, useRef, type ReactNode } from 'react';
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion';

type MouseContextType = {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
};

const MouseContext = createContext<MouseContextType | null>(null);

/** Provides global normalized mouse position (-1 to 1) as motion values for parallax effects. */
export function MouseProvider({ children }: { children: ReactNode }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const mouseX = useSpring(rawX, { stiffness: 80, damping: 20, mass: 0.5 });
  const mouseY = useSpring(rawY, { stiffness: 80, damping: 20, mass: 0.5 });

  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    rawX.set(x * 15);
    rawY.set(-y * 10);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <MouseContext.Provider value={{ mouseX, mouseY }}>
      <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        {children}
      </div>
    </MouseContext.Provider>
  );
}

