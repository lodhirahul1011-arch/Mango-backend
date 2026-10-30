import { useLayoutEffect, useRef } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PioMoments.css';
import { measureScrollViewport } from '@/utils/scrollViewport';

gsap.registerPlugin(ScrollTrigger);

const MOMENTS = [
  {
    id: 'sunshine', tone: 'mango', chapter: 'THE GOLDEN HOUR',
    title: <>A little sip.<br /><em>A lot of sunshine.</em></>,
    copy: 'Rich mango flavour. Golden moments. A fruity favourite for your everyday escape.',
    note: 'PIO MANGO · 160 ML · ₹10', link: '#mango-story', cta: 'Meet your mango',
    image: '/images/mango-story-bg-v1.webp', alt: 'Warm mango orchard scenery', pack: '/assets/products/pio-mango-lossless.webp',
  },
  {
    id: 'escape', tone: 'lychee', chapter: 'A FRESH PERSPECTIVE',
    title: <>Sweet escape.<br /><em>Pink possibilities.</em></>,
    copy: 'Delicate lychee flavour with a refreshing finish. Take a moment. Make it a PIO moment.',
    note: 'PIO LYCHEE · 160 ML · ₹10', link: '#lychee-story', cta: 'Discover lychee',
    image: '/images/lychee-story-bg-v1.webp', alt: 'Soft pink lychee orchard scenery', pack: '/assets/products/pio-lychee-lossless.webp',
  },
  {
    id: 'roots', tone: 'assam', chapter: 'FROM OUR HOME TO YOURS',
    title: <>Rooted in Assam.<br /><em>Made for you.</em></>,
    copy: 'A little tea stall. Generations of food-making expertise. A fresh new chapter called PIO.',
    note: 'MANGALDAI, ASSAM · THE SRD GROUP LEGACY', link: '#story', cta: 'Follow our story',
    image: '/images/assam-heritage-v1.webp', alt: 'An illustrated view of PIO’s roots in Assam', pack: null,
  },
  {
    id: 'together', tone: 'together', chapter: 'THE EVERYDAY FAVOURITE',
    title: <>Small pack.<br /><em>Big on happy.</em></>,
    copy: 'For little breaks, long conversations and everything in between. Bring a little PIO to your day.',
    note: 'TWO FRUITY FAVOURITES. ONE PIO.', link: '#partner', cta: 'Bring PIO to your store',
    image: '/images/pio-everyday-moments.webp', alt: 'PIO Mango and Lychee packs surrounded by fruit splashes', pack: null,
  },
];

/** Native sticky + a measured rail. The page scroll remains the only scroll source. */
export function PioMoments() {
  const rootRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const currentRef = useRef<HTMLSpanElement>(null);
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const moveToRef = useRef<(direction: number) => void>(() => undefined);

  useLayoutEffect(() => {
    const root = rootRef.current, scene = sceneRef.current, viewport = viewportRef.current, rail = railRef.current;
    if (!root || !scene || !viewport || !rail) return;
    const nav = document.querySelector<HTMLElement>('[data-pio-nav]');
    const cards = Array.from(rail.querySelectorAll<HTMLElement>('.pio-moments__card'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const viewportSize = measureScrollViewport(root);
    let context: gsap.Context | undefined;
    let scrollTrigger: ScrollTrigger | undefined;
    let frame = 0, disposed = false, signature = '', distance = 0;

    const currentIndex = () => {
      const position = (scrollTrigger?.progress || 0) * distance;
      return cards.reduce((best, card, index) =>
        Math.abs(Math.min(card.offsetLeft, distance) - position) < Math.abs(Math.min(cards[best].offsetLeft, distance) - position) ? index : best, 0);
    };
    const updateControls = () => {
      const index = currentIndex();
      if (currentRef.current) currentRef.current.textContent = String(index + 1).padStart(2, '0');
      if (previousRef.current) previousRef.current.disabled = index === 0;
      if (nextRef.current) nextRef.current.disabled = index === cards.length - 1;
    };
    const scrollToCard = (index: number) => {
      if (!scrollTrigger || !distance) return;
      // Auto is deliberate: keyboard focus and controls stay exactly in sync with the rail.
      window.scrollTo({ top: scrollTrigger.start + Math.min(cards[index].offsetLeft, distance), behavior: 'instant' });
    };
    moveToRef.current = direction => scrollToCard(Math.max(0, Math.min(cards.length - 1, currentIndex() + direction)));

    const measure = () => {
      frame = 0;
      if (disposed) return;
      const top = Math.ceil((nav?.getBoundingClientRect().bottom || 74) + 24);
      const height = viewportSize.height();
      const nextSignature = [root.clientWidth, height, top, reduced.matches, ...cards.map(card => card.scrollHeight)].join(':');
      if (signature === nextSignature) return;
      context?.revert(); context = undefined; scrollTrigger = undefined;
      root.style.setProperty('--moments-top', `${top}px`);
      scene.style.removeProperty('height');
      root.dataset.layout = 'vertical';
      const candidate = !reduced.matches && (window.visualViewport?.scale || 1) <= 1.05;
      if (candidate) {
        root.dataset.layout = 'horizontal';
        // Measure real content before choosing a sticky scene, including wrapped/zoomed copy.
        const sceneHeight = viewport.offsetHeight;
        distance = Math.max(0, rail.scrollWidth - rail.clientWidth);
        if (sceneHeight > height - top - 16 || cards.some(card => card.scrollHeight > card.clientHeight + 1) || !distance) root.dataset.layout = 'vertical';
        else {
          scene.style.height = `${Math.ceil(sceneHeight + distance)}px`;
          context = gsap.context(() => {
            const timeline = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                id: 'pio-moments-rail', trigger: scene,
                start: () => `top ${top}px`, end: () => `+=${distance}`,
                scrub: true, invalidateOnRefresh: true, onUpdate: updateControls,
              },
            });
            timeline.fromTo(rail, { x: 0 }, { x: () => -distance, duration: 1 }, 0);
            timeline.fromTo(progressRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
            scrollTrigger = timeline.scrollTrigger;
          }, root);
        }
      }
      signature = [root.clientWidth, height, top, reduced.matches, ...cards.map(card => card.scrollHeight)].join(':');
      ScrollTrigger.refresh();
      updateControls();
    };
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(measure); };
    const layoutChanged = () => { signature = ''; schedule(); };
    const observer = new ResizeObserver(schedule);
    observer.observe(root); if (nav) observer.observe(nav);
    cards.forEach(card => observer.observe(card));
    const images = Array.from(root.querySelectorAll('img'));
    images.forEach(image => { image.addEventListener('load', layoutChanged); image.addEventListener('error', layoutChanged); });
    const onFocus = (event: FocusEvent) => {
      if (root.dataset.layout !== 'horizontal') return;
      const target = event.target as Element;
      const bounds = target.getBoundingClientRect();
      const visible = viewport.getBoundingClientRect();
      if (!target.matches(':focus-visible') && bounds.left >= visible.left && bounds.right <= visible.right && bounds.top >= visible.top && bounds.bottom <= visible.bottom) return;
      const card = target.closest<HTMLElement>('.pio-moments__card');
      if (card) scrollToCard(cards.indexOf(card));
    };
    rail.addEventListener('focusin', onFocus);
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    reduced.addEventListener('change', layoutChanged);
    document.fonts.addEventListener('loadingdone', layoutChanged);
    void document.fonts.ready.then(() => { if (!disposed) layoutChanged(); });
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame); observer.disconnect(); context?.revert(); viewportSize.destroy();
      rail.removeEventListener('focusin', onFocus);
      window.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', layoutChanged);
      document.fonts.removeEventListener('loadingdone', layoutChanged);
      images.forEach(image => { image.removeEventListener('load', layoutChanged); image.removeEventListener('error', layoutChanged); });
      scene.style.removeProperty('height'); delete root.dataset.layout;
      moveToRef.current = () => undefined;
    };
  }, []);

  return (
    <section id="pio-moments" ref={rootRef} className="pio-moments" data-local-motion="true" aria-labelledby="pio-moments-title">
      <header className="pio-moments__intro">
        <div><p className="pio-moments__eyebrow"><span /> THE PIO EDIT / EVERYDAY ESCAPES</p><h2 id="pio-moments-title">Life tastes better<br /><em>with a little PIO.</em></h2></div>
        <div className="pio-moments__intro-note"><p>Golden afternoons. Fresh beginnings.<br />Find your kind of happy.</p><a href="#pio-moments-scene">Explore the moments <ArrowDown size={17} /></a></div>
      </header>
      <div ref={sceneRef} id="pio-moments-scene" className="pio-moments__scene">
        <div ref={viewportRef} className="pio-moments__viewport">
          <div className="pio-moments__toolbar">
            <span className="pio-moments__eyebrow">HAR SIP JIO.</span>
            <div className="pio-moments__controls">
              <span className="pio-moments__counter" aria-hidden="true"><span ref={currentRef}>01</span> <span>/ 04</span></span>
              <button ref={previousRef} type="button" onClick={() => moveToRef.current(-1)} aria-label="Previous PIO moment"><ArrowLeft size={18} /></button>
              <button ref={nextRef} type="button" onClick={() => moveToRef.current(1)} aria-label="Next PIO moment"><ArrowRight size={18} /></button>
            </div>
          </div>
          <div className="pio-moments__window">
            <ol ref={railRef} className="pio-moments__rail" aria-label="Four PIO moments">
              {MOMENTS.map((moment, index) => (
                <li key={moment.id} className={`pio-moments__card pio-moments__card--${moment.tone}`}>
                  <div className="pio-moments__copy">
                    <p className="pio-moments__eyebrow"><span className="pio-moments__number">0{index + 1}</span>{moment.chapter}</p>
                    <h3>{moment.title}</h3><p className="pio-moments__description">{moment.copy}</p>
                    <a href={moment.link} className="pio-moments__cta">{moment.cta}<ArrowUpRight size={18} /></a>
                    <span className="pio-moments__pack-note">{moment.note}</span>
                  </div>
                  <div className={`pio-moments__art ${moment.pack ? 'pio-moments__art--pack' : ''}`}>
                    <img className="pio-moments__landscape" src={moment.image} alt={moment.alt} width="1200" height="900" loading="lazy" decoding="async" />
                    {moment.pack && <><span className="pio-moments__halo" aria-hidden="true" /><img className="pio-moments__pack" src={moment.pack} alt={index === 0 ? 'PIO Mango 160 ml pack' : 'PIO Lychee 160 ml pack'} width="300" height="600" loading="lazy" decoding="async" /></>}
                    <span className="pio-moments__art-label" aria-hidden="true">a moment for you.</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="pio-moments__footer" aria-hidden="true"><span>SCROLL TO DISCOVER</span><div className="pio-moments__progress"><span ref={progressRef} /></div><span>FOUR LITTLE ESCAPES <ArrowRight size={14} /></span></div>
        </div>
      </div>
    </section>
  );
}
