import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { measureScrollViewport } from '@/utils/scrollViewport';
gsap.registerPlugin(ScrollTrigger);

export function useStoryStack(ref: RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const root = ref.current;
    const stack = root?.querySelector<HTMLElement>('.heritage-stack');
    if (!root || !stack) return;
    const nav = document.querySelector<HTMLElement>('[data-pio-nav]');
    const panels = Array.from(stack.querySelectorAll<HTMLElement>('.heritage-stack__panel'));
    const inners = Array.from(stack.querySelectorAll<HTMLElement>('.heritage-stack__inner'));
    const markers = Array.from(stack.querySelectorAll<HTMLElement>('.heritage-stack__marker'));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const viewportSize = measureScrollViewport(root);
    let context: gsap.Context | undefined;
    let pending = 0, disposed = false, signature = '', top = 98;
    const measure = () => {
      pending = 0;
      if (disposed) return;
      top = Math.ceil((nav?.getBoundingClientRect().bottom || 74) + 24);
      const viewport = viewportSize.height();
      const next = [innerWidth, viewport, top, reduced.matches, ...inners.map(el => el.offsetHeight)].join(':');
      if (next === signature) return;
      context?.revert(); context = undefined;
      stack.style.setProperty('--story-stack-top', top + 'px');
      stack.dataset.stack = 'off';
      if (!reduced.matches && (window.visualViewport?.scale || 1) <= 1.05 && inners.every(el => el.offsetHeight <= viewport - top - 20 && el.scrollHeight <= el.clientHeight + 1)) {
        stack.dataset.stack = 'on';
        context = gsap.context(() => {
          inners.slice(0, -1).forEach((inner, index) => {
            gsap.fromTo(inner, { scale: 1, y: 0 }, {
              scale: .96, y: -16, ease: 'none',
              scrollTrigger: {
                id: 'pio-story-stack-' + index, trigger: markers[index + 1],
                start: 'top 85%', end: () => 'top ' + top + 'px',
                scrub: true, invalidateOnRefresh: true,
              },
            });
          });
        }, stack);
      }
      signature = [innerWidth, viewport, top, reduced.matches, ...inners.map(el => el.offsetHeight)].join(':');
      ScrollTrigger.refresh();
    };
    const schedule = () => { if (!disposed && !pending) pending = requestAnimationFrame(measure); };
    const invalidate = () => { signature = ''; schedule(); };
    const observer = new ResizeObserver(schedule);
    inners.forEach(el => observer.observe(el)); if (nav) observer.observe(nav);
    const images = Array.from(root.querySelectorAll('img'));
    images.forEach(img => { img.addEventListener('load', invalidate); img.addEventListener('error', invalidate); });
    const focus = (event: FocusEvent) => {
      if (stack.dataset.stack !== 'on' || !(event.target as Element).matches(':focus-visible')) return;
      const panel = (event.target as Element).closest<HTMLElement>('.heritage-stack__panel');
      const index = panel ? panels.indexOf(panel) : -1;
      if (index >= 0) window.scrollTo({ top: scrollY + markers[index].getBoundingClientRect().top - top, behavior: 'instant' });
    };
    stack.addEventListener('focusin', focus);
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    reduced.addEventListener('change', invalidate);
    document.fonts.addEventListener('loadingdone', invalidate);
    void document.fonts.ready.then(() => { if (!disposed) invalidate(); });
    measure();
    return () => {
      disposed = true; cancelAnimationFrame(pending); observer.disconnect(); context?.revert(); viewportSize.destroy();
      stack.removeEventListener('focusin', focus);
      window.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', invalidate);
      document.fonts.removeEventListener('loadingdone', invalidate);
      images.forEach(img => { img.removeEventListener('load', invalidate); img.removeEventListener('error', invalidate); });
      stack.style.removeProperty('--story-stack-top'); delete stack.dataset.stack;
    };
  }, [ref]);
}
