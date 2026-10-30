import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SignatureProductTrail() {
  const layerRef = useRef<HTMLDivElement>(null);
  const mangoRef = useRef<HTMLImageElement>(null);
  const lycheeRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const mango = mangoRef.current;
    const lychee = lycheeRef.current;
    const flavours = document.getElementById('flavours');
    if (!layer || !mango || !lychee || !flavours) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      gsap.set(layer, {
        autoAlpha: 0,
        xPercent: -50,
        yPercent: -50,
        x: window.innerWidth * 0.68,
        y: window.innerHeight * 0.62,
        scale: 0.72,
        rotate: -8,
      });
      gsap.set(mango, { autoAlpha: 1 });
      gsap.set(lychee, { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: flavours,
          start: 'top top',
          end: '75% top',
          scrub: 0.35,
          invalidateOnRefresh: true,
          // Hide immediately outside Products, including while scrub catches up
          // during reverse scrolling into the hero.
          onToggle: (self) => { layer.style.display = self.isActive ? 'block' : 'none'; },
        },
      });

      tl.to(layer, { autoAlpha: 1, duration: 0.08, ease: 'none' }, 0)
        .to(
          layer,
          {
            keyframes: [
              {
                x: () => window.innerWidth * 0.74,
                y: () => window.innerHeight * 0.46,
                scale: 0.82,
                rotate: 5,
                duration: 0.28,
              },
              {
                x: () => window.innerWidth * 0.58,
                y: () => window.innerHeight * 0.34,
                scale: 0.62,
                rotate: -4,
                duration: 0.3,
              },
              {
                x: () => window.innerWidth * 0.72,
                y: () => window.innerHeight * 0.52,
                scale: 0.9,
                rotate: 4,
                duration: 0.42,
              },
            ],
            ease: 'power1.inOut',
          },
          0
        )
        .to(mango, { autoAlpha: 0, duration: 0.22, ease: 'none' }, 0.58)
        .to(lychee, { autoAlpha: 1, duration: 0.24, ease: 'none' }, 0.58)
        .to(layer, { autoAlpha: 0, duration: 0.12, ease: 'none' }, 0.9);

      return () => {
        tl.kill();
        layer.style.removeProperty('display');
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={layerRef}
      className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[360px] w-[210px] will-change-transform lg:block"
      style={{ opacity: 0, visibility: 'hidden' }}
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 h-[280px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-[44%] bg-[#FFC83D]/18 blur-3xl" />
      <img
        ref={mangoRef}
        src="/images/pio-mango-lossless.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_38px_54px_rgba(7,61,44,0.24)]"
        draggable={false}
      />
      <img
        ref={lycheeRef}
        src="/images/pio-lychee-lossless.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_38px_54px_rgba(131,24,67,0.22)]"
        draggable={false}
      />
    </div>
  );
}
