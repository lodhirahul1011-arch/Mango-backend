import { Fragment, useEffect, useRef } from 'react';
import { ArrowDown, ArrowUpRight, MapPin } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Marquee } from './Marquee';
import './OurStory.css';
import { useStoryStack } from '@/hooks/useStoryStack';

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  { label: 'The first cup', year: '1931', title: 'Small beginnings.\nExtraordinary belief.', copy: 'In Mangaldai, Assam, Late Sunanda Ram Deka opened a humble roadside tea stall. A cup of tea. Hard work. A simple dream.', detail: 'When his sons joined him, the family stepped into manufacturing. A small beginning became a journey across generations.', foot: 'MANGALDAI, ASSAM' },
  { label: 'The trust we built', year: 'Generations', title: 'Built over generations.\nTrusted every day.', copy: 'From bakeries and confectionery to food manufacturing, the family-owned SRD Group grew through a commitment to quality.', detail: 'Our experience includes manufacturing for Kenvue (formerly Johnson & Johnson), ITC, Britannia, Conagra and Hector Beverages (Paper Boat), alongside our own brands.', foot: 'THE SRD GROUP LEGACY' },
  { label: 'Our next chapter', year: 'Pio', title: 'All that experience.\nA fresh new sip.', copy: 'The third generation asked: what if everything we had learnt could become a beverage? That idea became Pio.', detail: 'Born in Assam, our ready-to-drink fruit beverage is made for everyday moments. For little ones, the young at heart, and everyone in between.', foot: 'MADE IN ASSAM. MADE FOR YOU.' },
];

function StoryBackdrop() {
  return <div className="heritage-art__backdrop" aria-hidden="true">
    <svg viewBox="0 0 600 600" preserveAspectRatio="none" focusable="false">
      <circle className="heritage-sun" cx="479" cy="111" r="72" />
      <circle className="heritage-sun-ring" cx="479" cy="111" r="90" />
      <g className="heritage-garden">
        <path d="M-30 92C22 129 68 182 88 253M512 458C553 424 583 383 629 322" fill="none" />
        <path d="M17 137C-4 95 18 65 20 62C46 99 39 124 17 137ZM36 159C42 113 79 105 82 105C76 145 61 158 36 159ZM53 187C18 180 8 148 9 145C46 149 60 166 53 187ZM69 220C75 177 112 161 115 162C108 200 95 216 69 220Z" />
        <path d="M570 384C551 343 572 313 574 310C599 347 595 370 570 384ZM551 414C548 371 509 356 506 357C509 392 526 410 551 414ZM587 362C615 363 632 342 635 326C608 322 592 337 587 362ZM528 443C538 478 575 481 578 479C563 447 545 438 528 443Z" />
      </g>
      <g className="heritage-garden-veins" fill="none">
        <path d="M18 127L21 87M45 147L69 120M47 176L24 156M79 205L102 176M574 369L574 336M547 403L519 369M542 453L561 467" />
      </g>
      <path className="heritage-landscape" d="M-20 510C97 448 147 474 232 506S421 571 620 497V620H-20Z" />
      <path className="heritage-landscape-line" d="M-20 527C97 465 147 491 232 523S421 588 620 514M-20 545C97 483 147 509 232 541S421 606 620 532" fill="none" />
      <g className="heritage-dewdrops"><circle cx="63" cy="353" r="5" /><circle cx="538" cy="236" r="4" /><circle cx="96" cy="86" r="3" /><circle cx="485" cy="407" r="3" /></g>
    </svg>
  </div>;
}

function ChapterArt({ index }: { index: number }) {
  if (index === 0) return <div className="heritage-art heritage-art--tea" aria-hidden="true">
    <StoryBackdrop />
    <span className="heritage-art__year">1931</span>
    <svg className="heritage-cup" viewBox="0 0 400 300" fill="none">
      <path className="heritage-steam" d="M154 113C126 82 179 74 155 40M201 109C177 80 227 67 205 25M245 113C222 87 268 76 249 46" />
      <path d="M105 137H285L271 203C263 240 126 240 118 203L105 137ZM286 147H308C343 147 333 197 281 197M88 248C133 269 263 269 307 248M103 137C146 151 243 151 285 137" />
    </svg>
    <span className="heritage-art__caption">ONE CUP. A WORLD OF POSSIBILITY.</span>
  </div>;
  if (index === 1) return <div className="heritage-art heritage-art--legacy" aria-hidden="true">
    <StoryBackdrop />
    <span className="heritage-art__overline">A FAMILY. A SHARED STANDARD.</span>
    <span className="heritage-art__srd">SRD<span>GROUP</span></span>
    <div className="heritage-art__orbit"><span>FOOD</span><i /><span>FAMILY</span><i /><span>TRUST</span></div>
    <span className="heritage-art__caption">BUILT OVER GENERATIONS.</span>
  </div>;
  return <div className="heritage-art heritage-art--pio" aria-hidden="true">
    <StoryBackdrop />
    <span className="heritage-art__pio-word">Pio.</span>
    <img className="heritage-pack heritage-pack--mango" src="/assets/products/pio-mango-lossless.webp" alt="" loading="lazy" width="300" height="600" />
    <img className="heritage-pack heritage-pack--lychee" src="/assets/products/pio-lychee-lossless.webp" alt="" loading="lazy" width="300" height="600" />
    <span className="heritage-art__caption">HAR SIP JIO.</span>
  </div>;
}

export function OurStory() {
  const rootRef = useRef<HTMLElement>(null);
  useStoryStack(rootRef);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => {
      root.dataset.motionActive = String(entry.isIntersecting);
    });
    observer.observe(root);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {

      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('.heritage-reveal').forEach(element => {
          gsap.fromTo(element, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
        });
        gsap.fromTo('.heritage-intro__rule', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.heritage-intro', start: 'top 80%', end: 'bottom 65%', scrub: 0.3 } });

        gsap.to('.heritage-closing__word', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.heritage-closing', start: 'top bottom', end: 'bottom top', scrub: 0.5 } });
        gsap.fromTo('.heritage-closing__landscape', { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: '.heritage-closing', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
        gsap.timeline({ scrollTrigger: { trigger: '.heritage-closing', start: 'top 80%', once: true } })
          .from('.heritage-closing__line > span', { yPercent: 110, rotate: 2, duration: 1, stagger: 0.16, ease: 'power3.out' })
          .from('.heritage-closing__copy, .heritage-closing__cta', { y: 20, opacity: 0, duration: 0.65, stagger: 0.12, ease: 'power2.out' }, '-=0.45')
          .from('.heritage-closing__seal', { scale: 0.88, opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.25);
        gsap.fromTo('.heritage-closing__bloom', { y: 28, rotate: -5 }, { y: -28, rotate: 6, ease: 'none', scrollTrigger: { trigger: '.heritage-closing', start: 'top bottom', end: 'bottom top', scrub: 0.7 } });
      });
    }, root);
    return () => { observer.disconnect(); media.revert(); context.revert(); };
  }, []);

  return (
    <section id="story" ref={rootRef} className="heritage" data-local-motion="true" aria-labelledby="heritage-heading">
      <div className="heritage-atmosphere" aria-hidden="true">
        <span className="heritage-glow heritage-glow--mint" />
        <span className="heritage-glow heritage-glow--peach" />
        <span className="heritage-glow heritage-glow--gold" />
      </div>
      <div className="heritage-intro">
        <div className="heritage-meta heritage-reveal"><span>OUR STORY / EST. 1931</span><span><MapPin size={12} /> MANGALDAI, ASSAM</span></div>
        <h2 id="heritage-heading" className="heritage-reveal">Rooted in Assam.<br /><em>Made for what's next.</em></h2>
        <div className="heritage-intro__bottom heritage-reveal"><p>From a little tea stall to a new generation of beverages.<br />Some stories get better with every sip.</p><a href="#story-chapter-0">FOLLOW OUR JOURNEY <ArrowDown size={17} /></a></div>
        <div className="heritage-intro__rule" />
      </div>

      <Marquee />

      <div className="heritage-stack" aria-label="Three chapters of the PIO story">
        {CHAPTERS.map((chapter, index) => <Fragment key={chapter.label}>
          <div className="heritage-stack__marker" id={`story-chapter-${index}`} aria-hidden="true" />
          <article className={`heritage-stack__panel heritage-stack__panel--${index}`} style={{ zIndex: index + 1 }} aria-labelledby={`story-title-${index}`}>
            <div className="heritage-stack__inner">
              <div className="heritage-stack__copy">
                <p className="heritage-kicker"><span>0{index + 1}</span> {chapter.label}</p>
                <h3 id={`story-title-${index}`}>{chapter.title.split('\n').map(line => <span key={line}>{line}</span>)}</h3>
                <p className="heritage-chapter__lead">{chapter.copy}</p>
                <p className="heritage-chapter__detail">{chapter.detail}</p>
                {index === 1 && <div className="heritage-stats" aria-label="Repose network"><div><strong>15,000<span>+</span></strong><p>Repose retail outlets across Assam</p></div><div><strong>16</strong><p>Repose bakery outlets in Guwahati</p></div></div>}
                <span className="heritage-chapter__foot">{chapter.foot}</span>
                <a className="heritage-stack__cta" href={index < 2 ? `#story-chapter-${index + 1}` : '#flavours'}>{index < 2 ? 'The next chapter' : 'Meet your next favourite'}<ArrowUpRight size={18} /></a>
              </div>
              <div className="heritage-stack__visual">
                <div className="heritage-stack__visual-meta"><span>{chapter.year}</span><span>0{index + 1} / 03</span></div>
                <div className="heritage-stack__art"><ChapterArt index={index} /></div>
              </div>
            </div>
          </article>
        </Fragment>)}
        <div className="heritage-stack__release" aria-hidden="true" />
      </div>

      <div className="heritage-closing">
        <div className="heritage-closing__landscape" aria-hidden="true" />
        <span className="heritage-closing__word" aria-hidden="true">Har Sip Jio.</span>
        <div className="heritage-closing__layout">
          <div className="heritage-closing__content">
            <p className="heritage-kicker">FROM ASSAM. FOR WHAT'S AHEAD.</p>
            <h3><span className="heritage-closing__line"><span>A legacy in every sip.</span></span><span className="heritage-closing__line"><span><em>A whole new chapter.</em></span></span></h3>
            <p className="heritage-closing__copy">Our ambition: to make Assam proud. To take Pio across the Northeast, India and beyond, through the quality it stands for.</p>
            <a className="heritage-closing__cta" href="#flavours">Meet your next favourite <span><ArrowUpRight size={19} /></span></a>
          </div>
          <div className="heritage-closing__seal" aria-label="Born in Assam. Made for everyday joy.">
            <div className="heritage-closing__bloom" aria-hidden="true"><span /><span /><span /></div>
            <div className="heritage-closing__seal-copy" aria-hidden="true"><span>BORN IN</span><strong>Assam.</strong><i /><span>MADE FOR<br />EVERYDAY JOY.</span></div>
          </div>
        </div>
        <div className="heritage-signoff"><span>FROM MANGALDAI, WITH GENERATIONS OF EXPERIENCE.</span><span>PIO. HAR SIP JIO.</span></div>
      </div>
    </section>
  );
}
