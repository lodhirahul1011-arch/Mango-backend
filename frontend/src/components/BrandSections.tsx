import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Sparkles, MapPin, School, Users, Plane, Check } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ProductsShowcase.css';

gsap.registerPlugin(ScrollTrigger);

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const PRODUCT_ASSETS = {
  mango: '/assets/products/pio-mango-lossless.webp',
  lychee: '/assets/products/pio-lychee-lossless.webp',
};

const FEATURE_BADGES = ['160ml Pack', 'Rs 10', 'Made in Assam'];

function FeatureBadges() {
  return (
    <div className="products-badges mt-6 flex flex-wrap gap-2.5">
      {FEATURE_BADGES.map((badge) => (
        <span
          key={badge}
          className="rounded-full border border-[#064F32]/10 bg-white/65 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#064F32] shadow-[0_12px_28px_rgba(6,79,50,0.08)] backdrop-blur-md"
        >
          {badge}
        </span>
      ))}
    </div>
  );
}

function AnimatedCTA() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const moveMagnet = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    gsap.to(button, { x: x * 0.12, y: y * 0.18, duration: 0.35, ease: 'power3.out' });
  };

  const resetMagnet = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, { x: 0, y: 0, duration: 0.45, ease: 'elastic.out(1, 0.45)' });
    }
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={moveMagnet}
      onMouseLeave={resetMagnet}
      onClick={() => go('partner')}
      className="products-cta group mt-8 inline-flex min-h-[52px] items-center gap-3 rounded-full bg-[#064F32] px-7 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_22px_48px_rgba(6,79,50,0.22)] transition-colors duration-300 hover:bg-[#043b25] focus:outline-none focus:ring-2 focus:ring-[#064F32]/35"
    >
      <span>Partner With PIO</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14 transition-transform duration-300 group-hover:translate-x-1">
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

function FlavourInfo({
  tone,
  title,
  copy,
  className = '',
}: {
  tone: 'mango' | 'lychee';
  title: string;
  copy: string;
  className?: string;
}) {
  const isMango = tone === 'mango';
  const containerStyle = isMango
    ? 'bg-white/92 border-amber-300/80 shadow-[0_16px_36px_rgba(180,83,9,0.14)] text-slate-800'
    : 'bg-white/94 border-rose-300/85 shadow-[0_16px_36px_rgba(225,29,72,0.15)] text-slate-800';

  const badgeStyle = isMango
    ? 'text-[#b45309] bg-amber-50 border-amber-200'
    : 'text-[#be123c] bg-rose-50 border-rose-200';

  return (
    <div className={`flavour-info flavour-info-${tone} rounded-2xl border p-3.5 ${containerStyle} ${className}`}>
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] ${badgeStyle}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isMango ? 'bg-amber-500' : 'bg-rose-500'}`} />
        <span>{title}</span>
      </div>
      <p className="mt-2 text-xs font-semibold leading-relaxed text-[#1e293b]">
        {copy}
      </p>
    </div>
  );
}

function ProductVisual({
  src,
  alt,
  tone,
  className = '',
}: {
  src: string;
  alt: string;
  tone: 'mango' | 'lychee';
  className?: string;
}) {
  return (
    <div className={`product-visual absolute ${className}`}>
      <div className="absolute inset-x-[8%] bottom-2 h-14 rounded-full bg-[#062816]/22 blur-2xl" />
      <div className={`product-float product-float-${tone}`}>
      <img
        src={src}
        alt={alt}
        className={`relative z-10 h-full w-full object-contain ${tone === 'mango' ? 'drop-shadow-[0_34px_46px_rgba(149,91,0,0.22)]' : 'drop-shadow-[0_34px_46px_rgba(128,20,54,0.24)]'}`}
        draggable={false}
      />
      </div>
    </div>
  );
}

export function Flavours() {
  return <ProductsShowcase />;
}

function ProductsShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const visual = visualRef.current;
    if (!section || !visual) return;

    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion.current) {
        gsap.set('.products-heading-line, .products-copy, .products-badges, .products-cta, .product-visual, .flavour-info', {
          clearProps: 'all',
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          rotate: 0,
        });
        return;
      }

      const enter = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          once: true,
        },
      });

      enter
        .from('.products-heading-line', { yPercent: 112, opacity: 0, duration: 0.9, stagger: 0.11, ease: 'power4.out' })
        .from('.products-copy', { y: 22, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.45')
        .from('.products-badges span', { y: 18, opacity: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out' }, '-=0.35')
        .from('.product-mango', { scale: 0.96, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.55')
        .from('.product-lychee', { scale: 0.96, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.55')
        .from('.flavour-info', { y: 24, scale: 0.95, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' }, '-=0.42')
        .from('.products-cta', { y: 20, opacity: 0, duration: 0.55, ease: 'power3.out' }, '-=0.38');

    }, section);

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      gsap.set(visual.querySelectorAll('.product-visual'), {
        rotateY: currentX * 5,
        rotateX: currentY * -4,
        transformPerspective: 900,
      });
      if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (prefersReducedMotion.current || window.innerWidth < 900) return;
      const rect = visual.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      if (!prefersReducedMotion.current && !raf) raf = requestAnimationFrame(tick);
    };

    if (!prefersReducedMotion.current) {
      visual.addEventListener('pointermove', onMove);
      visual.addEventListener('pointerleave', onLeave);
    }

    return () => {
      visual.removeEventListener('pointermove', onMove);
      visual.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="flavours"
      data-local-motion="true"
      className="products-showcase relative isolate overflow-hidden bg-[#fbfaf2] py-0 text-[#064F32] lg:min-h-[100svh] lg:bg-[#FAFCF7]"
    >
      <div className="products-bg-shift" aria-hidden="true" />

      <div className="products-mobile relative min-h-[980px] overflow-hidden px-7 pb-10 pt-16 lg:hidden">
        <img
          src="/images/products-orchard-v2.webp" loading="lazy" decoding="async" width="1672" height="941"
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,247,0.14)_0%,rgba(255,255,247,0.02)_48%,rgba(255,255,247,0.70)_100%)]" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.34em] text-[#064F32]">
            <span>The Goodness Inside</span>
            <span className="h-0.5 w-16 bg-[#a3d7b4]" />
          </div>

          <h2 className="mt-7 font-['Space_Grotesk',sans-serif] text-[clamp(4.25rem,18vw,6rem)] font-black uppercase leading-[0.82] tracking-tight text-[#064F32]">
            Real Fruit,<br />
            Ready To<br />
            <span className="text-[#0F9A48]">Shine.</span>
          </h2>

          <p className="mt-5 text-[1.55rem] font-medium leading-tight text-[#073D2C]">
            Two fruity favourites. One refreshing feeling.
          </p>
        </div>

        <div className="relative z-10 mt-12 h-[440px]">
          <div className="pointer-events-none absolute inset-x-[4%] bottom-6 h-16 rounded-full bg-[#062816]/18 blur-2xl" />
          <img
            src={PRODUCT_ASSETS.mango} loading="lazy" decoding="async"
            alt="PIO Mango pack"
            draggable={false}
            className="mobile-pack mobile-pack-mango absolute bottom-9 left-[5%] z-10 h-[390px] w-auto -rotate-[5deg] object-contain drop-shadow-[0_30px_38px_rgba(91,67,11,0.22)]"
          />
          <img
            src={PRODUCT_ASSETS.lychee} loading="lazy" decoding="async"
            alt="PIO Lychee pack"
            draggable={false}
            className="mobile-pack mobile-pack-lychee absolute bottom-5 right-[1%] z-20 h-[360px] w-auto rotate-[5deg] object-contain drop-shadow-[0_30px_38px_rgba(95,20,44,0.20)]"
          />
        </div>

        <div className="relative z-10 mt-2 grid grid-cols-2 items-center gap-4 text-center">
          <div>
            <div className="text-xl font-black uppercase tracking-wide text-[#08934a]">
              01 / <span className="text-[#073D2C]">Mango</span>
            </div>
            <div className="mx-auto mt-2 h-1 w-24 bg-[#f5b51f]" />
          </div>
          <div>
            <div className="text-xl font-black uppercase tracking-wide text-[#08934a]">
              02 / <span className="text-[#073D2C]">Lychee</span>
            </div>
            <div className="mx-auto mt-2 h-1 w-24 bg-[#f48aa5]" />
          </div>
        </div>

        <div className="relative z-10 mt-12 grid grid-cols-2 gap-4 text-[#073D2C]">
          <div className="flex items-center justify-center gap-3 border-r border-[#073D2C]/22">
            <Leaf className="h-9 w-9" />
            <span className="text-sm font-black uppercase leading-tight tracking-[0.24em]">Real<br />Fruit</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <MapPin className="h-9 w-9" />
            <span className="text-sm font-black uppercase leading-tight tracking-[0.24em]">Made In<br />Assam</span>
          </div>
        </div>

        <button
          onClick={() => go('mango-story')}
          className="relative z-10 mt-11 inline-flex min-h-[66px] w-full items-center justify-center gap-4 rounded-full bg-[#064F32] px-8 text-2xl font-semibold text-white shadow-[0_24px_44px_rgba(6,79,50,0.24)] active:scale-[0.98]"
        >
          <span>Explore flavours</span>
          <ArrowRight className="h-8 w-8" />
        </button>
      </div>

      <div className="products-desktop relative mx-auto hidden max-w-7xl items-center gap-4 px-5 sm:gap-12 sm:px-8 lg:grid lg:min-h-[100svh] lg:grid-cols-[0.88fr_1.12fr] lg:gap-8 lg:py-24">
        <div className="relative z-20 max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#064F32]/10 bg-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#064F32] shadow-[0_16px_38px_rgba(6,79,50,0.08)] backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Products
          </div>

          <h2 className="overflow-hidden font-['Space_Grotesk',sans-serif] text-[clamp(3.2rem,7vw,6.35rem)] font-black uppercase leading-[0.86] tracking-tight text-[#064F32]">
            <span className="products-heading-line block">Real fruit,</span>
            <span className="products-heading-line block">ready to</span>
            <span className="products-heading-line block text-[#0F7A43]">shine.</span>
          </h2>

          <p className="products-copy mt-6 max-w-md text-base font-semibold leading-relaxed text-[#315b47] sm:text-lg">
            Mango brings golden tropical depth. Lychee adds a bright floral chill. Both arrive in premium 160ml cartons made for everyday refreshment.
          </p>

          <FeatureBadges />
          <AnimatedCTA />
        </div>

        <div ref={visualRef} className="products-stage relative z-10 -mt-2 min-h-[330px] overflow-hidden rounded-[28px] sm:mt-0 sm:min-h-[620px] sm:overflow-visible sm:rounded-none lg:min-h-[760px]">
          <div className="products-sip-seal" aria-hidden="true"><Sparkles size={22} /><span>GOOD MOOD</span><strong>on the go.</strong></div>

          <div className="depth-near pointer-events-none absolute inset-x-[12%] bottom-[18%] h-20 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(7,61,44,0.22),transparent_68%)] blur-2xl sm:bottom-[20%] sm:h-28" />


          <ProductVisual
            src={PRODUCT_ASSETS.mango}
            alt="PIO Mango original carton"
            tone="mango"
            className="product-mango left-[10%] top-[0%] h-[300px] w-[44%] max-w-[210px] -rotate-[5deg] sm:left-[18%] sm:top-[12%] sm:h-[520px] sm:max-w-[320px] lg:left-[18%] lg:top-[12%] lg:h-[590px] xl:left-[12%] xl:h-[610px]"
          />
          <ProductVisual
            src={PRODUCT_ASSETS.lychee}
            alt="PIO Lychee original carton"
            tone="lychee"
            className="product-lychee right-[8%] top-[8%] h-[285px] w-[44%] max-w-[205px] rotate-[5deg] sm:right-[16%] sm:top-[22%] sm:h-[500px] sm:max-w-[310px] lg:right-[13%] lg:top-[22%] lg:h-[565px] xl:right-[8%] xl:h-[590px]"
          />

          <div className="products-flavour-notes">
          <FlavourInfo
            tone="mango"
            title="Mango"
            copy="Golden tropical sip with a smooth fruit finish."
          />
          <FlavourInfo
            tone="lychee"
            title="Lychee"
            copy="Fresh floral sweetness with a chilled feel."
          />
          </div>
        </div>

        <div className="-mt-2 grid gap-3 sm:-mt-10 sm:grid-cols-2 lg:hidden">
          <div className="rounded-2xl border border-amber-300/70 bg-white/82 p-4 shadow-[0_14px_32px_rgba(180,83,9,0.11)] backdrop-blur-md">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#b45309]">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Mango
            </div>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-[#1e293b]">
              Golden tropical sip with a smooth fruit finish.
            </p>
          </div>
          <div className="rounded-2xl border border-rose-300/75 bg-white/86 p-4 shadow-[0_14px_32px_rgba(225,29,72,0.12)] backdrop-blur-md">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#be123c]">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Lychee
            </div>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-[#1e293b]">
              Fresh floral sweetness with a chilled feel.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------
   2. WHY PIO? SECTION — Re-exported from dedicated 3D component
---------------------------------------------------- */
export { WhyPIO } from './WhyPIO';



// Re-export dedicated cinematic FlavorStories component
export { FlavorStories } from './FlavorStories';


/* ----------------------------------------------------
   4. BIG REFRESHMENT JUST ₹10 BANNER
---------------------------------------------------- */
export function PriceBanner() {
  return (
    <section id="price" className="relative overflow-hidden bg-[#f4faf5] py-20 lg:py-24 border-y border-emerald-900/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          
          <motion.div {...reveal} className="lg:col-span-6 space-y-5">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#07582f] bg-[#e3f4e8] px-3.5 py-1.5 rounded-full">
              Value That Delights
            </span>
            <h2 className="text-4xl sm:text-6xl font-black text-[#083b20] tracking-tight leading-[0.95]">
              Big Refreshment<br />
              <span className="text-[#eab308]">JUST ₹10</span>
            </h2>
            <p className="text-base sm:text-lg text-[#325340] leading-relaxed font-medium">
              We believe pure, high quality fruit refreshment should be within everyone’s reach. No compromises on multilayer aseptic carton packaging, food safety, or genuine fruit taste.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 border border-emerald-900/10 text-xs font-extrabold text-emerald-950 shadow-2xs">
                <Check className="w-4 h-4 text-[#0b8043]" />
                160ml Convenient Tetra Pack
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 border border-emerald-900/10 text-xs font-extrabold text-emerald-950 shadow-2xs">
                <Check className="w-4 h-4 text-[#0b8043]" />
                Includes Straw Attached
              </div>
            </div>
          </motion.div>

          <motion.div {...reveal} className="lg:col-span-6 overflow-hidden rounded-[32px] border border-emerald-900/10 bg-white p-3 shadow-xl">
            <img 
              src="/images/price-board.jpg" 
              alt="Big Refreshment Just ₹10 wooden sign board and store" 
              className="w-full h-auto rounded-[24px] object-cover"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------
   5. WHAT'S INSIDE? (INGREDIENTS) — Re-exported from dedicated 3D component
---------------------------------------------------- */
export { Ingredients } from './Ingredients';


/* ----------------------------------------------------
   6. SIPOHH! MOMENTS
---------------------------------------------------- */
const momentsList = [
  {
    icon: School,
    title: 'School & Recess',
    text: 'Fits right in the school bag. The ultimate tasty recess break energy.'
  },
  {
    icon: Users,
    title: 'Friends & Hangouts',
    text: 'A ₹10 treat to share with the entire crew without breaking the bank.'
  },
  {
    icon: Plane,
    title: 'Travel & Commute',
    text: 'Spill-free, straw-equipped carton that is ready for on-the-go refreshment.'
  },
  {
    icon: Sparkles,
    title: 'Afternoon Pick-Me-Up',
    text: 'Chill and enjoy a cool fruit burst when the afternoon sun hits.'
  },
];

export function Moments() {
  return (
    <section id="moments" className="py-20 lg:py-28 bg-[#f5fbf7] border-y border-emerald-900/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          
          <motion.div {...reveal} className="lg:col-span-5 space-y-6">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#0b8043] bg-[#eef8f1] px-4 py-1.5 rounded-full">
              SipOhh! Moments
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#083b20] tracking-tight leading-tight">
              For school, friends, travel or anytime you need a refresh.
            </h2>
            <p className="text-base text-[#385b45] leading-relaxed font-medium">
              Whether you are rushing to class, unwinding after sports, or heading on a road trip, PIO brings that instant fruity spark.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {momentsList.map((m) => (
                <div key={m.title} className="rounded-2xl bg-white p-4 border border-emerald-900/10 shadow-2xs">
                  <m.icon className="h-5 w-5 text-[#07582f]" />
                  <h4 className="mt-2 text-sm font-black text-[#083b20]">{m.title}</h4>
                  <p className="mt-1 text-xs text-slate-500 leading-snug">{m.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...reveal} className="lg:col-span-7 overflow-hidden rounded-[32px] border border-emerald-900/10 shadow-xl bg-white p-3">
            <img 
              src="/images/moments-card.jpg" 
              alt="PIO SipOhh Moments friends enjoying drinks" 
              className="w-full h-auto rounded-[24px] object-cover"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------
   7. WHERE TO BUY SECTION — Re-exported from dedicated 3D component
---------------------------------------------------- */
