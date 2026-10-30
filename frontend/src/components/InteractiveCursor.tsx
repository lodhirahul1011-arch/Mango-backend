import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export function InteractiveCursor() {
  const [visible, setVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cursorX = useSpring(-100, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(-100, { stiffness: 500, damping: 28 });
  const trailX = useSpring(-100, { stiffness: 150, damping: 20 });
  const trailY = useSpring(-100, { stiffness: 150, damping: 20 });

  useEffect(() => {
    // Only show custom cursor on fine pointer devices (desktop mouse)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      trailX.set(e.clientX);
      trailY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isClickable =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer') ||
        target.getAttribute('role') === 'button';

      setIsHovered(!!isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleElementHover);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleElementHover);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, trailX, trailY, visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {/* 1. Outer Soft Glowing Aura (Trailing Spring) */}
      <motion.div
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className={`fixed rounded-full transition-all duration-300 pointer-events-none ${
          isHovered
            ? 'h-16 w-16 bg-[#10b981]/25 blur-md scale-125'
            : 'h-10 w-10 bg-[#f59e0b]/20 blur-sm scale-100'
        }`}
      />

      {/* 2. Inner Sharp Ring / Pointer (Immediate Spring) */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className={`fixed rounded-full border transition-all duration-150 pointer-events-none flex items-center justify-center ${
          isHovered
            ? 'h-10 w-10 border-[#07582f] bg-[#07582f]/10 shadow-[0_0_15px_rgba(7,88,47,0.4)]'
            : 'h-4 w-4 border-[#07582f]/80 bg-white shadow-xs'
        }`}
      >
        {isHovered && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-ping" />
        )}
      </motion.div>
    </div>
  );
}
