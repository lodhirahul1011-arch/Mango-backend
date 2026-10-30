import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Zap, Wheat, Box } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Skip the first 14 over-zoomed frames: start from frame 15 (natural, pleasant scale)
const START_FRAME = 15;
const END_FRAME = 192;
const TOTAL_ACTIVE_FRAMES = END_FRAME - START_FRAME + 1; // 178 active frames

const mangoFrameSrc = (index: number) => {
  const frameNum = START_FRAME + index;
  return `/pio_jpg_Mongo/pio_jpg_sequence/frame_${String(frameNum).padStart(4, '0')}.jpg`;
};

const lycheeFrameSrc = (index: number) => {
  const frameNum = START_FRAME + index;
  return `/pio_jpg_Lichhey/generated_video_jpg_sequence/frame_${String(frameNum).padStart(4, '0')}.jpg`;
};

export function FlavorStories() {
  const containerRef = useRef<HTMLDivElement>(null);

  // MANGO REFS
  const mangoSectionRef = useRef<HTMLElement>(null);
  const mangoCanvasRef = useRef<HTMLCanvasElement>(null);
  const mangoImagesRef = useRef<HTMLImageElement[]>([]);
  const mangoLoadedRef = useRef<Set<number>>(new Set());
  const mangoRafRef = useRef<number>();

  const mangoH2Line1Ref = useRef<HTMLSpanElement>(null);
  const mangoH2Line2Ref = useRef<HTMLSpanElement>(null);
  const mangoCopyRef = useRef<HTMLParagraphElement>(null);
  const mangoNutriRef = useRef<HTMLDivElement>(null);
  const mangoCtaRef = useRef<HTMLDivElement>(null);

  // LYCHEE REFS
  const lycheeSectionRef = useRef<HTMLElement>(null);
  const lycheeCanvasRef = useRef<HTMLCanvasElement>(null);
  const lycheeImagesRef = useRef<HTMLImageElement[]>([]);
  const lycheeLoadedRef = useRef<Set<number>>(new Set());
  const lycheeRafRef = useRef<number>();

  const lycheeH2Line1Ref = useRef<HTMLSpanElement>(null);
  const lycheeH2Line2Ref = useRef<HTMLSpanElement>(null);
  const lycheeCopyRef = useRef<HTMLParagraphElement>(null);
  const lycheeNutriRef = useRef<HTMLDivElement>(null);
  const lycheeCtaRef = useRef<HTMLDivElement>(null);

  // Magnetic hover handler
  const attachMagneticButton = (el: HTMLElement | null) => {
    if (!el) return;
    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
      gsap.to(el, { x, y, duration: 0.3, ease: 'power2.out' });
    };
    const onMouseLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    };
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  };

  useEffect(() => {
    /* ====================================================
       1. MANGO CANVAS INITIALIZATION & PRELOADING
       ==================================================== */
    const mangoCanvas = mangoCanvasRef.current;
    const mangoCtx = mangoCanvas?.getContext('2d');

    const drawMango = (index: number) => {
      if (!mangoCanvas || !mangoCtx) return;
      const img = mangoImagesRef.current[index];
      if (!img || !mangoLoadedRef.current.has(index)) return;

      if (mangoRafRef.current) cancelAnimationFrame(mangoRafRef.current);
      mangoRafRef.current = requestAnimationFrame(() => {
        const w = mangoCanvas.width;
        const h = mangoCanvas.height;
        mangoCtx.clearRect(0, 0, w, h);

        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = w / h;
        let renderW: number, renderH: number, renderX: number, renderY: number;

        if (canvasRatio > imgRatio) {
          renderW = w;
          renderH = w / imgRatio;
          renderX = 0;
          renderY = (h - renderH) / 2;
        } else {
          renderH = h;
          renderW = h * imgRatio;
          // Desktop: bias renderX towards right (+18% width shift) so the product carton sits gracefully in the right half
          const isWide = window.innerWidth >= 1024;
          const isMed = window.innerWidth >= 768 && window.innerWidth < 1024;
          const shiftRight = isWide ? renderW * 0.16 : isMed ? renderW * 0.08 : 0;
          renderX = (w - renderW) / 2 + shiftRight;
          renderY = 0;
        }

        mangoCtx.imageSmoothingEnabled = true;
        mangoCtx.imageSmoothingQuality = 'high';
        mangoCtx.drawImage(img, renderX, renderY, renderW, renderH);
      });
    };

    const loadMango = (i: number) => {
      if (mangoImagesRef.current[i]) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = mangoFrameSrc(i);
      img.onload = () => {
        mangoLoadedRef.current.add(i);
        if (i === 0) drawMango(0);
      };
      mangoImagesRef.current[i] = img;
    };

    for (let i = 0; i < Math.min(25, TOTAL_ACTIVE_FRAMES); i++) loadMango(i);
    const idleMangoTimer = setTimeout(() => {
      for (let i = 25; i < TOTAL_ACTIVE_FRAMES; i++) loadMango(i);
    }, 600);

    /* ====================================================
       2. LYCHEE CANVAS INITIALIZATION & PRELOADING
       ==================================================== */
    const lycheeCanvas = lycheeCanvasRef.current;
    const lycheeCtx = lycheeCanvas?.getContext('2d');

    const drawLychee = (index: number) => {
      if (!lycheeCanvas || !lycheeCtx) return;
      const img = lycheeImagesRef.current[index];
      if (!img || !lycheeLoadedRef.current.has(index)) return;

      if (lycheeRafRef.current) cancelAnimationFrame(lycheeRafRef.current);
      lycheeRafRef.current = requestAnimationFrame(() => {
        const w = lycheeCanvas.width;
        const h = lycheeCanvas.height;
        lycheeCtx.clearRect(0, 0, w, h);

        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = w / h;
        let renderW: number, renderH: number, renderX: number, renderY: number;

        if (canvasRatio > imgRatio) {
          renderW = w;
          renderH = w / imgRatio;
          renderX = 0;
          renderY = (h - renderH) / 2;
        } else {
          renderH = h;
          renderW = h * imgRatio;
          // Desktop: bias renderX towards right (+18% width shift) so the product carton sits gracefully in the right half
          const isWide = window.innerWidth >= 1024;
          const isMed = window.innerWidth >= 768 && window.innerWidth < 1024;
          const shiftRight = isWide ? renderW * 0.16 : isMed ? renderW * 0.08 : 0;
          renderX = (w - renderW) / 2 + shiftRight;
          renderY = 0;
        }

        lycheeCtx.imageSmoothingEnabled = true;
        lycheeCtx.imageSmoothingQuality = 'high';
        lycheeCtx.drawImage(img, renderX, renderY, renderW, renderH);
      });
    };

    const loadLychee = (i: number) => {
      if (lycheeImagesRef.current[i]) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = lycheeFrameSrc(i);
      img.onload = () => {
        lycheeLoadedRef.current.add(i);
        if (i === 0) drawLychee(0);
      };
      lycheeImagesRef.current[i] = img;
    };

    for (let i = 0; i < Math.min(25, TOTAL_ACTIVE_FRAMES); i++) loadLychee(i);
    const idleLycheeTimer = setTimeout(() => {
      for (let i = 25; i < TOTAL_ACTIVE_FRAMES; i++) loadLychee(i);
    }, 800);

    // High-DPI Canvas Resizing
    const resizeCanvases = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (mangoCanvas && mangoCanvas.parentElement) {
        const rect = mangoCanvas.parentElement.getBoundingClientRect();
        mangoCanvas.width = rect.width * dpr;
        mangoCanvas.height = rect.height * dpr;
        drawMango(0);
      }
      if (lycheeCanvas && lycheeCanvas.parentElement) {
        const rect = lycheeCanvas.parentElement.getBoundingClientRect();
        lycheeCanvas.width = rect.width * dpr;
        lycheeCanvas.height = rect.height * dpr;
        drawLychee(0);
      }
    };
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);

    /* ====================================================
       3. GSAP SCROLLTRIGGER PIN & FRAME SCRUBBING
       ==================================================== */
    const ctx = gsap.context(() => {
      // MANGO SCROLLTRIGGER
      if (mangoSectionRef.current) {
        ScrollTrigger.create({
          trigger: mangoSectionRef.current,
          start: 'top top',
          end: '+=160%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate: (self) => {
            const frameIndex = Math.min(
              Math.floor(self.progress * (TOTAL_ACTIVE_FRAMES - 1)),
              TOTAL_ACTIVE_FRAMES - 1
            );
            drawMango(frameIndex);
          },
        });

        const mangoTL = gsap.timeline({
          scrollTrigger: {
            trigger: mangoSectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        });
        mangoTL
          .fromTo(
            [mangoH2Line1Ref.current, mangoH2Line2Ref.current],
            { y: '110%', opacity: 0 },
            { y: '0%', opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }
          )
          .fromTo(
            mangoCopyRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.4'
          )
          .fromTo(
            mangoNutriRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.3'
          )
          .fromTo(
            mangoCtaRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.3'
          );
      }

      // LYCHEE SCROLLTRIGGER
      if (lycheeSectionRef.current) {
        ScrollTrigger.create({
          trigger: lycheeSectionRef.current,
          start: 'top top',
          end: '+=160%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate: (self) => {
            const frameIndex = Math.min(
              Math.floor(self.progress * (TOTAL_ACTIVE_FRAMES - 1)),
              TOTAL_ACTIVE_FRAMES - 1
            );
            drawLychee(frameIndex);
          },
        });

        const lycheeTL = gsap.timeline({
          scrollTrigger: {
            trigger: lycheeSectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        });
        lycheeTL
          .fromTo(
            [lycheeH2Line1Ref.current, lycheeH2Line2Ref.current],
            { y: '110%', opacity: 0 },
            { y: '0%', opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }
          )
          .fromTo(
            lycheeCopyRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.4'
          )
          .fromTo(
            lycheeNutriRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.3'
          )
          .fromTo(
            lycheeCtaRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.3'
          );
      }
    }, containerRef);

    // Magnetic CTA button cleanup
    const cleanBtn1 = attachMagneticButton(mangoCtaRef.current?.querySelector('button') || null);
    const cleanBtn2 = attachMagneticButton(lycheeCtaRef.current?.querySelector('button') || null);

    return () => {
      clearTimeout(idleMangoTimer);
      clearTimeout(idleLycheeTimer);
      if (mangoRafRef.current) cancelAnimationFrame(mangoRafRef.current);
      if (lycheeRafRef.current) cancelAnimationFrame(lycheeRafRef.current);
      window.removeEventListener('resize', resizeCanvases);
      ctx.revert();
      cleanBtn1?.();
      cleanBtn2?.();
    };
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div ref={containerRef} className="relative w-full bg-white selection:bg-[#07582f] selection:text-white">
      {/* ====================================================
          TOP INTRO HEADER: "Crafted for pure delight."
          ==================================================== */}
      <div id="stories" className="pt-20 sm:pt-28 pb-8 sm:pb-12 text-center max-w-3xl mx-auto px-5 sm:px-8">
        <span className="inline-block text-xs font-black uppercase tracking-[0.25em] text-[#0b8043] bg-[#eef8f1] px-4 py-1.5 rounded-full border border-emerald-200/60 shadow-xs">
          The Flavor Stories
        </span>
        <h2 className="mt-4 text-3xl sm:text-5xl font-black text-[#083b20] tracking-tight leading-tight">
          Crafted for pure delight.
        </h2>
        <p className="mt-3 text-base text-[#3b5e48] font-medium max-w-xl mx-auto">
          Explore each unique recipe, tasting profile, and nutritional breakdown in scroll-linked 3D depth.
        </p>
      </div>

      {/* ====================================================
          SECTION 1: MANGO STORY (Cinematic Scroll Canvas)
          ==================================================== */}
      <section
        id="mango-story"
        ref={mangoSectionRef}
        className="relative overflow-hidden w-full h-screen min-h-[640px] max-h-[1080px] flex items-center bg-[#fdfaf2]"
      >
        {/* Fullscreen 3D Frame Sequence Canvas */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <canvas
            ref={mangoCanvasRef}
            className="w-full h-full object-cover select-none"
          />
          {/* Gentle left side gradient to make live text crystal clear without covering product on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#fdfaf2]/90 via-[#fdfaf2]/40 to-transparent w-full md:w-[50%] lg:w-[45%] pointer-events-none" />
        </div>

        {/* Content Overlay Grid: Text cleanly anchored on the left */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-14 w-full pointer-events-auto">
          <div className="max-w-lg lg:max-w-xl space-y-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-amber-300/80 shadow-xs backdrop-blur-md">
              <span className="text-base">🥭</span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#92400e]">
                MANGO STORY
              </span>
            </div>

            {/* Headline with clip-path line reveal */}
            <div className="overflow-hidden">
              <h3 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-black text-[#301704] tracking-tight leading-[1.12]">
                <span ref={mangoH2Line1Ref} className="block overflow-hidden pb-1">
                  A Burst of Tropical
                </span>
                <span ref={mangoH2Line2Ref} className="block text-[#b45309] overflow-hidden">
                  Freshness in Every Sip.
                </span>
              </h3>
            </div>

            {/* Supporting Copy */}
            <p ref={mangoCopyRef} className="text-sm sm:text-base text-[#6b380f]/90 font-medium leading-relaxed max-w-md">
              Picked at peak harvest, our sun-kissed Alphonso-style mangoes bring that authentic, velvety orchard thickness everyone loves. Golden mango liquid, sunlit vibrancy, and a burst of genuine fruit excitement.
            </p>

            {/* Nutrition Facts Card (Per 160ml) */}
            <div ref={mangoNutriRef} className="rounded-3xl bg-white/95 p-4 sm:p-5 border border-amber-200/80 shadow-md shadow-amber-950/5 backdrop-blur-md max-w-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Nutrition Facts (Per 160ml)
                </span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  100% Real Fruit
                </span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100">
                {/* Energy */}
                <div className="flex items-center gap-2 pr-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fef3c7] text-[#d97706] shadow-xs">
                    <Zap className="h-4 w-4 fill-[#d97706]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 leading-none">50 kcal</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Energy</div>
                  </div>
                </div>

                {/* Carbs */}
                <div className="flex items-center gap-2 px-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fef3c7] text-[#d97706] shadow-xs">
                    <Wheat className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 leading-none">12 g</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Carbs</div>
                  </div>
                </div>

                {/* Sugar */}
                <div className="flex items-center gap-2 pl-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fef3c7] text-[#d97706] shadow-xs">
                    <Box className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 leading-none">10 g</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Sugar</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Magnetic Interactive CTA Button */}
            <div ref={mangoCtaRef} className="pt-1">
              <button
                onClick={() => go('where-to-buy')}
                className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#78350f] via-[#632a0a] to-[#451a03] hover:from-[#92400e] hover:to-[#572205] text-white px-8 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-amber-950/25 transition-all duration-300"
              >
                <span>Explore Mango Story</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          COLOR MORPH TRANSITION: Mango Golden to Lychee Pink
          ==================================================== */}
      <div className="relative w-full h-20 sm:h-28 -my-1 overflow-hidden pointer-events-none z-10">
        <svg
          viewBox="0 0 1440 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C320,120 480,180 820,100 C1140,20 1320,140 1440,80 L1440,220 L0,220 Z"
            fill="url(#morphGrad)"
          />
          <defs>
            <linearGradient id="morphGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdfaf2" />
              <stop offset="40%" stopColor="#fee2e2" />
              <stop offset="100%" stopColor="#fff1f2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ====================================================
          SECTION 2: LYCHEE STORY (Cinematic Scroll Canvas)
          ==================================================== */}
      <section
        id="lychee-story"
        ref={lycheeSectionRef}
        className="relative overflow-hidden w-full h-screen min-h-[640px] max-h-[1080px] flex items-center bg-[#fff1f2]"
      >
        {/* Fullscreen 3D Frame Sequence Canvas */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <canvas
            ref={lycheeCanvasRef}
            className="w-full h-full object-cover select-none"
          />
          {/* Gentle left side gradient to make live text crystal clear without covering product on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#fff1f2]/90 via-[#fff1f2]/40 to-transparent w-full md:w-[50%] lg:w-[45%] pointer-events-none" />
        </div>

        {/* Content Overlay Grid: Text cleanly anchored on the left */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-14 w-full pointer-events-auto">
          <div className="max-w-lg lg:max-w-xl space-y-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-rose-300/80 shadow-xs backdrop-blur-md">
              <span className="text-base">🍓</span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#9f1239]">
                LYCHEE STORY
              </span>
            </div>

            {/* Headline with clip-path bottom-to-top reveal */}
            <div className="overflow-hidden">
              <h3 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-black text-[#5c061d] tracking-tight leading-[1.12]">
                <span ref={lycheeH2Line1Ref} className="block overflow-hidden pb-1">
                  A Deliciously Refreshing
                </span>
                <span ref={lycheeH2Line2Ref} className="block text-[#e11d48] overflow-hidden">
                  Taste You'll Love.
                </span>
              </h3>
            </div>

            {/* Supporting Copy */}
            <p ref={lycheeCopyRef} className="text-sm sm:text-base text-[#881337]/90 font-medium leading-relaxed max-w-md">
              Crisp, sweet, and imbued with delicate floral fragrance. Lychee offers an invigorating burst of thirst-quenching coolness that revitalizes both body and spirit. Bright, chilled, and exquisitely balanced.
            </p>

            {/* Nutrition Facts Card (Per 160ml) */}
            <div ref={lycheeNutriRef} className="rounded-3xl bg-white/95 p-4 sm:p-5 border border-rose-200/80 shadow-md shadow-rose-950/5 backdrop-blur-md max-w-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Nutrition Facts (Per 160ml)
                </span>
                <span className="text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                  Pure Aseptic Pack
                </span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100">
                {/* Energy */}
                <div className="flex items-center gap-2 pr-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffe4e6] text-[#e11d48] shadow-xs">
                    <Zap className="h-4 w-4 fill-[#e11d48]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 leading-none">54 kcal</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Energy</div>
                  </div>
                </div>

                {/* Carbs */}
                <div className="flex items-center gap-2 px-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffe4e6] text-[#e11d48] shadow-xs">
                    <Wheat className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 leading-none">14 g</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Carbs</div>
                  </div>
                </div>

                {/* Sugar */}
                <div className="flex items-center gap-2 pl-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffe4e6] text-[#e11d48] shadow-xs">
                    <Box className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 leading-none">14 g</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Sugar</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Magnetic Interactive CTA Button */}
            <div ref={lycheeCtaRef} className="pt-1">
              <button
                onClick={() => go('where-to-buy')}
                className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#9f1239] via-[#881337] to-[#700c25] hover:from-[#be123c] hover:to-[#881337] text-white px-8 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-rose-950/25 transition-all duration-300"
              >
                <span>Explore Lychee Story</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
