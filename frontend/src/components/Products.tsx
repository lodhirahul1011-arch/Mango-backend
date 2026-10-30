import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const facts = {
  mango: ['160 mL', 'Rs 10', '9 months shelf life', 'No added preservatives'],
  lychee: ['160 mL', 'Rs 10', '6 months shelf life', 'Aseptically packed'],
};

function ProductStill({
  src,
  alt,
  align = 'right',
}: {
  src: string;
  alt: string;
  align?: 'left' | 'right';
}) {
  return (
    <div className={`product-still pointer-depth relative ${align === 'left' ? 'lg:-ml-10' : 'lg:-mr-10'}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="relative aspect-[16/10] w-full border border-white/15 object-cover shadow-[0_32px_100px_rgba(0,0,0,0.32)]"
      />
    </div>
  );
}

function LiquidObject({ tone, className = '' }: { tone: 'mango' | 'lychee'; className?: string }) {
  const colors = tone === 'mango'
    ? 'from-mango-200/70 via-mango-500/25 to-white/10 shadow-mango-400/20'
    : 'from-lychee-200/70 via-lychee-500/25 to-white/10 shadow-lychee-400/20';

  return (
    <div className={`liquid-object pointer-events-none absolute ${className}`}>
      <div className={`h-full w-full rounded-[42%_58%_51%_49%/46%_42%_58%_54%] border border-white/20 bg-gradient-to-br ${colors} shadow-2xl backdrop-blur-md`} />
      <span className="absolute left-1/4 top-1/4 h-1/4 w-1/5 rounded-full bg-white/60 blur-sm" />
    </div>
  );
}

export function Products() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const objects = gsap.utils.toArray<HTMLElement>('.liquid-object');
      objects.forEach((el, i) => {
        gsap.to(el, {
          y: i % 2 ? -70 : 70,
          x: i % 3 ? 30 : -35,
          rotate: i % 2 ? 12 : -10,
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>('.product-still').forEach((still, i) => {
        gsap.fromTo(still, { y: i % 2 ? 90 : 70, scale: 0.94 }, {
          y: i % 2 ? -40 : -55,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: still,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.7,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>('.chapter-title').forEach((title) => {
        gsap.fromTo(title, { clipPath: 'inset(0 0 100% 0)' }, {
          clipPath: 'inset(0 0 0% 0)',
          scrollTrigger: { trigger: title, start: 'top 78%', end: 'top 42%', scrub: 0.8 },
        });
      });
    });

    const handlePointer = (event: PointerEvent) => {
      if (window.innerWidth < 900) return;
      const x = (event.clientX / window.innerWidth - 0.5) * 24;
      const y = (event.clientY / window.innerHeight - 0.5) * 18;
      gsap.to('.pointer-depth', { x, y, duration: 0.7, ease: 'power3.out' });
    };

    window.addEventListener('pointermove', handlePointer);
    return () => {
      window.removeEventListener('pointermove', handlePointer);
      mm.revert();
    };
  }, []);

  return (
    <section ref={ref} id="products" className="relative overflow-hidden bg-[#050505]">
      <article className="relative min-h-screen overflow-hidden px-5 py-28 sm:px-8 lg:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_48%,rgba(249,130,7,0.32),transparent_31%),linear-gradient(180deg,#050505,#100905_52%,#050505)]" />
        <LiquidObject tone="mango" className="pointer-depth left-[6%] top-[18%] h-24 w-24 sm:h-36 sm:w-36" />
        <LiquidObject tone="mango" className="pointer-depth right-[8%] bottom-[16%] h-32 w-32 sm:h-52 sm:w-52" />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.42em] text-mango-300">Pio Mango</p>
            <h2 className="chapter-title mt-5 text-[22vw] font-black uppercase leading-[0.78] tracking-[-0.08em] text-white/95 lg:text-[13vw]">
              Mango
            </h2>
            <p className="mt-8 max-w-2xl text-4xl font-black uppercase leading-none tracking-[-0.04em] text-mango-200 sm:text-6xl">
              Sunshine in every sip.
            </p>
            <div className="glass-panel relative mt-10 p-6 sm:p-8">
              <p className="text-lg leading-relaxed text-white/72">
                Juicy, fruity and refreshingly smooth, Pio Mango brings you the delicious taste of mango in a convenient 160 mL pack, perfect for a quick, refreshing sip anytime, anywhere.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {facts.mango.map((fact) => (
                  <span key={fact} className="border border-mango-300/20 bg-mango-300/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-mango-100">
                    {fact}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <ProductStill src="/sequence-new/frame_0000.jpg?v=2" alt="Pio Mango and Lychee packs with mango splash" />
        </div>
      </article>

      <article className="relative min-h-screen overflow-hidden px-5 py-28 sm:px-8 lg:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_48%,rgba(227,74,111,0.34),transparent_33%),linear-gradient(180deg,#050505,#15050d_48%,#050505)]" />
        <LiquidObject tone="lychee" className="pointer-depth left-[12%] bottom-[15%] h-28 w-28 sm:h-44 sm:w-44" />
        <LiquidObject tone="lychee" className="pointer-depth right-[9%] top-[18%] h-24 w-24 sm:h-40 sm:w-40" />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <ProductStill src="/sequence-new/frame_0239.jpg?v=2" alt="Pio Mango and Lychee packs with lychee splash" align="left" />
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-[0.42em] text-lychee-300">Pio Lychee</p>
            <h2 className="chapter-title mt-5 text-[21vw] font-black uppercase leading-[0.78] tracking-[-0.08em] text-white/95 lg:text-[12vw]">
              Lychee
            </h2>
            <p className="ml-auto mt-8 max-w-2xl text-4xl font-black uppercase leading-none tracking-[-0.04em] text-lychee-100 sm:text-6xl">
              A little wild.
            </p>
            <div className="glass-panel mt-10 p-6 text-left sm:p-8">
              <p className="text-lg leading-relaxed text-white/72">
                Pio Lychee brings you the delicate sweetness and fragrant fruitiness of lychee in a refreshing 160 mL pack, perfect for a quick fruity refreshment, anytime, anywhere.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {facts.lychee.map((fact) => (
                  <span key={fact} className="border border-lychee-300/20 bg-lychee-300/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-lychee-100">
                    {fact}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>

      <article className="relative min-h-[92vh] overflow-hidden px-5 py-28 text-center sm:px-8 lg:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_48%,rgba(249,130,7,0.25),transparent_27%),radial-gradient(circle_at_70%_48%,rgba(227,74,111,0.25),transparent_27%),linear-gradient(180deg,#050505,#070707)]" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center">
          <p className="text-xs font-black uppercase tracking-[0.48em] text-white/45">Mango x Lychee</p>
          <h2 className="mt-7 text-[16vw] font-black uppercase leading-[0.78] tracking-[-0.075em] text-white sm:text-[12vw] lg:text-[8vw]">
            Two worlds.
            <br />
            One Pio.
          </h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/62 sm:text-lg">
            A premium ready-to-drink fruit beverage crafted with generations of food manufacturing expertise. Every sip carries a legacy from Mangaldai, Assam.
          </p>
          <button
            onClick={() => document.getElementById('partner')?.scrollIntoView({ behavior: 'smooth' })}
            className="magnetic-btn mt-10 border border-white/25 bg-white px-8 py-4 text-xs font-black uppercase tracking-[0.22em] text-black transition-colors hover:bg-lychee-200"
          >
            Partner With Us
          </button>
        </div>
      </article>
    </section>
  );
}
