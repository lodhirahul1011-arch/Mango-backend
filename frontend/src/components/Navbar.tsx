import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Maximize2, Menu, Minimize2, Send, X } from 'lucide-react';
import { useActiveSection, useScrolled } from '@/hooks/useScrollReveal';
import './Navbar.css';

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'flavours', label: 'Products' },
  { id: 'story', label: 'Our Story' },
  { id: 'partner', label: 'Partner With Us' },
  { id: 'contact', label: 'Contact Us' },
];

const NAV_IDS = NAV_LINKS.map(link => link.id);

export function Navbar() {
  const scrolled = useScrolled(20);
  const [open, setOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const active = useActiveSection(NAV_IDS);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = document.getElementById('home');
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      setHeroVisible(entry.isIntersecting);
      if (!entry.isIntersecting) setOpen(false);
    }, { rootMargin: '-104px 0px 0px 0px', threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;
    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menuRef.current?.querySelector<HTMLElement>('[data-menu-focus]')?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !menuRef.current) return;

      const focusable = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      ).filter((element) => element.tabIndex !== -1);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus({ preventScroll: true });
    };
  }, [open]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openSendUsForm = () => {
    setOpen(false);
    const form = document.getElementById('send-us-form');
    form?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      form?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
    }, 650);
  };

  return (
    <>
      <header hidden={!heroVisible} data-pio-nav className={`pio-navbar${scrolled ? ' is-scrolled' : ''}`}>
        <div className="pio-navbar__surface">
          <nav className="pio-navbar__layout" aria-label="Main navigation">
            <button
              onClick={() => go('home')}
              className="pio-navbar__brand"
              aria-label="Go to PIO home"
            >
              <img src="/brand/pio-logo-trim.png" alt="PIO" />
            </button>

            <ul className="pio-navbar__links">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => go(link.id)}
                    aria-current={active === link.id ? 'location' : undefined}
                    className={active === link.id ? 'is-active' : ''}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="pio-navbar__actions">
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)'}
                className="pio-navbar__utility"
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
              </button>
              <button
                onClick={openSendUsForm}
                title="Open Send Us form"
                className="pio-navbar__utility"
                aria-label="Open Send Us form"
              >
                <Send size={16} />
              </button>
              <button onClick={() => go('partner')} className="pio-navbar__partner">
                <span>Partner With Us</span>
                <ArrowRight size={16} />
              </button>
              <button
                ref={menuButtonRef}
                onClick={() => setOpen((value) => !value)}
                className="pio-navbar__menu-toggle"
                aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={open}
                aria-controls="pio-mobile-navigation"
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div
        className={`pio-navbar__mobile${open ? ' is-open' : ''}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="pio-navbar__backdrop"
          aria-label="Close navigation menu"
          tabIndex={-1}
          onClick={() => setOpen(false)}
        />
        <nav
          ref={menuRef}
          id="pio-mobile-navigation"
          className="pio-navbar__mobile-panel"
          aria-label="Mobile navigation"
          aria-modal="true"
          role="dialog"
        >
          <span className="pio-navbar__mobile-title">Navigation</span>
          <div className="pio-navbar__mobile-links">
            {NAV_LINKS.map((link, index) => (
              <button
                key={link.id}
                data-menu-focus={index === 0 ? '' : undefined}
                onClick={() => go(link.id)}
                aria-current={active === link.id ? 'location' : undefined}
                className={active === link.id ? 'is-active' : ''}
              >
                <span>{link.label}</span>
                {active === link.id && <span className="pio-navbar__active-mark" />}
              </button>
            ))}
          </div>

          <div className="pio-navbar__mobile-actions">
            <button onClick={() => go('partner')} className="pio-navbar__mobile-partner">
              <span>Partner With Us</span>
              <ArrowRight size={17} />
            </button>
            <button onClick={openSendUsForm} className="pio-navbar__mobile-utility">
              <Send size={16} />
              <span>Open Send Us form</span>
            </button>
            <button onClick={toggleFullscreen} className="pio-navbar__mobile-utility">
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
            </button>
            <p>PIO &bull; ₹10 Refreshment &bull; Made in Assam</p>
          </div>
        </nav>
      </div>
    </>
  );
}
