import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const frameUrl = (flavour: string, index: number) => `/frames/${flavour}/frame_${String(index + 1).padStart(4, '0')}.webp`;

export function useFlavourFrames({ flavour, count, sectionRef, canvasRef, progressRef, start = 'top top', end = 'bottom bottom' }: {
  flavour: 'mango' | 'lychee';
  count: number;
  sectionRef: RefObject<HTMLElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  progressRef: RefObject<HTMLDivElement>;
  start?: string;
  end?: string;
}) {
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let disposed = false;
    let target = 0;
    let lastDrawn = -1;
    let activeLoads = 0;
    let started = false;
    let raf = 0;
    const images = new Map<number, HTMLImageElement>();
    const failed = new Set<number>();
    const pending = new Set<number>();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const draw = () => {
      raf = 0;
      if (disposed || !images.size) return;
      // Keep the closest available frame visible while the exact frame loads.
      const nearest = images.has(target) ? target : [...images.keys()].reduce((a, b) => Math.abs(a - target) < Math.abs(b - target) ? a : b);
      if (nearest === lastDrawn) return;
      const image = images.get(nearest)!;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.dataset.frame = String(nearest + 1);
      canvas.style.opacity = '1';
      lastDrawn = nearest;
    };
    const scheduleDraw = () => { if (!raf && !disposed) raf = requestAnimationFrame(draw); };
    const pump = () => {
      if (disposed || !started || activeLoads >= 4 || images.size + failed.size >= (reducedMotion.matches ? 1 : count)) return;
      const candidates = Array.from({ length: reducedMotion.matches ? 1 : count }, (_, i) => i)
        .filter(i => !images.has(i) && !pending.has(i) && !failed.has(i))
        .sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
      while (activeLoads < 4 && candidates.length) {
        const index = candidates.shift()!;
        pending.add(index);
        activeLoads++;
        const image = new Image();
        image.decoding = 'async';
        const finish = (success: boolean) => {
          pending.delete(index);
          activeLoads--;
          if (disposed) return;
          if (success) images.set(index, image);
          else failed.add(index);
          scheduleDraw();
          pump();
        };
        image.onload = () => finish(true);
        image.onerror = () => finish(false);
        image.src = frameUrl(flavour, index);
      }
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        started = true;
        pump();
        observer.disconnect();
      }
    }, { rootMargin: '600px' });
    observer.observe(section);

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const playhead = { frame: 0 };
      gsap.to(playhead, {
        frame: count - 1,
        ease: 'none',
        scrollTrigger: { trigger: section, start, end, scrub: 0.15, invalidateOnRefresh: true },
        onUpdate: () => {
          target = Math.round(playhead.frame);
          if (progressRef.current) progressRef.current.style.transform = `scaleX(${playhead.frame / (count - 1)})`;
          scheduleDraw();
          pump();
        },
      });
    });
    const onPreferenceChange = () => { target = 0; scheduleDraw(); pump(); };
    reducedMotion.addEventListener('change', onPreferenceChange);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      reducedMotion.removeEventListener('change', onPreferenceChange);
      media.revert();
      images.clear();
    };
  }, [flavour, count, start, end, sectionRef, canvasRef, progressRef]);
}
