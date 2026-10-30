import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion, useSpring } from 'framer-motion';
import {
  ArrowRight,
  BadgeIndianRupee,
  CheckCircle2,
  Droplets,
  Factory,
  Layers,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fizzAudio } from '@/utils/audio';

gsap.registerPlugin(ScrollTrigger);

type FlavorId = 'mango' | 'lychee';

const FLAVORS = {
  mango: {
    id: 'mango',
    shortName: 'Mango',
    name: 'Alphonso Mango',
    line: 'Golden mango refreshment sealed for the everyday ₹10 sip.',
    image: '/images/pio-mango-lossless.webp',
    accent: '#F5A623',
    deep: '#8a4d00',
    glow: 'rgba(245,166,35,0.35)',
    gradient: 'from-[#fff7df] via-[#fef3c7] to-[#eff9ef]',
    notes: ['Golden fruit profile', '9 months shelf life', 'Best served chilled'],
  },
  lychee: {
    id: 'lychee',
    shortName: 'Lychee',
    name: 'Royal Lychee',
    line: 'Floral lychee chill packed cleanly for a light ₹10 break.',
    image: '/images/pio-lychee-lossless.webp',
    accent: '#EB5574',
    deep: '#9f1239',
    glow: 'rgba(235,85,116,0.32)',
    gradient: 'from-[#fff4f7] via-[#ffe4eb] to-[#eff9ef]',
    notes: ['Floral chilled profile', '6 months shelf life', 'Aseptic protection'],
  },
} as const;

const PACK_LAYERS = [
  {
    layer: 1,
    title: 'Outer PE Shield',
    copy: 'Repels surface moisture and keeps the carton travel-ready.',
    material: 'Polyethylene',
    icon: ShieldCheck,
  },
  {
    layer: 2,
    title: 'Print Surface',
    copy: 'Carries the PIO identity with a clean, scuff-resistant finish.',
    material: 'Ink layer',
    icon: Sparkles,
  },
  {
    layer: 3,
    title: 'Paperboard Body',
    copy: 'Gives the 160 ml pack its grip, structure and shelf presence.',
    material: 'Paperboard',
    icon: PackageCheck,
  },
  {
    layer: 4,
    title: 'Bonding Layer',
    copy: 'Locks the structure together so the pack behaves as one unit.',
    material: 'Laminate',
    icon: Layers,
  },
  {
    layer: 5,
    title: 'Aluminum Barrier',
    copy: 'Helps block light and oxygen before they can dull the taste.',
    material: 'Micro foil',
    icon: Zap,
  },
  {
    layer: 6,
    title: 'Food Contact Seal',
    copy: 'A sterile inner layer protects the drink until the straw goes in.',
    material: 'Aseptic liner',
    icon: Droplets,
  },
] as const;

const QUALITY_STEPS = [
  'Aseptic processing',
  'Six-layer carton shield',
  'Straw-ready hygienic seal',
  'Compact 160 ml pack',
];

function FlavorSwitch({
  flavor,
  onChange,
}: {
  flavor: FlavorId;
  onChange: (flavor: FlavorId) => void;
}) {
  return (
    <div className="tetra-flavor-switch inline-grid w-full max-w-sm grid-cols-2 rounded-full border border-[#073D2C]/10 bg-white/80 p-1.5 shadow-[0_20px_45px_rgba(7,61,44,0.10)] backdrop-blur-xl">
      {(Object.keys(FLAVORS) as FlavorId[]).map((id) => {
        const selected = flavor === id;
        const item = FLAVORS[id];

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`relative min-h-[46px] rounded-full px-4 text-xs font-black uppercase tracking-[0.16em] transition-all duration-300 ${
              selected ? 'text-white shadow-[0_14px_30px_rgba(7,61,44,0.16)]' : 'text-[#073D2C] hover:bg-[#eef8f1]'
            }`}
            style={selected ? { backgroundColor: item.accent } : undefined}
          >
            {item.shortName}
          </button>
        );
      })}
    </div>
  );
}

function LayerStack({
  activeLayer,
  setActiveLayer,
  accent,
}: {
  activeLayer: number;
  setActiveLayer: (layer: number) => void;
  accent: string;
}) {
  return (
    <div className="tetra-layer-explorer relative min-h-[390px] rounded-[28px] border border-white/70 bg-white/55 p-5 shadow-[0_28px_70px_rgba(7,61,44,0.12)] backdrop-blur-2xl sm:min-h-[470px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#167A4A]">Interactive explorer</div>
          <h3 className="mt-2 text-2xl font-black text-[#073D2C]">6 protective layers</h3>
        </div>
        <div className="rounded-full border border-[#073D2C]/10 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#073D2C]">
          {activeLayer}/6
        </div>
      </div>

      <div className="relative mt-7 h-[245px] sm:h-[310px]">
        <div className="absolute inset-x-6 bottom-1 h-8 rounded-full bg-[#073D2C]/18 blur-xl" />
        {PACK_LAYERS.map((layer, index) => {
          const Icon = layer.icon;
          const selected = layer.layer === activeLayer;
          const y = index * 28;

          return (
            <button
              key={layer.layer}
              type="button"
              onClick={() => {
                setActiveLayer(layer.layer);
                fizzAudio.playFizz();
              }}
              className={`tetra-layer-slice absolute left-1/2 flex h-[74px] w-[82%] -translate-x-1/2 items-center gap-4 rounded-[18px] border px-4 text-left transition-all duration-500 sm:h-[86px] ${
                selected
                  ? 'z-20 border-[#073D2C]/30 bg-white shadow-[0_22px_45px_rgba(7,61,44,0.14)]'
                  : 'z-10 border-white/70 bg-white/48 hover:bg-white/78'
              }`}
              style={{
                top: y,
                transform: `translateX(-50%) translateY(${selected ? -8 : 0}px) rotateX(56deg) rotateZ(-2deg)`,
                transformOrigin: 'center',
                boxShadow: selected ? `0 22px 46px ${accent}33` : undefined,
              }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white"
                style={{ backgroundColor: selected ? accent : '#167A4A' }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#6a776e]">
                  Layer {layer.layer} / {layer.material}
                </span>
                <span className="mt-1 block text-sm font-black leading-tight text-[#073D2C] sm:text-base">{layer.title}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProductStage({
  flavor,
  activeLayer,
  mouseX,
  mouseY,
  strawPopped,
  splashes,
  onMove,
  onLeave,
}: {
  flavor: (typeof FLAVORS)[FlavorId];
  activeLayer: number;
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
  strawPopped: boolean;
  splashes: { id: number; x: number; y: number; color: string }[];
  onMove: (event: MouseEvent<HTMLDivElement>) => void;
  onLeave: () => void;
}) {
  const active = PACK_LAYERS[activeLayer - 1];

  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tetra-product-stage relative min-h-[620px] overflow-hidden rounded-[36px] border border-white/70 bg-gradient-to-br ${flavor.gradient} px-5 py-7 shadow-[0_34px_90px_rgba(7,61,44,0.15)] sm:min-h-[720px] sm:px-8 lg:min-h-[calc(100svh-8rem)]`}
      style={{ perspective: 1200 }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.82),rgba(255,255,255,0.28)_48%,rgba(255,255,255,0.70))]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),transparent)]" />
      <div className="absolute inset-x-10 bottom-12 h-20 rounded-[100%] bg-[#073D2C]/16 blur-2xl" />
      <div className="absolute left-5 top-5 rounded-full border border-white/80 bg-white/72 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#073D2C] shadow-[0_18px_36px_rgba(7,61,44,0.10)] backdrop-blur-xl">
        ₹10 Tetra Pak
      </div>
      <div className="absolute right-5 top-5 rounded-full border border-white/80 bg-white/72 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#073D2C] shadow-[0_18px_36px_rgba(7,61,44,0.10)] backdrop-blur-xl">
        160 ml
      </div>

      <div className="relative z-10 flex h-full min-h-[560px] flex-col items-center justify-center sm:min-h-[650px] lg:min-h-[calc(100svh-12rem)]">
        <div className="tetra-stage-copy absolute bottom-6 left-5 right-5 z-20 rounded-[24px] border border-white/75 bg-white/72 p-5 shadow-[0_18px_48px_rgba(7,61,44,0.12)] backdrop-blur-xl sm:left-8 sm:right-auto sm:max-w-[360px]">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: flavor.deep }}>
            <active.icon className="h-4 w-4" />
            Active layer {active.layer}
          </div>
          <h3 className="mt-2 text-2xl font-black text-[#073D2C]">{active.title}</h3>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-[#466658]">{active.copy}</p>
        </div>

        <div className="tetra-stage-lines pointer-events-none absolute inset-10 rounded-[32px] border border-[#073D2C]/10 [background-image:linear-gradient(rgba(7,61,44,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(7,61,44,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="tetra-pack-motion relative z-10">
          <motion.div
          style={{
            rotateX: mouseY,
            rotateY: mouseX,
            transformStyle: 'preserve-3d',
          }}
          className="relative"
          >
          <motion.div
            initial={false}
            animate={{
              y: strawPopped ? -30 : 8,
              opacity: strawPopped ? 1 : 0.56,
              rotate: strawPopped ? -12 : -5,
              scale: strawPopped ? 1.05 : 0.92,
            }}
            transition={{ type: 'spring', stiffness: 340, damping: 18 }}
            className="absolute left-1/2 top-4 z-30 -translate-x-1/2"
          >
            <div className="h-20 w-3 rounded-full border border-white/70 bg-gradient-to-r from-red-400 via-white to-red-400 shadow-[0_12px_24px_rgba(7,61,44,0.16)]" />
            <div className="-mt-1 h-2.5 w-4 rounded-full bg-red-300 shadow-sm" />
          </motion.div>

          {splashes.map((splash) => (
            <motion.span
              key={splash.id}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: 0, scale: [0, 1.4, 0.8], x: splash.x, y: splash.y }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute left-1/2 top-16 z-40 h-3.5 w-3.5 rounded-full shadow-lg"
              style={{ backgroundColor: splash.color }}
            />
          ))}

          <AnimatePresence mode="wait">
            <motion.div
              key={flavor.id}
              initial={{ opacity: 0, y: 42, scale: 0.92, rotateY: -18 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, y: -26, scale: 0.96, rotateY: 18 }}
              transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div
                className="absolute left-1/2 top-1/2 h-[460px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-[42%] blur-3xl"
                style={{ backgroundColor: flavor.glow }}
              />
              <img
                src={flavor.image}
                alt={`PIO ${flavor.name} 160 ml carton`}
                draggable={false}
                className="relative z-10 h-[390px] w-auto select-none object-contain drop-shadow-[0_44px_58px_rgba(7,61,44,0.28)] sm:h-[510px] lg:h-[560px]"
              />
            </motion.div>
          </AnimatePresence>
          </motion.div>
        </div>

        <div className="tetra-floor absolute bottom-24 h-6 w-[58%] rounded-full bg-[#073D2C]/18 blur-xl" />
      </div>
    </div>
  );
}

export function TetraExperience() {
  const [flavor, setFlavor] = useState<FlavorId>('mango');
  const [activeLayer, setActiveLayer] = useState(1);
  const [strawPopped, setStrawPopped] = useState(false);
  const [sipCount, setSipCount] = useState(0);
  const [splashes, setSplashes] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useSpring(0, { stiffness: 160, damping: 22 });
  const mouseY = useSpring(0, { stiffness: 160, damping: 22 });
  const current = FLAVORS[flavor];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(
          '.tetra-kicker, .tetra-headline-word, .tetra-copy, .tetra-flavor-switch, .tetra-product-stage, .tetra-layer-explorer, .tetra-proof-item',
          { opacity: 1, clearProps: 'transform' }
        );
        return;
      }

      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          once: true,
        },
      });

      intro
        .from('.tetra-kicker', { y: 18, opacity: 0, duration: 0.55, ease: 'power3.out' })
        .from('.tetra-headline-word', { yPercent: 112, opacity: 0, duration: 0.9, stagger: 0.09, ease: 'power4.out' }, '-=0.25')
        .from('.tetra-copy', { y: 20, opacity: 0, duration: 0.62, ease: 'power3.out' }, '-=0.35')
        .from('.tetra-flavor-switch', { y: 18, opacity: 0, duration: 0.55, ease: 'power3.out' }, '-=0.25')
        .from('.tetra-product-stage', { y: 58, scale: 0.97, opacity: 0, duration: 0.82, ease: 'power3.out' }, '-=0.35')
        .from('.tetra-layer-explorer, .tetra-proof-item', { y: 28, opacity: 0, duration: 0.64, stagger: 0.08, ease: 'power3.out' }, '-=0.48');

      gsap.to('.tetra-pack-motion', {
        y: -54,
        rotateZ: -2,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.9,
        },
      });

      gsap.to('.tetra-stage-copy', {
        y: -28,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.15,
        },
      });

      gsap.to('.tetra-stage-lines', {
        backgroundPosition: '84px 126px',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      ScrollTrigger.create({
        trigger: section,
        start: 'top 58%',
        end: 'bottom 42%',
        scrub: true,
        onUpdate: (self) => {
          const nextLayer = Math.min(6, Math.max(1, Math.round(self.progress * 5) + 1));
          setActiveLayer(nextLayer);
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const handleFlavorChange = (next: FlavorId) => {
    setFlavor(next);
    setStrawPopped(false);
    setSipCount(0);
    fizzAudio.playFizz();
  };

  const handleSip = () => {
    fizzAudio.playFizz();
    setStrawPopped(true);
    setSipCount((prev) => Math.min(prev + 1, 6));
    const burst = Array.from({ length: 7 }).map((_, index) => ({
      id: Date.now() + index,
      x: (Math.random() - 0.5) * 170,
      y: -72 - Math.random() * 84,
      color: current.accent,
    }));
    setSplashes(burst);
    window.setTimeout(() => setSplashes([]), 1000);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 900) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 20);
    mouseY.set(-y * 16);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      id="tetra-experience"
      className="relative isolate overflow-hidden border-y border-[#073D2C]/10 bg-[#F8F6EF] py-20 text-[#073D2C] sm:py-24 lg:min-h-[165svh]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#F8F6EF_0%,#F1F8EF_44%,#FFF8EB_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/80" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-[22%] bg-[linear-gradient(90deg,rgba(255,255,255,0.78),transparent)]" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-[26%] bg-[linear-gradient(270deg,rgba(255,255,255,0.72),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:sticky lg:top-20 lg:min-h-[calc(100svh-5rem)] lg:py-10">
        <div className="grid items-end gap-7 lg:grid-cols-[1fr_auto]">
          <div className="max-w-4xl">
            <div className="tetra-kicker inline-flex items-center gap-2 rounded-full border border-[#073D2C]/10 bg-white/72 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#073D2C] shadow-[0_16px_38px_rgba(7,61,44,0.08)] backdrop-blur-xl">
              <Factory className="h-3.5 w-3.5" />
              Manufacturing & Quality
            </div>

            <h2 className="mt-5 max-w-4xl overflow-hidden font-['Space_Grotesk',sans-serif] text-[clamp(3rem,7vw,6.6rem)] font-black uppercase leading-[0.86] tracking-tight text-[#073D2C]">
              <span className="tetra-headline-word block">The ₹10</span>
              <span className="tetra-headline-word block">Tetra Pak</span>
              <span className="tetra-headline-word block" style={{ color: current.accent }}>
                Stage.
              </span>
            </h2>

            <p className="tetra-copy mt-5 max-w-2xl text-base font-semibold leading-relaxed text-[#426354] sm:text-lg">
              A cinematic look at how PIO protects mango and lychee refreshment with a compact six-layer aseptic carton.
            </p>
          </div>

          <FlavorSwitch flavor={flavor} onChange={handleFlavorChange} />
        </div>

        <div className="mt-9 grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.72fr)]">
          <ProductStage
            flavor={current}
            activeLayer={activeLayer}
            mouseX={mouseX}
            mouseY={mouseY}
            strawPopped={strawPopped}
            splashes={splashes}
            onMove={handleMouseMove}
            onLeave={handleMouseLeave}
          />

          <div className="space-y-5">
            <LayerStack activeLayer={activeLayer} setActiveLayer={setActiveLayer} accent={current.accent} />

            <div className="tetra-proof-item rounded-[28px] border border-white/70 bg-white/65 p-5 shadow-[0_24px_60px_rgba(7,61,44,0.10)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: current.deep }}>
                    {current.name}
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-[#426354]">{current.line}</p>
                </div>
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_16px_34px_rgba(7,61,44,0.14)]"
                  style={{ backgroundColor: current.accent }}
                >
                  <BadgeIndianRupee className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {current.notes.map((note) => (
                  <div key={note} className="rounded-2xl border border-[#073D2C]/10 bg-[#F8F6EF]/70 px-3 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#073D2C]">
                    {note}
                  </div>
                ))}
              </div>
            </div>

            <div className="tetra-proof-item rounded-[28px] border border-white/70 bg-[#073D2C] p-5 text-white shadow-[0_24px_60px_rgba(7,61,44,0.16)]">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100/75">
                <Leaf className="h-4 w-4" />
                Quality flow
              </div>
              <div className="mt-4 space-y-3">
                {QUALITY_STEPS.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 text-sm font-bold text-white/90">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[10px] font-black">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                    <CheckCircle2 className="ml-auto h-4 w-4 text-[#FFC83D]" />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSip}
                className="mt-5 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[11px] font-black uppercase tracking-[0.16em] text-[#073D2C] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFF4D8] active:scale-95"
              >
                {strawPopped ? `Sip freshness ${sipCount}/6` : 'Pop straw and sip'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
