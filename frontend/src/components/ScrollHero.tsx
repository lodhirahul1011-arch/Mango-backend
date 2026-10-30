import { ArrowDown, ArrowRight } from 'lucide-react';
import './ScrollHero.css';

export function ScrollHero() {
  return (
    <section id="home" className="pio-hero" data-local-motion="true" data-hero-mode="static" aria-labelledby="pio-hero-title">
      <picture className="pio-hero__media">
        <source
          media="(max-width: 767px)"
          srcSet="/images/pio-mobile-portrait-640.webp 640w, /images/pio-mobile-portrait-960.webp 960w, /images/pio-mobile-portrait-1536.webp 1536w"
          sizes="100vw"
          width={1536}
          height={2752}
        />
        <img
          className="pio-hero__image"
          src="/images/pio-nature-new-1672.webp"
          srcSet="/images/pio-nature-new-960.webp 960w, /images/pio-nature-new-1672.webp 1672w, /images/pio-nature-new-2752.webp 2752w"
          sizes="100vw"
          width={2752}
          height={1536}
          alt="PIO Mango and Lychee cartons surrounded by fresh fruit and juice splashes in nature."
          {...{ fetchpriority: 'high' }}
          loading="eager"
          decoding="async"
        />
      </picture>
      <div className="pio-hero__shell">
        <div className="pio-hero__copy">
          <p className="pio-hero__eyebrow">BORN IN ASSAM</p>
          <h1 id="pio-hero-title"><span>Har Sip.</span><em>PIO.</em></h1>
          <p className="pio-hero__intro">Real fruit refreshment in every sip.<br />Mango sunshine. Lychee freshness.</p>
          <div className="pio-hero__actions">
            <div className="pio-hero__links">
              <a className="pio-hero__primary" href="#flavours">Explore flavours <ArrowRight size={18} /></a>
              <a className="pio-hero__secondary" href="#map">Find near you <ArrowRight size={16} /></a>
            </div>
          </div>
        </div>
        <div className="pio-hero__footer">
          <div className="pio-hero__flavours"><span><i /> MANGO</span><span><i /> LYCHEE</span></div>
          <a className="pio-hero__scroll-cue" href="#flavours"><ArrowDown size={14} /><span>EXPLORE THE REFRESHMENT</span></a>
          <span className="pio-hero__rule" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
