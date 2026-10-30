import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 192;
const frameSrc = (index: number) => {
  const frameNum = index + 1;
  return `/final-cta-sequence/frame_${String(frameNum).padStart(4, '0')}.jpg`;
};

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  // Text refs for cinematic line reveals
  const badgeRef = useRef<HTMLSpanElement>(null);
  const h2Line1Ref = useRef<HTMLSpanElement>(null);
  const h2Line2Ref = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  // Animation frame and image cache refs (no React state re-renders while scrolling)
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedSetRef = useRef<Set<number>>(new Set());
  const currentFrameRef = useRef<number>(0);
  const rafRef = useRef<number>();
  const pointerPosRef = useRef({ x: 0, y: 0 });

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame function with cover-style centering & zero distortion
    const drawFrame = (index: number) => {
      currentFrameRef.current = index;

      // Find best available loaded frame if current isn't ready
      let img = imagesRef.current[index];
      if (!img || !loadedSetRef.current.has(index)) {
        for (let offset = 1; offset < 20; offset++) {
          if (index - offset >= 0 && loadedSetRef.current.has(index - offset)) {
            img = imagesRef.current[index - offset];
            break;
          }
          if (index + offset < TOTAL_FRAMES && loadedSetRef.current.has(index + offset)) {
            img = imagesRef.current[index + offset];
            break;
          }
        }
      }

      if (!img || img.naturalWidth === 0) return;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const scale = Math.max(w / imgW, h / imgH);
        const renderW = imgW * scale;
        const renderH = imgH * scale;
        const renderX = (w - renderW) / 2;
        const renderY = (h - renderH) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, renderX, renderY, renderW, renderH);
      });
    };

    // Preloading strategy
    const loadFrame = (i: number, onLoaded?: () => void) => {
      if (imagesRef.current[i]) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = frameSrc(i);
      img.onload = () => {
        loadedSetRef.current.add(i);
        if (onLoaded) onLoaded();
        if (i === currentFrameRef.current) {
          drawFrame(i);
        }
      };
      img.onerror = () => {
        // Soft fallback: continue using closest available frame
      };
      imagesRef.current[i] = img;
    };

    // 1. Immediately load frame 0 (frame_0001.jpg)
    loadFrame(0, () => drawFrame(0));

    // 2. Preload first 20 frames
    for (let i = 1; i < 24; i++) {
      loadFrame(i);
    }

    // 3. Progressively load rest in background chunks
    const timer1 = setTimeout(() => {
      for (let i = 24; i < 90; i++) loadFrame(i);
    }, 400);

    const timer2 = setTimeout(() => {
      for (let i = 90; i < TOTAL_FRAMES; i++) loadFrame(i);
    }, 1000);

    // Canvas resizing with high-DPI support (capped DPR: 2 on desktop, 1.5 on mobile)
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      drawFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // If reduced motion, load final frame and display without scrubbing
    if (prefersReducedMotion) {
      loadFrame(TOTAL_FRAMES - 1, () => drawFrame(TOTAL_FRAMES - 1));
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }

    // GSAP ScrollTrigger for 300vh sticky sequence scrub
    const ctxTimeline = gsap.context(() => {
      if (!sectionRef.current) return;

      // 1. Scroll-driven frame scrubber
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => {
          const frameIndex = Math.min(
            Math.floor(self.progress * (TOTAL_FRAMES - 1)),
            TOTAL_FRAMES - 1
          );
          if (frameIndex !== currentFrameRef.current) {
            drawFrame(frameIndex);
          }
        },
      });

      // 2. Text reveal animation linked to section scroll progress
      // 0-15%: badge / supporting label
      // 15-35%: "TWO FLAVOURS."
      // 25-45%: "ONE PIO."
      // 45-65%: "Small Sip. Big Refreshment."
      // 70-85%: CTA buttons appear
      const textTL = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
      });

      textTL
        .fromTo(badgeRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, ease: 'power2.out' }, 0.0)
        .fromTo(h2Line1Ref.current, { y: '110%', opacity: 0 }, { y: '0%', opacity: 1, ease: 'power3.out' }, 0.12)
        .fromTo(h2Line2Ref.current, { y: '110%', opacity: 0 }, { y: '0%', opacity: 1, ease: 'power3.out' }, 0.22)
        .fromTo(subtitleRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, ease: 'power2.out' }, 0.38)
        .fromTo(descRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, ease: 'power2.out' }, 0.48)
        .fromTo(buttonsRef.current, { opacity: 0, y: 22, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, ease: 'power2.out' }, 0.65);
    }, sectionRef);

    // Desktop subtle pointer parallax (max translateX: 4px, translateY: 3px)
    let pointerCleanup: (() => void) | undefined;
    if (!isMobile) {
      const handlePointerMove = (e: MouseEvent) => {
        const normX = (e.clientX / window.innerWidth - 0.5) * 2;
        const normY = (e.clientY / window.innerHeight - 0.5) * 2;
        pointerPosRef.current.x = normX * 4;
        pointerPosRef.current.y = normY * 3;

        if (canvasWrapperRef.current) {
          gsap.to(canvasWrapperRef.current, {
            x: pointerPosRef.current.x,
            y: pointerPosRef.current.y,
            duration: 0.6,
            ease: 'power1.out',
            overwrite: 'auto',
          });
        }
      };

      window.addEventListener('mousemove', handlePointerMove);
      pointerCleanup = () => window.removeEventListener('mousemove', handlePointerMove);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      pointerCleanup?.();
      ctxTimeline.revert(); // kills ScrollTrigger cleanly on unmount
    };
  }, []);

  return (
    <section
      id="final-cta"
      ref={sectionRef}
      className="final-cta-section relative w-full h-[320vh] sm:h-[360vh] bg-[#ffffff] border-t border-emerald-900/10"
    >
      {/* Sticky 100vh viewport window */}
      <div
        ref={stickyRef}
        className="final-cta-sticky sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between"
      >
        {/* Fullscreen Canvas Background with zero white haze */}
        <div
          ref={canvasWrapperRef}
          className="absolute inset-0 z-0 w-full h-full pointer-events-none overflow-hidden select-none"
        >
          <canvas
            ref={canvasRef}
            className="final-cta-canvas w-full h-full object-cover"
          />
        </div>

        {/* Top/Center Local Text Readability Tint (applied only subtly behind text, never covering whole canvas) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-white/90 via-white/40 to-transparent z-10" />

        {/* Foreground Content: HTML Text & Interactive Buttons */}
        <div className="final-cta-copy relative z-20 mx-auto max-w-7xl px-5 sm:px-8 w-full pt-16 sm:pt-20 lg:pt-24 flex flex-col items-center text-center pointer-events-auto">
          
          {/* Subtle Label Badge */}
          <div className="mb-3">
            <span
              ref={badgeRef}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-[#0b8043] bg-white/90 border border-emerald-200/70 px-4 py-1.5 rounded-full shadow-xs backdrop-blur-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              The PIO Experience
            </span>
          </div>

          {/* Headline with clip-path line reveals */}
          <div className="overflow-hidden">
            <h2 className="text-4xl sm:text-6xl lg:text-[4.2rem] font-black text-[#083b20] tracking-tight leading-[1.05]">
              <span ref={h2Line1Ref} className="block overflow-hidden pb-1">
                TWO FLAVOURS.
              </span>
              <span ref={h2Line2Ref} className="block text-[#07582f] overflow-hidden">
                ONE PIO.
              </span>
            </h2>
          </div>

          {/* Supporting Subtitle */}
          <p
            ref={subtitleRef}
            className="mt-3 text-lg sm:text-2xl font-black text-[#1e3d2b] tracking-tight"
          >
            Small Sip. Big Refreshment.
          </p>

          {/* Supporting Paragraph */}
          <p
            ref={descRef}
            className="mt-2 text-xs sm:text-sm text-[#3b5e48] max-w-md mx-auto font-medium leading-relaxed"
          >
            Whether you crave golden tropical mango or crisp floral lychee, refreshment is always just ₹10 away.
          </p>
        </div>

        {/* Bottom CTA Buttons Bar */}
        <div className="relative z-20 mx-auto max-w-7xl px-5 sm:px-8 w-full pb-10 sm:pb-14 flex items-center justify-center pointer-events-auto">
          <div
            ref={buttonsRef}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
          >
            {/* Primary Action Button */}
            <button
              onClick={() => go('story')}
              className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-[#07582f] hover:bg-[#0a6d3b] text-white px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-emerald-950/25 transition-all duration-300 hover:scale-[1.03] active:scale-95 w-full sm:w-auto"
            >
              <span>OUR STORY</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>

            {/* Secondary Action Button: Find Near You */}
            <button
              onClick={() => go('where-to-buy')}
              className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-white/95 hover:bg-[#eef8f1] text-[#07582f] border-2 border-[#07582f] px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-[1.03] active:scale-95 backdrop-blur-xs w-full sm:w-auto"
            >
              <span>FIND NEAR YOU</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5 text-[#07582f]" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
