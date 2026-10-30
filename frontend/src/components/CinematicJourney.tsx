import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const mangoPieces = [
  { label: 'slice', x: '-42vw', y: '-10vh', endX: '12vw', endY: '44vh', r: 84, s: 1.1 },
  { label: 'cube', x: '-18vw', y: '-24vh', endX: '-18vw', endY: '58vh', r: -112, s: 0.82 },
  { label: 'leaf', x: '38vw', y: '-18vh', endX: '8vw', endY: '48vh', r: 132, s: 0.92 },
  { label: 'drop', x: '46vw', y: '10vh', endX: '-4vw', endY: '62vh', r: -64, s: 0.72 },
  { label: 'slice', x: '-48vw', y: '18vh', endX: '26vw', endY: '68vh', r: 154, s: 0.9 },
  { label: 'cube', x: '28vw', y: '-30vh', endX: '-24vw', endY: '42vh', r: 96, s: 0.78 },
];

const lycheePieces = [
  { label: 'lychee', angle: 10, radius: 164, delay: 0 },
  { label: 'petal', angle: 64, radius: 214, delay: 0.08 },
  { label: 'ring', angle: 126, radius: 178, delay: 0.12 },
  { label: 'lychee', angle: 190, radius: 225, delay: 0.04 },
  { label: 'petal', angle: 250, radius: 154, delay: 0.16 },
  { label: 'drop', angle: 316, radius: 200, delay: 0.1 },
];

function FruitMark({ type, className = '' }: { type: string; className?: string }) {
  const shape =
    type === 'slice'
      ? 'rounded-[70%_30%_62%_38%]'
      : type === 'cube'
        ? 'rounded-[30%]'
        : type === 'leaf'
          ? 'rounded-[80%_0_80%_0]'
          : type === 'ring'
            ? 'rounded-full border-[12px] bg-transparent'
            : 'rounded-full';

  const tone =
    type === 'lychee' || type === 'petal' || type === 'ring'
      ? type === 'ring'
        ? 'border-rose-200/70'
        : 'bg-[radial-gradient(circle_at_30%_28%,#fff7f8_0_18%,#fb7185_19%_54%,#be123c_100%)]'
      : type === 'leaf'
        ? 'bg-[linear-gradient(135deg,#7bcf55,#067239)]'
        : type === 'drop'
          ? 'bg-[radial-gradient(circle_at_35%_20%,#fff7d6,#f8c33b_48%,#f59e0b_100%)]'
          : 'bg-[linear-gradient(135deg,#ffe56b,#f59e0b_48%,#f97316)]';

  const size =
    type === 'ring'
      ? 'h-24 w-24'
      : type === 'slice'
        ? 'h-20 w-28'
        : type === 'leaf'
          ? 'h-16 w-9'
          : type === 'petal'
            ? 'h-12 w-7'
            : 'h-14 w-14';

  return <span className={`block ${size} ${shape} ${tone} shadow-[0_18px_40px_rgba(14,71,39,0.16)] ${className}`} />;
}

export function CinematicJourney() {
  const rootRef = useRef<HTMLElement>(null);
  const orchardRef = useRef<HTMLDivElement>(null);
  const morphRef = useRef<HTMLDivElement>(null);
  const crownRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  const mangoData = useMemo(() => mangoPieces, []);
  const lycheeData = useMemo(() => lycheePieces, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.journey-reveal',
        { y: 54, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      if (orchardRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: orchardRef.current,
            start: 'top top',
            end: '+=130%',
            scrub: 0.7,
            pin: true,
            anticipatePin: 1,
          },
        });

        tl.fromTo('.orchard-title', { y: 110, opacity: 0.2 }, { y: -70, opacity: 1, ease: 'none' }, 0)
          .fromTo('.orchard-pack', { rotateY: -8, y: 42, scale: 0.92 }, { rotateY: 10, y: -24, scale: 1.04, ease: 'none' }, 0)
          .fromTo('.orchard-piece', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, stagger: 0.03, ease: 'none' }, 0.08);

        mangoData.forEach((piece, index) => {
          tl.fromTo(
            `.orchard-piece-${index}`,
            { x: piece.x, y: piece.y, rotate: 0, scale: piece.s * 0.7 },
            { x: piece.endX, y: piece.endY, rotate: piece.r, scale: piece.s, ease: 'none' },
            0
          );
        });
      }

      if (morphRef.current) {
        gsap.timeline({
          scrollTrigger: {
            trigger: morphRef.current,
            start: 'top 72%',
            end: 'bottom 35%',
            scrub: 0.8,
          },
        })
          .fromTo('.morph-bg', { backgroundColor: '#fff7d6' }, { backgroundColor: '#ffe3ec', ease: 'none' }, 0)
          .fromTo('.morph-mango', { opacity: 1, xPercent: 0, rotateY: 0, scale: 1 }, { opacity: 0, xPercent: -20, rotateY: -18, scale: 0.86, ease: 'none' }, 0)
          .fromTo('.morph-lychee', { opacity: 0, xPercent: 22, rotateY: 18, scale: 0.82 }, { opacity: 1, xPercent: 0, rotateY: 0, scale: 1, ease: 'none' }, 0.12);
      }

      if (crownRef.current) {
        const crown = gsap.timeline({
          scrollTrigger: {
            trigger: crownRef.current,
            start: 'top top',
            end: '+=120%',
            scrub: 0.7,
            pin: true,
            anticipatePin: 1,
          },
        });

        crown.fromTo('.crown-headline', { y: 80, opacity: 0.25 }, { y: -42, opacity: 1, ease: 'none' }, 0)
          .fromTo('.crown-pack', { y: 54, scale: 0.9 }, { y: -12, scale: 1.04, ease: 'none' }, 0);

        lycheeData.forEach((piece, index) => {
          const rad = (piece.angle * Math.PI) / 180;
          crown.fromTo(
            `.crown-piece-${index}`,
            { opacity: 0, x: 0, y: 0, rotate: -40, scale: 0.5 },
            {
              opacity: 1,
              x: Math.cos(rad) * piece.radius,
              y: Math.sin(rad) * piece.radius,
              rotate: piece.angle + 140,
              scale: index % 2 ? 0.82 : 1,
              ease: 'none',
            },
            piece.delay
          );
        });
      }

      if (brandRef.current) {
        gsap.timeline({
          scrollTrigger: {
            trigger: brandRef.current,
            start: 'top 78%',
            end: 'bottom 40%',
            scrub: 0.6,
          },
        })
          .fromTo('.sip-word', { yPercent: 80, opacity: 0.2, scale: 0.92 }, { yPercent: 0, opacity: 1, scale: 1, stagger: 0.05, ease: 'none' }, 0)
          .fromTo('.sip-pack', { xPercent: -64, yPercent: 20, rotate: -9 }, { xPercent: 42, yPercent: -18, rotate: 7, ease: 'none' }, 0);
      }
    }, root);

    return () => ctx.revert();
  }, [mangoData, lycheeData]);

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-white text-[#082416]">
      <div className="relative isolate min-h-[92vh] overflow-hidden px-5 py-24 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_22%,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_18%_76%,rgba(7,88,47,0.12),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="journey-reveal text-xs font-black uppercase tracking-[0.34em] text-[#0b8043]">Moving Mood</p>
            <h2 className="journey-reveal mt-5 max-w-4xl font-['Space_Grotesk',sans-serif] text-[clamp(3rem,8vw,8.5rem)] font-black uppercase leading-[0.86] tracking-normal">
              Not a static drink.
              <span className="block text-[#f59e0b]">A moving mood.</span>
            </h2>
            <p className="journey-reveal mt-7 max-w-xl text-base font-semibold leading-8 text-[#385c45] sm:text-lg">
              PIO moves from mango sunshine to lychee sparkle with scroll-linked product moments, fruit depth, and clean white breathing space.
            </p>
          </div>

          <div className="journey-reveal relative flex min-h-[460px] items-center justify-center lg:col-span-5">
            <div className="absolute h-72 w-72 rounded-full bg-[conic-gradient(from_120deg,#f8c33b,#fb7185,#07582f,#f8c33b)] opacity-80 blur-[1px] animate-[floatSubtle_5s_ease-in-out_infinite]" />
            <div className="absolute h-96 w-96 rounded-full border border-emerald-900/10" />
            <img src="/images/pio-mango-lossless.webp" alt="PIO Mango carton" className="relative z-10 max-h-[430px] w-auto drop-shadow-[0_42px_70px_rgba(7,88,47,0.24)] [transform:perspective(900px)_rotateY(-9deg)]" />
          </div>
        </div>
      </div>

      <div ref={orchardRef} className="relative min-h-screen overflow-hidden bg-[#fff8db] px-5 py-16 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.88),transparent_30%),radial-gradient(circle_at_72%_58%,rgba(245,158,11,0.28),transparent_34%)]" />
        <div className="relative mx-auto grid h-[calc(100vh-8rem)] max-w-7xl items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#92400e]">Orchard Fall</p>
            <h2 className="orchard-title mt-4 font-['Space_Grotesk',sans-serif] text-[clamp(3.6rem,9vw,9rem)] font-black uppercase leading-[0.84] tracking-normal text-[#78350f]">
              Let the orchard fall.
            </h2>
          </div>
          <div className="relative flex min-h-[520px] items-center justify-center lg:col-span-7">
            {mangoData.map((piece, index) => (
              <FruitMark key={`${piece.label}-${index}`} type={piece.label} className={`orchard-piece orchard-piece-${index} absolute left-1/2 top-1/2`} />
            ))}
            <img src="/images/pio-mango-lossless.webp" alt="PIO Mango pack" className="orchard-pack relative z-10 max-h-[500px] w-auto drop-shadow-[0_44px_80px_rgba(120,53,15,0.25)] [transform-style:preserve-3d]" />
          </div>
        </div>
      </div>

      <div ref={morphRef} className="morph-bg relative overflow-hidden px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#9d174d]">Flavor Morph</p>
            <h2 className="mt-4 font-['Space_Grotesk',sans-serif] text-[clamp(3.2rem,7vw,7rem)] font-black uppercase leading-[0.88] tracking-normal text-[#831843]">
              Mango turns into lychee drama.
            </h2>
          </div>
          <div className="relative flex min-h-[500px] items-center justify-center lg:col-span-7">
            <span className="absolute h-[440px] w-[440px] rounded-full bg-white/50 blur-3xl" />
            <img src="/images/pio-mango-lossless.webp" alt="PIO Mango pack" className="morph-mango absolute max-h-[460px] w-auto drop-shadow-[0_40px_70px_rgba(120,53,15,0.18)]" />
            <img src="/images/pio-lychee-lossless.webp" alt="PIO Lychee pack" className="morph-lychee absolute max-h-[460px] w-auto drop-shadow-[0_40px_70px_rgba(157,23,77,0.2)]" />
          </div>
        </div>
      </div>

      <div ref={crownRef} className="relative min-h-screen overflow-hidden bg-[#fae5ec] px-5 py-16 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,rgba(255,255,255,0.68),transparent_30%),radial-gradient(circle_at_24%_72%,rgba(225,29,72,0.2),transparent_34%)]" />
        <div className="relative mx-auto grid h-[calc(100vh-8rem)] max-w-7xl items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#be123c]">Lychee Crown</p>
            <h2 className="crown-headline mt-4 font-['Space_Grotesk',sans-serif] text-[clamp(3.4rem,8vw,8rem)] font-black uppercase leading-[0.86] tracking-normal text-[#831843]">
              Make a juicy crown.
            </h2>
          </div>
          <div className="relative flex min-h-[520px] items-center justify-center lg:col-span-7">
            <div className="absolute h-80 w-80 rounded-full border border-rose-200/80" />
            {lycheeData.map((piece, index) => (
              <FruitMark key={`${piece.label}-${index}`} type={piece.label} className={`crown-piece-${index} absolute left-1/2 top-1/2`} />
            ))}
            <img src="/images/pio-lychee-lossless.webp" alt="PIO Lychee pack" className="crown-pack relative z-10 max-h-[500px] w-auto drop-shadow-[0_44px_80px_rgba(131,24,67,0.26)]" />
          </div>
        </div>
      </div>

      <div ref={brandRef} className="relative overflow-hidden bg-white px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="relative min-h-[62vh] overflow-hidden rounded-[28px] bg-[#f5fbf7] px-5 py-16 sm:px-10">
            <div className="overflow-hidden">
              <h2 className="sip-word font-['Space_Grotesk',sans-serif] text-[clamp(5rem,17vw,16rem)] font-black uppercase leading-[0.78] tracking-normal text-[#082416]">SIP</h2>
            </div>
            <div className="overflow-hidden">
              <h2 className="sip-word font-['Space_Grotesk',sans-serif] text-[clamp(5rem,17vw,16rem)] font-black uppercase leading-[0.78] tracking-normal text-[#07582f]">OHH!</h2>
            </div>
            <img src="/images/pio-mango-lychee-cartons.png" alt="PIO Mango and Lychee cartons" className="sip-pack absolute bottom-8 right-[8%] max-h-[66%] w-auto drop-shadow-[0_40px_70px_rgba(7,88,47,0.22)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
