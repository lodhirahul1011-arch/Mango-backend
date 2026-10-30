import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function OrangeTraveller() {
  const travellerRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const traveller = travellerRef.current;
    const trail = trailRef.current;
    const main = document.querySelector('main');
    if (!traveller || !trail || !main) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const sections = Array.from(main.children).slice(1);
    if (!sections.length) return;

    gsap.set(traveller, {
      autoAlpha: 0,
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth * 1.08,
      y: window.innerHeight * 0.9,
      scale: 0.62,
      rotate: -12,
      visibility: 'visible',
      display: 'block',
    });
    gsap.set(trail, { autoAlpha: 0, scaleX: 0, transformOrigin: 'left center', opacity: 0.9, visibility: 'visible' });

    const context = gsap.context(() => {
      sections.forEach((section) => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 98%',
            end: 'top 82%',
            scrub: 0.3,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              traveller.style.display = self.isActive ? 'block' : 'none';
            },
          },
        });

        timeline
          .to(traveller, { autoAlpha: 1, duration: 0.12, ease: 'none' }, 0)
          .to(
            traveller,
            {
              keyframes: [
                {
                  x: () => window.innerWidth * 0.9,
                  y: () => window.innerHeight * 0.88,
                  scale: 0.72,
                  rotate: 8,
                  duration: 0.22,
                },
                {
                  x: () => window.innerWidth * 0.62,
                  y: () => window.innerHeight * 0.86,
                  scale: 0.82,
                  rotate: 92,
                  duration: 0.5,
                },
                {
                  x: () => window.innerWidth * 0.18,
                  y: () => window.innerHeight * 0.9,
                  scale: 0.58,
                  rotate: 175,
                  duration: 0.28,
                },
              ],
              ease: 'power2.inOut',
            },
            0
          )
          .to(trail, { autoAlpha: 0.78, scaleX: 1.05, duration: 0.48, ease: 'power2.out' }, 0.08)
          .to(trail, { autoAlpha: 0, scaleX: 0.15, duration: 0.18, ease: 'power1.in' }, 0.72)
          .to(traveller, { autoAlpha: 0, duration: 0.15, ease: 'none' }, 0.9);
      });
    });

    return () => {
      context.revert();
      traveller.style.removeProperty('display');
    };
  }, []);

  return (
    <div
      ref={travellerRef}
      className="pointer-events-none fixed left-0 top-0 z-20 hidden h-[56px] w-[56px] will-change-transform md:block"
      aria-hidden="true"
    >
      <div
        ref={trailRef}
        className="absolute left-1/2 top-1/2 h-[4px] w-[100px] -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-[#fbbf24]/80 via-[#f59e0b]/70 to-[#fb923c]/0 blur-[2px]"
        style={{ filter: 'drop-shadow(0 0 8px rgba(251,146,60,0.5))' }}
      />
      <div
        className="absolute inset-[4px] rounded-full"
        style={{
          background: 'radial-gradient(circle at 34% 26%, #fff7c2 0%, #fbbf24 18%, #fb923c 54%, #ea580c 100%)',
          boxShadow: 'inset -6px -6px 10px rgba(124,45,18,.2), inset 4px 4px 7px rgba(255,255,255,.48), 0 8px 16px rgba(194,65,12,.32)',
          filter: 'drop-shadow(0 7px 14px rgba(251,146,60,0.34))',
        }}
      />
      <div className="absolute inset-[9px] rounded-full border border-white/55 bg-white/10" />
      <span className="absolute left-[24px] top-[1px] h-[14px] w-[9px] -rotate-[38deg] rounded-[100%_0_100%_0] bg-gradient-to-br from-[#84cc16] to-[#166534]" />
      <span className="absolute left-[12px] top-[12px] h-[6px] w-[10px] -rotate-[30deg] rounded-full bg-white/70 blur-[1px]" />
    </div>
  );
}