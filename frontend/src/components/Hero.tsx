import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2, Droplets } from 'lucide-react';

export function Hero() {
  const [activePack, setActivePack] = useState<'both' | 'mango' | 'lychee'>('both');

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="product-showcase" className="relative min-h-screen pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden bg-gradient-to-b from-[#f7fbf8] via-[#ffffff] to-[#f4faf5]">
      {/* Soft playful orchard ambient glow backgrounds */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-200/35 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 right-0 w-[420px] h-[420px] rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-rose-200/25 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Text Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f6ec] border border-[#c2e7cc] text-[#07582f] text-xs font-black tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>Real Fruit. Real Fun. Just ₹10</span>
            </div>

            {/* Playful Hero Display Headline matching reference */}
            <div className="space-y-1">
              <span className="block font-serif italic text-3xl sm:text-4xl lg:text-5xl text-[#0b8043] font-bold tracking-tight">
                Small Sip
              </span>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#083b20] tracking-[-0.04em] leading-[0.98]">
                Big Refreshment
              </h1>
            </div>

            {/* Subtitle */}
            <p className="max-w-xl text-base sm:text-lg text-[#325340] leading-relaxed font-medium">
              Bursting with real mango sweetness and fresh lychee fun. Pocket-friendly, aseptically sealed, and crafted to brighten every moment of your day.
            </p>

            {/* CTAs & Action buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => scrollToSection('story')}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#07582f] hover:bg-[#0a6d3b] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-emerald-900/15 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <span>Our Story</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection('why-pio')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-emerald-50/60 border border-emerald-900/15 text-[#07582f] font-bold text-sm tracking-wide transition-all duration-200"
              >
                Why PIO?
              </button>
            </div>

            {/* Flavor Interactive Switcher */}
            <div className="pt-4 border-t border-emerald-900/10">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5 block">
                Quick Flavor Preview:
              </span>
              <div className="inline-flex p-1 rounded-2xl bg-white border border-emerald-900/10 shadow-2xs gap-1">
                <button
                  onClick={() => setActivePack('both')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePack === 'both' ? 'bg-[#07582f] text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-900'
                  }`}
                >
                  Both Packs
                </button>
                <button
                  onClick={() => setActivePack('mango')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePack === 'mango' ? 'bg-[#f59e0b] text-white shadow-2xs' : 'text-slate-600 hover:text-amber-800'
                  }`}
                >
                  🥭 Mango
                </button>
                <button
                  onClick={() => setActivePack('lychee')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePack === 'lychee' ? 'bg-[#e11d48] text-white shadow-2xs' : 'text-slate-600 hover:text-rose-800'
                  }`}
                >
                  🌺 Lychee
                </button>
              </div>
            </div>

            {/* Trust highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-[#0b8043] shrink-0" />
                <span>Made with Real Fruit</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                <Sparkles className="w-4 h-4 text-[#f59e0b] shrink-0" />
                <span>No Added Preservatives</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                <Droplets className="w-4 h-4 text-[#0284c7] shrink-0" />
                <span>Pure Assam Quality</span>
              </div>
            </div>
          </motion.div>

          {/* Right Product 3D Hero Visual Column */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[420px] sm:min-h-[500px]">
            {/* Soft decorative splash ring behind packs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-tr from-amber-200/40 via-emerald-100/50 to-rose-200/40 animate-pulse duration-1000" />
              <div className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] rounded-full border border-emerald-900/10" />
            </div>

            {/* Interactive Pack Display */}
            <AnimatePresence mode="wait">
              {activePack === 'both' && (
                <motion.div 
                  key="both"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 flex items-end justify-center gap-2 sm:gap-6 w-full max-w-lg"
                >
                  {/* Mango Pack Standalone */}
                  <div className="relative group cursor-pointer" onClick={() => scrollToSection('mango-story')}>
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative"
                    >
                      {/* Mango Pack Shadow */}
                      <div className="absolute -bottom-4 left-1/3 -translate-x-1/2 w-4/5 bg-emerald-950/20 rounded-full blur-md" />
                      <img 
                        src="/images/pio-mango-lossless.webp" 
                        alt="PIO Mango 160ml pack" 
                        className="h-64 sm:h-80 md:h-96 w-auto object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2"
                      />
                      {/* Float Badge */}
                      <div className="absolute -top-3 left-0 bg-white/95 backdrop-blur-xs border border-amber-300 text-amber-900 text-[11px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <span>🥭 MANGO</span>
                        <span className="text-amber-600 font-extrabold">₹10</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Lychee Pack Standalone */}
                  <div className="relative group cursor-pointer" onClick={() => scrollToSection('lychee-story')}>
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                      className="relative"
                    >
                      {/* Lychee Pack Shadow */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-emerald-950/20 rounded-full blur-md" />
                      <img 
                        src="/images/pio-lychee-lossless.webp" 
                        alt="PIO Lychee 160ml pack" 
                        className="h-64 sm:h-80 md:h-96 w-auto object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2"
                      />
                      {/* Float Badge */}
                      <div className="absolute -top-3 right-0 bg-white/95 backdrop-blur-xs border border-rose-300 text-rose-900 text-[11px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <span>🌺 LYCHEE</span>
                        <span className="text-rose-600 font-extrabold">₹10</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activePack === 'mango' && (
                <motion.div 
                  key="mango"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center justify-center text-center max-w-sm"
                >
                  <motion.div 
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-amber-950/20 rounded-full blur-md" />
                    <img 
                      src="/images/pio-mango-lossless.webp" 
                      alt="PIO Mango 3D pack" 
                      className="h-72 sm:h-96 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform"
                    />
                  </motion.div>
                  <div className="mt-4 p-3 bg-amber-50/90 border border-amber-200 rounded-2xl">
                    <p className="text-sm font-extrabold text-amber-950">Tropical Mango • 50 kcal/160ml</p>
                    <p className="text-xs text-amber-800/80">Made with real mango pulp. Just ₹10.</p>
                  </div>
                </motion.div>
              )}

              {activePack === 'lychee' && (
                <motion.div 
                  key="lychee"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center justify-center text-center max-w-sm"
                >
                  <motion.div 
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-rose-950/20 rounded-full blur-md" />
                    <img 
                      src="/images/pio-lychee-lossless.webp" 
                      alt="PIO Lychee 3D pack" 
                      className="h-72 sm:h-96 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform"
                    />
                  </motion.div>
                  <div className="mt-4 p-3 bg-rose-50/90 border border-rose-200 rounded-2xl">
                    <p className="text-sm font-extrabold text-rose-950">Fresh Lychee • 54 kcal/160ml</p>
                    <p className="text-xs text-rose-800/80">Exotic floral sweetness. Just ₹10.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ₹10 Coin Floating Stamp */}
            <div className="absolute bottom-2 right-4 sm:right-10 z-20 flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#ffd54f] to-[#f59e0b] text-[#78350f] font-black shadow-lg border-2 border-white transform rotate-6 hover:rotate-0 transition-transform">
              <span className="text-[10px] sm:text-xs uppercase tracking-tight">Only</span>
              <span className="text-base sm:text-xl leading-none">₹10</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
