import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Facebook, Instagram, MapPin, MessageCircle } from 'lucide-react';
import gsap from 'gsap';

const LINKS = {
  consumers: [
    { label: 'Products', id: 'flavours' },
    { label: 'Our Story', id: 'story' },
    { label: 'Store Locator', id: 'map' },
    { label: 'FAQs', id: 'faq' },
  ],
  business: [
    { label: 'Become a Distributor', id: 'distributor', formValue: 'Become a Distributor' },
    { label: 'Retailer Enquiry', id: 'retailer', formValue: 'Become a Retailer' },
    { label: 'B2B Enquiry', id: 'b2b', formValue: 'B2B / Institutional' },
  ],
};

const SOCIALS = [
  { label: 'Instagram', icon: Instagram, href: '#' },
  { label: 'Facebook', icon: Facebook, href: '#' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Use', href: '#' },
  { label: 'Sales Policy', href: '#' },
  { label: 'Legal', href: '#' },
  { label: 'Site Map', href: '#' },
];

const LOCATION_LINK = '#';

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!footerRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.footer-reveal',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.footer-logo',
        { opacity: 0, y: 14, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBusinessLinkClick = (id: string, formValue: string) => {
    const partnerSection = document.getElementById('contact');
    if (partnerSection) {
      partnerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const select = document.getElementById('partner-type-select') as HTMLSelectElement | null;
    if (select) {
      select.value = formValue;
    }

    if (id) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterSubmitted(true);
  };

  return (
    <footer ref={footerRef} className="relative overflow-hidden border-t border-[#0d3d2d]/10 bg-[radial-gradient(circle_at_top_left,rgba(171,214,186,0.18),transparent_35%),linear-gradient(180deg,#edf7f0_0%,#edf6ef_100%)] text-[#0d3d2d]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-10 top-4 h-36 w-36 rounded-full bg-[#9dd6b7]/20 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-44 w-44 rounded-full bg-[#d9f1dd]/30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_0.9fr]">
          <div className="footer-logo footer-reveal flex flex-col justify-between rounded-[24px] border border-[#0d3d2d]/8 bg-white/30 p-5 backdrop-blur-sm">
            <div>
              <div className="inline-flex rounded-[22px] border border-emerald-900/10 bg-white/75 px-4 py-3 shadow-[0_18px_42px_rgba(7,61,44,0.09)]">
                <img
                  src="/brand/pio-logo-trim.png"
                  alt="PIO"
                  className="brand-logo-lift h-14 w-auto object-contain"
                />
              </div>
              <p className="mt-2 max-w-[290px] text-xl font-black leading-tight text-[#0d3d2d]">
                Har Sip Jio.
              </p>
              <a
                href={LOCATION_LINK}
                target="_blank"
                rel="noreferrer"
                aria-label="Open PIO location on Google Maps"
                className="mt-5 inline-flex max-w-[300px] items-start gap-2 text-[12px] font-semibold uppercase leading-relaxed tracking-[0.06em] text-[#364d43] transition-colors hover:text-[#0d3d2d]"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#07582f]" />
                <span>
                  REPOSE AGROTECH PVT LTD, RAMHARI, MANGALDAI, DARRANG, ASSAM - 784125
                </span>
              </a>
            </div>

            <div className="mt-5 inline-flex max-w-max items-center gap-2 rounded-full bg-[#0d3d2d] px-3 py-2 shadow-[0_16px_34px_rgba(7,61,44,0.16)]">
              <img
                src="/brand/rb-white-logo-trim.png"
                alt="Repose"
                className="h-5 w-auto object-contain"
              />
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/75">Repose Brand</span>
            </div>
          </div>

          <div className="footer-reveal rounded-[24px] border border-[#0d3d2d]/8 bg-white/20 p-5 backdrop-blur-sm">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d3d2d]/70">For Consumers</h4>
            <ul className="mt-4 space-y-2.5">
              {LINKS.consumers.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.id)}
                    className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-[#364d43] transition-colors duration-300 hover:text-[#0d3d2d]"
                  >
                    <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#0d3d2d] after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                      {link.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-reveal rounded-[24px] border border-[#0d3d2d]/8 bg-white/20 p-5 backdrop-blur-sm">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d3d2d]/70">For Business</h4>
            <ul className="mt-4 space-y-2.5">
              {LINKS.business.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleBusinessLinkClick(link.id, link.formValue)}
                    className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-[#364d43] transition-colors duration-300 hover:text-[#0d3d2d]"
                  >
                    <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#0d3d2d] after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                      {link.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-reveal rounded-[24px] border border-[#0d3d2d]/8 bg-white/20 p-5 backdrop-blur-sm">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d3d2d]/70">Connect</h4>
            <div className="mt-4 flex flex-col items-start gap-2.5">
              <a
                href="https://wa.me/919971918470"
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with PIO on WhatsApp"
                className="group inline-flex items-center gap-2 rounded-full bg-[#07582f] px-4 py-2.5 text-[12px] font-black uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0a6d3b]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>

              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="group inline-flex items-center gap-2 text-[13px] font-medium text-[#364d43] transition-colors duration-300 hover:text-[#0d3d2d]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#0d3d2d]/10 bg-white/70 text-[#0d3d2d] transition-all duration-300 group-hover:bg-[#0d3d2d] group-hover:text-white">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#0d3d2d] after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                    {label}
                  </span>
                </a>
              ))}

              {newsletterSubmitted ? (
                <p role="status" className="w-full rounded-xl border border-[#0d3d2d]/10 bg-white/60 px-3 py-3 text-center text-[13px] font-medium text-[#364d43]">
                  Thanks for your interest.
                </p>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex w-full items-center gap-1 rounded-xl border border-[#0d3d2d]/10 bg-white/60 p-1.5"
                >
                  <label className="sr-only" htmlFor="footer-newsletter-email">Your email</label>
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(event) => setNewsletterEmail(event.target.value)}
                    placeholder="Your email"
                    className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-3 text-[13px] font-medium text-[#364d43] outline-none placeholder:text-[#536a60]"
                  />
                  <button
                    type="submit"
                    className="min-h-11 rounded-lg bg-[#0d3d2d] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#07582f] focus:outline-none focus:ring-2 focus:ring-[#07582f]/30 focus:ring-offset-2"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="footer-reveal mt-6 border-t border-[#0d3d2d]/10 pt-4">
          <div className="flex flex-col gap-4 text-[11px] font-medium text-[#536a60] lg:flex-row lg:items-center lg:justify-between">
            <p>Copyright &copy; {new Date().getFullYear()} PIO by Repose Agrotech Pvt Ltd. All rights reserved.</p>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              {LEGAL_LINKS.map((link, index) => (
                <span key={link.label} className="inline-flex items-center gap-2">
                  <a href={link.href} className="text-[#1f3d32] transition-colors hover:text-[#0d3d2d] hover:underline">
                    {link.label}
                  </a>
                  {index < LEGAL_LINKS.length - 1 && <span className="text-[#536a60]/55">|</span>}
                </span>
              ))}
            </div>

            <p className="text-[#1f3d32]">India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
