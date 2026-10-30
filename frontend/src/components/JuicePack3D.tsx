import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type Props = {
  flavor: 'mango' | 'lychee';
  className?: string;
};

/**
 * A CSS 3D Tetra Pak-style juice pack that rotates with mouse movement
 * and has a subtle idle floating animation.
 */
export function JuicePack3D({ flavor, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Source motion values for mouse position
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Springs that smoothly follow the mouse values
  const rotateY = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.5 });
  const rotateX = useSpring(my, { stiffness: 120, damping: 18, mass: 0.5 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    mx.set(dx * 30);
    my.set(-dy * 25);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const isMango = flavor === 'mango';

  const c = isMango
    ? { main: '#f98207', dark: '#b84706', light: '#ffc05c', text: 'MANGO' }
    : { main: '#e34a6f', dark: '#ac1e45', light: '#f7a8ba', text: 'LYCHEE' };

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center ${className}`}
      style={{ perspective: '1200px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative"
      >
        {/* Idle float wrapper */}
        <motion.div
          animate={{ y: [0, -16, 0], rotateZ: [-2, 2, -2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* The 3D pack */}
          <div
            className="relative"
            style={{
              width: '160px',
              height: '250px',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Front face */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-between rounded-t-2xl rounded-b-lg p-3 shadow-2xl"
              style={{
                background: `linear-gradient(160deg, ${c.light}, ${c.main} 40%, ${c.dark})`,
                transform: 'translateZ(40px)',
                boxShadow: `0 30px 60px -10px ${c.main}40, 0 18px 36px -18px ${c.dark}`,
              }}
            >
              {/* Glossy highlight */}
              <div
                className="pointer-events-none absolute inset-0 rounded-t-2xl rounded-b-lg"
                style={{
                  background: 'linear-gradient(105deg, rgba(255,255,255,0.35) 0%, transparent 50%)',
                }}
              />

              {/* Top: brand */}
              <div className="relative z-10 mt-3 text-center">
                <p className="font-display text-2xl font-bold italic text-white drop-shadow-lg">Pio</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">Har Sip Jio</p>
              </div>

              {/* Middle: flavor */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 backdrop-blur-sm"
                  style={{ background: `${c.dark}30` }}
                >
                  <span className="text-3xl">{isMango ? '🥭' : '🍒'}</span>
                </div>
                <p className="mt-2 font-display text-lg font-bold uppercase tracking-wide text-white drop-shadow-md">
                  {c.text}
                </p>
              </div>

              {/* Bottom: size */}
              <div className="relative z-10 mb-3 flex w-full items-center justify-between rounded-lg bg-white/20 px-2 py-1 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-white">160 mL</span>
                <span className="text-[10px] font-bold text-white">₹10</span>
              </div>
            </div>

            {/* Back face */}
            <div
              className="absolute inset-0 rounded-t-2xl rounded-b-lg"
              style={{
                background: `linear-gradient(160deg, ${c.dark}, ${c.main})`,
                transform: 'translateZ(-40px) rotateY(180deg)',
              }}
            >
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <p className="font-display text-lg font-bold text-white/90">{c.text}</p>
                <p className="mt-2 text-[10px] leading-relaxed text-white/70">
                  Premium Fruit Beverage<br />Made in Assam<br />No Preservatives
                </p>
                <div className="mt-3 h-px w-16 bg-white/30" />
                <p className="mt-3 text-[8px] text-white/50">Repose Agrotech Pvt Ltd</p>
              </div>
            </div>

            {/* Left face */}
            <div
              className="absolute top-0 left-0 rounded-l-lg"
              style={{
                width: '80px',
                height: '100%',
                background: `linear-gradient(180deg, ${c.dark}, ${c.main})`,
                transform: 'rotateY(-90deg) translateZ(-40px) translateX(-40px)',
                transformOrigin: 'left center',
              }}
            >
              <div className="flex h-full items-center justify-center">
                <p className="rotate-90 font-display text-sm font-bold uppercase tracking-[0.3em] text-white/60">
                  {c.text}
                </p>
              </div>
            </div>

            {/* Right face */}
            <div
              className="absolute top-0 right-0 rounded-r-lg"
              style={{
                width: '80px',
                height: '100%',
                background: `linear-gradient(180deg, ${c.main}, ${c.dark})`,
                transform: 'rotateY(90deg) translateZ(-40px) translateX(40px)',
                transformOrigin: 'right center',
              }}
            >
              <div className="flex h-full items-center justify-center">
                <p className="-rotate-90 font-display text-sm font-bold uppercase tracking-[0.3em] text-white/60">
                  Pio
                </p>
              </div>
            </div>

            {/* Top face */}
            <div
              className="absolute left-0 top-0"
              style={{
                width: '100%',
                height: '30px',
                background: `linear-gradient(180deg, ${c.light}, ${c.main})`,
                transform: 'rotateX(-90deg) translateZ(-15px)',
                transformOrigin: 'top center',
                clipPath: 'polygon(15% 100%, 50% 0%, 85% 100%)',
              }}
            />

            {/* Bottom face */}
            <div
              className="absolute bottom-0 left-0"
              style={{
                width: '100%',
                height: '80px',
                background: c.dark,
                transform: 'rotateX(90deg) translateZ(-40px)',
                transformOrigin: 'bottom center',
              }}
            />

            {/* Glow underneath */}
            <div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-full blur-xl"
              style={{
                width: '120px',
                height: '20px',
                background: `${c.main}40`,
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
