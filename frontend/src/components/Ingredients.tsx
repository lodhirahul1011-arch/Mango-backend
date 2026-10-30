import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sparkles,
  Droplets,
  Leaf,
  ShieldCheck,
  Waves,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { fizzAudio } from '@/utils/audio';
import { ScannerFrameSequence } from '@/components/ScannerFrameSequence';

gsap.registerPlugin(ScrollTrigger);

// Ingredient details data
const INGREDIENTS_DATA = {
  mango: {
    id: 'mango',
    name: 'Ratnagiri Alphonso Mango',
    source: 'Western Ghats, Maharashtra',
    highlight: 'Sun-ripened orchard pulp harvested at peak sweetness',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    bgLight: 'from-amber-500/10 via-yellow-100/30 to-emerald-50/20',
    accentText: 'text-amber-800',
    tagBg: 'bg-amber-100 text-amber-900 border-amber-300',
    viscosity: 82,
    purity: 99.4,
    calories: '68 kcal / 100ml',
    packImage: '/images/pio-mango-lossless.webp',
    traits: [
      { label: 'Real Pulp Content', value: '100% Genuine' },
      { label: 'Artificial Colors', value: '0.00% Zero' },
      { label: 'Sourcing Harvest', value: 'Single Origin' },
      { label: 'Aroma Profile', value: 'Tropical Velvet' },
    ]
  },
  lychee: {
    id: 'lychee',
    name: 'Himalayan Floral Lychee',
    source: 'Dehradun Valley Orchards',
    highlight: 'Translucent aromatic nectar with crisp floral notes',
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    bgLight: 'from-rose-500/10 via-pink-100/30 to-emerald-50/20',
    accentText: 'text-rose-800',
    tagBg: 'bg-rose-100 text-rose-900 border-rose-300',
    viscosity: 74,
    purity: 99.8,
    calories: '62 kcal / 100ml',
    packImage: '/images/pio-lychee-lossless.webp',
    traits: [
      { label: 'Natural Lychee Extract', value: '100% Genuine' },
      { label: 'Artificial Flavors', value: '0.00% Zero' },
      { label: 'Sourcing Harvest', value: 'Valley Fresh' },
      { label: 'Aroma Profile', value: 'Crisp Blossom' },
    ]
  }
};

const PURITY_PILLARS = [
  {
    icon: Sparkles,
    title: '100% Real Fruit First',
    subtitle: 'No Artificial Fillers',
    desc: 'Pure fruit pulp and extracts delivered straight to aseptic blend tanks without watery dilutions.',
    color: 'from-amber-500 to-yellow-400',
    badge: 'Real Fruit',
    accent: '#f59e0b'
  },
  {
    icon: Droplets,
    title: 'Double RO Spring Water',
    subtitle: '7-Stage Micro-Purification',
    desc: 'Crystal-clear water filtered through 0.0001 micron membranes ensuring absolute thirst hydration.',
    color: 'from-cyan-500 to-blue-400',
    badge: 'Pure H2O',
    accent: '#06b6d4'
  },
  {
    icon: Leaf,
    title: 'Botanical Plant Essences',
    subtitle: 'Nature-Identical Purity',
    desc: 'Distilled essential fruit aromatics that retain tree-fresh smell and crisp bouquet.',
    color: 'from-emerald-500 to-green-400',
    badge: 'Botanical',
    accent: '#10b981'
  },
  {
    icon: ShieldCheck,
    title: 'Zero Chemical Preservatives',
    subtitle: 'Protected by 6-Layer Science',
    desc: 'No Sodium Benzoate, no potassium sorbate, no artificial sulphur. Clean label purity for kids & family.',
    color: 'from-violet-500 to-purple-400',
    badge: 'Clean Label',
    accent: '#8b5cf6'
  }
];

export function Ingredients() {
  const [selectedFlavor, setSelectedFlavor] = useState<'mango' | 'lychee'>('mango');
  const labCardRef = useRef<HTMLDivElement>(null);
  const flavor = INGREDIENTS_DATA[selectedFlavor];

  useEffect(() => {
    const card = labCardRef.current;
    if (!card) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.set('.lab-reveal', { autoAlpha: 0, y: 26 });
      gsap.set('.lab-liquid-stage', { scale: 0.94, rotateX: 4, transformPerspective: 900 });
      gsap.set('.lab-orbit', { autoAlpha: 0, scale: 0.7, rotate: -18 });

      gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 78%',
          end: 'bottom 62%',
          toggleActions: 'play none none reverse',
        },
      })
        .to('.lab-reveal', {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          ease: 'power3.out',
          stagger: 0.08,
        })
        .to('.lab-liquid-stage', {
          scale: 1,
          rotateX: 0,
          duration: 0.85,
          ease: 'expo.out',
        }, '-=0.52')
        .to('.lab-orbit', {
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
          duration: 0.8,
          ease: 'back.out(1.8)',
          stagger: 0.08,
        }, '-=0.65');

      gsap.to('.lab-parallax-glow', {
        yPercent: -18,
        xPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.1,
        },
      });

      gsap.to('.lab-liquid-svg', {
        yPercent: -10,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.9,
        },
      });

      gsap.to('.lab-meter-card', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
    }, card);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="inside" 
      className="relative overflow-hidden py-24 lg:py-32 bg-[#fafdfa] border-y border-emerald-900/10"
    >
      {/* Dynamic Ambient Radiant Lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(16,185,129,0.08),transparent_55%),radial-gradient(circle_at_75%_35%,rgba(245,158,11,0.08),transparent_55%),radial-gradient(circle_at_50%_80%,rgba(244,63,94,0.06),transparent_60%)]" />

      {/* Floating Organic Fluid Blur Glows */}
      <div 
        className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-3xl opacity-40 transition-colors duration-1000"
        style={{ background: flavor.glowColor }}
      />
      <div 
        className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full blur-3xl opacity-30 transition-colors duration-1000"
        style={{ background: flavor.glowColor }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        
        {/* Modern Editorial Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/95 px-4 py-1.5 shadow-xs backdrop-blur"
          >
            <Sparkles className="h-4 w-4 text-[#0b8043]" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#0b8043]">
              What's Inside & Purity Science
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-['Space_Grotesk',sans-serif] text-[clamp(2.2rem,6vw,4.5rem)] font-black text-[#083b20] tracking-tight leading-[1.05]"
          >
            Simple Ingredients.<br />
            <span className="bg-gradient-to-r from-[#0b8043] via-[#eab308] to-[#f43f5e] bg-clip-text text-transparent">
              Zero Secrets.
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#325340] font-medium leading-relaxed max-w-2xl mx-auto"
          >
            Every 160ml carton of PIO is crafted with clean-label transparency: authentic fruit harvest, crystal-purified water, and multi-layer aseptic protection.
          </motion.p>

          {/* Interactive Flavor Selector Pill */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="pt-2 inline-flex items-center gap-2 p-1.5 rounded-full bg-white border border-emerald-900/10 shadow-sm backdrop-blur"
          >
            <button
              onClick={() => { setSelectedFlavor('mango'); fizzAudio.playFizz(); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                selectedFlavor === 'mango'
                  ? 'bg-[#f59e0b] text-white shadow-md scale-105'
                  : 'text-[#083b20] hover:bg-amber-50'
              }`}
            >
              <span>🥭</span>
              <span>Alphonso Mango</span>
            </button>

            <button
              onClick={() => { setSelectedFlavor('lychee'); fizzAudio.playFizz(); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                selectedFlavor === 'lychee'
                  ? 'bg-[#f43f5e] text-white shadow-md scale-105'
                  : 'text-[#083b20] hover:bg-rose-50'
              }`}
            >
              <span>🌺</span>
              <span>Floral Lychee</span>
            </button>
          </motion.div>
        </div>

        {/* ----------------------------------------------------
            THE BENTO MOTION STAGE (APPLE / STRIPE LEVEL REFINEMENT)
        ---------------------------------------------------- */}
        <div className="mt-14 grid gap-6 lg:grid-cols-12 items-stretch">
          
          {/* Bento Card 1: Interactive Live Liquid Viscosity Lab (Col 7) */}
          <div ref={labCardRef} data-local-motion="true" className="lg:col-span-7 rounded-[34px] bg-[#fffdf6] shadow-[0_28px_70px_rgba(7,61,44,0.12)] p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden group ring-1 ring-emerald-950/10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(255,214,102,0.48),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(236,253,245,0.44))]" />
            <div className="lab-parallax-glow pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full blur-3xl opacity-55 transition-colors duration-700" style={{ background: flavor.glowColor }} />
            <div className="lab-parallax-glow pointer-events-none absolute -bottom-28 left-6 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-emerald-700/20 to-transparent" />
            
            {/* Top Bar */}
            <div className="lab-reveal relative z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_14px_30px_rgba(7,61,44,0.06)] backdrop-blur-xl">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="relative flex h-3 w-3 rounded-full bg-emerald-500">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.22em] text-[#07582f]">
                  Liquid Viscosity & Sourcing Lab
                </span>
              </div>
              <span className={`shrink-0 text-[10px] sm:text-[11px] font-black uppercase px-3 py-1 rounded-full border ${flavor.tagBg}`}>
                {flavor.source}
              </span>
            </div>

            {/* Middle Title & Description */}
            <div className="relative z-10 my-6 grid gap-5 lg:grid-cols-[1fr_150px] lg:items-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={flavor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="lab-reveal"
                >
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#073d2c] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-100 shadow-sm">
                    <Flame className="h-3.5 w-3.5 text-amber-300" />
                    Peak harvest batch
                  </div>
                  <h3 className="max-w-xl font-['Space_Grotesk',sans-serif] text-3xl sm:text-5xl font-black text-[#083b20] tracking-tight leading-[0.98] text-balance">
                    {flavor.name}
                  </h3>
                  <p className="mt-3 max-w-lg text-sm sm:text-base text-[#385b45] font-semibold leading-relaxed">
                    {flavor.highlight}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="lab-reveal lab-meter-card relative overflow-hidden rounded-[26px] border border-emerald-900/10 bg-white/75 p-4 shadow-[0_18px_34px_rgba(7,61,44,0.08)] backdrop-blur">
                <div className="absolute -right-6 -top-8 h-20 w-20 rounded-full opacity-40 blur-2xl" style={{ background: flavor.color }} />
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Viscosity</div>
                <div className="mt-1 font-['Space_Grotesk',sans-serif] text-4xl font-black leading-none text-[#083b20]">
                  {flavor.viscosity}<span className="text-xl">%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-950/10">
                  <motion.div
                    key={`${flavor.id}-viscosity-meter`}
                    initial={{ width: 0 }}
                    animate={{ width: `${flavor.viscosity}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${flavor.color}, #10b981)` }}
                  />
                </div>
              </div>
            </div>

            {/* Interactive Liquid Wave Visualizer Box */}
            <div className="lab-reveal lab-liquid-stage relative z-10 flex h-52 w-full flex-col justify-between overflow-hidden rounded-[28px] border border-white/80 bg-[#eaf8ee] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:h-56 sm:p-5">
              <div className="pointer-events-none absolute inset-x-5 top-6 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/65 to-transparent" />
              
              {/* Dynamic Animated Liquid Wave SVG (GPU Composited) */}
              <div className="absolute inset-0 pointer-events-none opacity-80 overflow-hidden">
                <svg className="lab-liquid-svg w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 400">
                  <defs>
                    <linearGradient id={`liquidGrad-${flavor.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={flavor.color} stopOpacity="0.45" />
                      <stop offset="50%" stopColor={flavor.color} stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  
                  {/* Wave Layer 1 */}
                  <motion.path 
                    fill={`url(#liquidGrad-${flavor.id})`}
                    animate={{ d: [
                      "M0,200 C300,160 600,230 900,180 1200,200 L1200,400 L0,400 Z",
                      "M0,210 C300,190 600,170 900,220 1200,210 L1200,400 L0,400 Z",
                      "M0,200 C300,160 600,230 900,180 1200,200 L1200,400 L0,400 Z"
                    ]}}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Wave Layer 2 */}
                  <motion.path 
                    fill={`url(#liquidGrad-${flavor.id})`}
                    opacity="0.6"
                    animate={{ d: [
                      "M0,220 C300,250 600,190 900,240 1200,220 L1200,400 L0,400 Z",
                      "M0,205 C300,210 600,240 900,195 1200,205 L1200,400 L0,400 Z",
                      "M0,220 C300,250 600,190 900,240 1200,220 L1200,400 L0,400 Z"
                    ]}}
                    transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </svg>
              </div>

              {/* Live Metric Badges Floating over liquid wave */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-900/10 shadow-xs">
                  <Waves className="w-4 h-4 text-emerald-700 animate-spin" style={{ animationDuration: '8s' }} />
                  <span className="text-xs font-black text-[#083b20]">Natural Viscosity: {flavor.viscosity}%</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-900/10 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-black text-[#083b20]">Lab Purity: {flavor.purity}%</span>
                </div>
              </div>

              {/* Wave Footer Readout */}
              <div className="relative z-10 rounded-2xl border border-emerald-900/10 bg-white/85 p-3 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between text-[11px] font-black text-[#07582f]">
                  <span>Natural Fruit Density</span>
                  <span className="text-[#083b20]">{flavor.calories}</span>
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <div className="h-2 overflow-hidden rounded-full bg-emerald-950/10">
                    <motion.div
                      key={`${flavor.id}-density`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(96, flavor.viscosity + 9)}%` }}
                      transition={{ duration: 0.75, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${flavor.color}, rgba(16,185,129,0.85))` }}
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Live read</span>
                </div>
              </div>
            </div>

            {/* Bottom 4 Key Fact Tiles */}
            <div className="relative z-10 mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {flavor.traits.map((trait, index) => (
                <div 
                  key={trait.label} 
                  className="lab-orbit group/tile relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-white/75 p-3 shadow-[0_10px_24px_rgba(7,61,44,0.05)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_34px_rgba(7,61,44,0.1)]"
                >
                  <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-700 transition-transform group-hover/tile:scale-110">
                    0{index + 1}
                  </div>
                  <div className="pr-5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    {trait.label}
                  </div>
                  <div className="mt-2 text-sm font-black leading-tight text-[#083b20]">
                    {trait.value}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Full-bleed flavour film */}
          <div className="lg:col-span-5 min-w-0" data-local-motion="true">
            <ScannerFrameSequence key={selectedFlavor} flavour={selectedFlavor} />
          </div>

        </div>

        {/* ----------------------------------------------------
            THE 4 PURITY PILLARS GRID (INTERACTIVE MODERN CARDS)
        ---------------------------------------------------- */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PURITY_PILLARS.map((pillar) => (
            <motion.div
              key={pillar.title}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="relative overflow-hidden rounded-[28px] bg-white border border-emerald-900/10 shadow-sm hover:shadow-lg p-6 flex flex-col justify-between transition-all group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md transition-transform group-hover:rotate-6"
                    style={{ background: pillar.accent }}
                  >
                    <pillar.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-[#eef8f1] px-2.5 py-1 rounded-full border border-emerald-900/10">
                    {pillar.badge}
                  </span>
                </div>

                <h4 className="mt-5 text-lg font-black text-[#083b20] tracking-tight">
                  {pillar.title}
                </h4>

                <div className="text-[11px] font-black uppercase tracking-wider text-[#0b8043] mt-0.5">
                  {pillar.subtitle}
                </div>

                <p className="mt-2.5 text-xs sm:text-sm text-[#456852] font-medium leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              {/* Bottom Subtle Checkmark */}
              <div className="mt-5 pt-3 border-t border-emerald-900/5 flex items-center justify-between text-[11px] font-black text-[#07582f]">
                <span>100% Tested Standard</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </motion.div>
          ))}
        </div>



      </div>
    </section>
  );
}
