import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Cleanup = () => void;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const inLocalMotion = (el: Element) =>
  Boolean(el.closest('[data-local-motion="true"], canvas, .hero-mobile-art, .hero-desktop-box'));

function revealHeadings(root: HTMLElement, isMobile: boolean) {
  const headings = Array.from(
    root.querySelectorAll<HTMLElement>('main section:not(#home) h1, main section:not(#home) h2')
  ).filter((heading) => !inLocalMotion(heading));

  headings.forEach((heading) => {
    heading.classList.add('pio-motion-heading');
    gsap.fromTo(
      heading,
      {
        autoAlpha: 0,
        yPercent: isMobile ? 22 : 34,
        clipPath: 'inset(0 0 100% 0)',
        letterSpacing: '0.01em',
      },
      {
        autoAlpha: 1,
        yPercent: 0,
        clipPath: 'inset(0 0 0% 0)',
        letterSpacing: '-0.035em',
        duration: isMobile ? 0.75 : 1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: heading,
          start: isMobile ? 'top 88%' : 'top 82%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });
}

function revealCopy(root: HTMLElement, isMobile: boolean) {
  const copyBlocks = Array.from(
    root.querySelectorAll<HTMLElement>(
      'main section:not(#home) p, main section:not(#home) .eyebrow, main section:not(#home) [class*="tracking-"]'
    )
  ).filter((el) => !inLocalMotion(el) && el.textContent?.trim());

  copyBlocks.forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: isMobile ? 14 : 22 },
      {
        autoAlpha: 1,
        y: 0,
        duration: isMobile ? 0.55 : 0.72,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: isMobile ? 'top 92%' : 'top 88%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });
}

function revealCards(root: HTMLElement, isMobile: boolean) {
  const sections = Array.from(root.querySelectorAll<HTMLElement>('main section:not(#home)'));

  sections.forEach((section) => {
    if (section.id === 'map') return;

    const cards = Array.from(
      section.querySelectorAll<HTMLElement>(
        'article, li, [class*="rounded-2xl"], [class*="rounded-3xl"], [class*="rounded-["]'
      )
    ).filter((el) => {
      const className = el.className.toString();
      const rect = el.getBoundingClientRect();
      return (
        !inLocalMotion(el) &&
        rect.height > 42 &&
        rect.width > 90 &&
        (className.includes('bg-') || className.includes('border') || className.includes('shadow'))
      );
    });

    if (!cards.length) return;
    cards.forEach((card) => card.classList.add('pio-spotlight-card'));

    gsap.fromTo(
      cards.slice(0, isMobile ? 8 : 14),
      {
        autoAlpha: 0,
        y: isMobile ? 18 : 32,
        scale: isMobile ? 0.985 : 0.965,
      },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: isMobile ? 0.58 : 0.82,
        ease: 'power3.out',
        stagger: isMobile ? 0.045 : 0.075,
        scrollTrigger: {
          trigger: section,
          start: isMobile ? 'top 82%' : 'top 72%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });
}

function revealImages(root: HTMLElement, isMobile: boolean) {
  const images = Array.from(
    root.querySelectorAll<HTMLImageElement>('main section:not(#home) img')
  ).filter((img) => !inLocalMotion(img) && img.clientWidth > 80 && img.clientHeight > 80);

  images.forEach((img) => {
    img.parentElement?.classList.add('pio-image-reveal');

    gsap.fromTo(
      img,
      {
        autoAlpha: 0,
        y: isMobile ? 16 : 28,
        scale: 1.055,
        filter: isMobile ? 'none' : 'blur(5px)',
      },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: isMobile ? 0.7 : 1.05,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: img,
          start: isMobile ? 'top 92%' : 'top 84%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });
}

function addSectionAtmosphere(root: HTMLElement, isMobile: boolean) {
  const sections = Array.from(root.querySelectorAll<HTMLElement>('main section:not(#home)'));

  sections.forEach((section, index) => {
    if (inLocalMotion(section)) return;
    section.classList.add('pio-premium-section');
    section.style.setProperty('--section-index', String(index));

    if (isMobile) return;

    const visuals = Array.from(
      section.querySelectorAll<HTMLElement>('[data-parallax], [class*="blur-"]')
    ).filter((el) => !inLocalMotion(el));

    visuals.slice(0, 4).forEach((visual, visualIndex) => {
      gsap.to(visual, {
        y: visualIndex % 2 === 0 ? -18 : 18,
        x: visualIndex % 2 === 0 ? 8 : -8,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.1,
        },
      });
    });

    const floatingBits = Array.from(
      section.querySelectorAll<HTMLElement>('.depth-near, .depth-far, .lab-orbit, [class*="Sparkles"]')
    ).filter((el) => !inLocalMotion(el));

    floatingBits.slice(0, 8).forEach((bit, bitIndex) => {
      gsap.to(bit, {
        y: bitIndex % 2 === 0 ? -7 : 7,
        rotate: bitIndex % 2 === 0 ? 1.8 : -1.8,
        duration: 4.8 + bitIndex * 0.35,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    });
  });
}

function installPointerSpotlight(root: HTMLElement): Cleanup {
  if (isTouchDevice()) return () => undefined;

  const move = (event: PointerEvent) => {
    root.style.setProperty('--pio-pointer-x', `${event.clientX}px`);
    root.style.setProperty('--pio-pointer-y', `${event.clientY}px`);
  };

  window.addEventListener('pointermove', move, { passive: true });
  return () => window.removeEventListener('pointermove', move);
}

function enhanceButtons(root: HTMLElement): Cleanup {
  const buttons = Array.from(root.querySelectorAll<HTMLElement>('button, a[href]')).filter((el) => {
    if (inLocalMotion(el)) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 38 && rect.height > 30 && el.className.toString().includes('rounded');
  });

  buttons.forEach((button) => button.classList.add('pio-premium-control'));

  if (isTouchDevice()) return () => undefined;

  const cleanups = buttons.map((button) => {
    const xTo = gsap.quickTo(button, 'x', { duration: 0.32, ease: 'power3.out' });
    const yTo = gsap.quickTo(button, 'y', { duration: 0.32, ease: 'power3.out' });
    const arrow = button.querySelector<HTMLElement>('svg:last-child');
    const arrowXTo = arrow ? gsap.quickTo(arrow, 'x', { duration: 0.24, ease: 'power3.out' }) : null;
    const arrowYTo = arrow ? gsap.quickTo(arrow, 'y', { duration: 0.24, ease: 'power3.out' }) : null;

    const move = (event: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
      xTo(gsap.utils.clamp(-5, 5, x));
      yTo(gsap.utils.clamp(-4, 4, y));
      arrowXTo?.(3);
      arrowYTo?.(-2);
    };

    const leave = () => {
      xTo(0);
      yTo(0);
      arrowXTo?.(0);
      arrowYTo?.(0);
    };

    button.addEventListener('mousemove', move);
    button.addEventListener('mouseleave', leave);

    return () => {
      button.removeEventListener('mousemove', move);
      button.removeEventListener('mouseleave', leave);
      gsap.set(button, { clearProps: 'x,y' });
      if (arrow) gsap.set(arrow, { clearProps: 'x,y' });
    };
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}

function morphPageTone(root: HTMLElement) {
  const tones = ['#f8f6ef', '#fff7df', '#fff1f5', '#f3faef', '#fbfaf2', '#ffffff'];
  const sections = Array.from(root.querySelectorAll<HTMLElement>('main section:not(#home)'));

  sections.forEach((section, index) => {
    gsap.to(document.documentElement, {
      '--warm-white': tones[index % tones.length],
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        end: 'top 22%',
        scrub: 1.2,
      },
    });
  });
}

export function initPioMotion(root: HTMLElement): Cleanup {
  if (prefersReducedMotion()) return () => undefined;

  let cleanupButtons: Cleanup = () => undefined;
  let cleanupSpotlight: Cleanup = () => undefined;
  const mm = gsap.matchMedia();
  const ctx = gsap.context(() => {
    mm.add(
      {
        isDesktop: '(min-width: 1024px)',
        isMobile: '(max-width: 1023px)',
      },
      (context) => {
        const isMobile = Boolean(context.conditions?.isMobile);
        addSectionAtmosphere(root, isMobile);
        revealHeadings(root, isMobile);
        revealCopy(root, isMobile);
        revealCards(root, isMobile);
        revealImages(root, isMobile);
        morphPageTone(root);
        cleanupButtons = enhanceButtons(root);
        cleanupSpotlight = installPointerSpotlight(root);

        const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 180);
        return () => {
          window.clearTimeout(refresh);
          cleanupButtons();
          cleanupSpotlight();
        };
      }
    );
  }, root);

  return () => {
    cleanupButtons();
    cleanupSpotlight();
    mm.revert();
    ctx.revert();
  };
}
