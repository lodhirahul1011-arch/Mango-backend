import { useLayoutEffect, type RefObject } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import { createHeroFrameLoader, type HeroFrameLoader } from '@/utils/heroFrameLoader';
import { HERO_VARIANTS, dataConnection, heroFrame, type HeroVariant } from '@/utils/heroSequence';
import { measureScrollViewport } from '@/utils/scrollViewport';

gsap.registerPlugin(ScrollTrigger);

export function useHeroSequence(sectionRef: RefObject<HTMLElement>, canvasRef: RefObject<HTMLCanvasElement>, variant: HeroVariant) {
  useLayoutEffect(() => {
    const root = sectionRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    const viewport = root?.querySelector<HTMLElement>('.pio-hero__viewport');
    const shell = root?.querySelector<HTMLElement>('.pio-hero__shell');
    const copy = root?.querySelector<HTMLElement>('.pio-hero__copy');
    const heading = root?.querySelector<HTMLElement>('.pio-hero__heading');
    const actions = root?.querySelector<HTMLElement>('.pio-hero__actions');
    const media = root?.querySelector<HTMLElement>('.pio-hero__media');
    if (!root || !canvas || !context || !viewport || !shell || !copy || !heading || !actions || !media) return;
    const navigation = document.querySelector<HTMLElement>('[data-pio-nav]');
    const stableViewport = measureScrollViewport(root);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = dataConnection();
    const config = HERO_VARIANTS[variant];
    let loader: HeroFrameLoader | undefined;
    let trigger: ScrollTrigger | undefined;
    let disposed = false, raf = 0, resizeRaf = 0;
    let target: number = config.start, drawn = -1, progress = 0, signature = '';
    let nextWidth = canvas.width, nextHeight = canvas.height, sizeDirty = false;

    const draw = (index: number, image: CanvasImageSource) => {
      if (disposed || index !== target || (drawn === index && !sizeDirty)) return;
      if (sizeDirty) {
        canvas.width = nextWidth; canvas.height = nextHeight;
        sizeDirty = false;
      }
      // Desktop covers the full viewport. Preserve the existing mobile fit.
      const fit = innerWidth >= 768 ? Math.max
        : canvas.width / canvas.height > config.width / config.height ? Math.min : Math.max;
      const ratio = fit(canvas.width / config.width, canvas.height / config.height);
      const width = config.width * ratio, height = config.height * ratio;
      // Center the packs horizontally and vertically
      const offsetX = (canvas.width - width) / 2;
      const offsetY = (canvas.height - height) / 2;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, offsetX, offsetY, width, height);
      drawn = index;
      root.dataset.frameReady = 'true';
      if (import.meta.env.DEV) canvas.dataset.frame = String(index);
    };
    const sizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      // Preserve detail on high-DPI screens without oversized backing stores.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));
      nextWidth = width; nextHeight = height;
      sizeDirty = canvas.width !== width || canvas.height !== height;
      if (sizeDirty) loader?.redraw();
    };
    const requestFrame = () => {
      if (disposed || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        target = Math.min(config.count - 1, Math.max(config.start, config.start + Math.round(progress * (config.count - 1 - config.start))));
        root.style.setProperty('--hero-progress', String(progress));
        loader?.request(target);
      });
    };
    const setProgress = (next: number) => {
      progress = next;
      // Keep the headline visible throughout the scroll sequence.
      root.style.setProperty('--hero-copy-offset', `${-8 * progress}px`);
      requestFrame();
    };

    const measure = () => {
      resizeRaf = 0;
      if (disposed) return;
      const screenHeight = Math.floor(stableViewport.height());
      const navSpace = Math.ceil((navigation?.getBoundingClientRect().bottom || 76) + 16);
      const staticMode = motion.matches || Boolean(connection?.saveData);
      const isMobile = innerWidth < 768;
      const footerHeight = root.querySelector<HTMLElement>('.pio-hero__footer')?.offsetHeight || 24;
      // Short phones get enough layout height for readable text and two touch targets.
      const minimumHeight = navSpace + heading.offsetHeight + actions.offsetHeight + footerHeight + 180 + 100;
      const height = isMobile ? Math.max(screenHeight, minimumHeight) : screenHeight;

      const next = [innerWidth, height, navSpace, heading.offsetHeight, actions.offsetHeight, footerHeight, staticMode].join(':');
      if (next === signature) { sizeCanvas(); return; }
      trigger?.kill(); trigger = undefined;
      root.style.setProperty('--hero-nav-space', navSpace + 'px');
      root.style.setProperty('--hero-view-height', height + 'px');
      root.style.setProperty('--hero-section-height', Math.round(staticMode ? height : isMobile ? height * 3 : height * 4) + 'px');
      root.dataset.heroMode = staticMode ? 'static' : 'scroll';
      sizeCanvas();
      if (staticMode) {
        setProgress(0);
        loader?.destroy(); loader = undefined;
        drawn = -1; delete root.dataset.frameReady;
      } else {
        loader ??= createHeroFrameLoader({
          count: config.count, mobile: variant === 'mobile',
          url: index => heroFrame(variant, index), onFrame: draw,
          onStats: import.meta.env.DEV ? stats => { root.dataset.loaderStats = JSON.stringify(stats); } : undefined,
        });
        trigger = ScrollTrigger.create({
          id: 'pio-hero-sequence',
          trigger: root,
          start: 'top top',
          end: () => `+=${root.offsetHeight - viewport.offsetHeight}`,
          onUpdate: self => setProgress(self.progress),
          onRefresh: self => setProgress(self.progress),
          invalidateOnRefresh: true,
        });
        setProgress(trigger.progress);
      }
      signature = next;
      ScrollTrigger.refresh();
    };
    const scheduleMeasure = () => {
      if (!disposed && !resizeRaf) resizeRaf = requestAnimationFrame(measure);
    };
    const invalidate = () => { signature = ''; scheduleMeasure(); };
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(heading); observer.observe(actions); observer.observe(viewport);
    observer.observe(copy); observer.observe(media);
    if (navigation) observer.observe(navigation);
    const poster = root.querySelector('img');
    poster?.addEventListener('load', scheduleMeasure);
    motion.addEventListener('change', invalidate);
    connection?.addEventListener('change', invalidate);
    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('orientationchange', invalidate);
    window.visualViewport?.addEventListener('resize', scheduleMeasure);
    document.fonts?.ready.then(() => { if (!disposed) invalidate(); });
    measure();
    return () => {
      disposed = true;
      trigger?.kill();
      loader?.destroy();
      cancelAnimationFrame(raf); cancelAnimationFrame(resizeRaf);
      observer.disconnect(); stableViewport.destroy();
      motion.removeEventListener('change', invalidate);
      connection?.removeEventListener('change', invalidate);
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('orientationchange', invalidate);
      window.visualViewport?.removeEventListener('resize', scheduleMeasure);
      poster?.removeEventListener('load', scheduleMeasure);
      copy.inert = false;
      copy.removeAttribute('aria-hidden');
      root.style.removeProperty('--hero-copy-fade');
      root.style.removeProperty('--hero-copy-offset');
      root.style.removeProperty('--hero-stage-shift');
      root.style.removeProperty('--hero-stage-scale');
      delete root.dataset.frameReady;
    };
  }, [sectionRef, canvasRef, variant]);
}
