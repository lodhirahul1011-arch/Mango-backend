import { useRef, useState } from 'react';
import { validateContact, type ContactErrors, type ContactForm } from './contactValidation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MapPin, Phone, Send, CheckCircle2, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How should PIO packs be stored?',
    a: 'PIO is an aseptically processed, shelf-stable beverage. Unopened packs can be stored safely at room temperature in a cool, dry place away from direct sunlight. No refrigeration is needed before opening! For best refreshment, chill for an hour before drinking.',
  },
  {
    q: 'What is the shelf life of PIO drinks?',
    a: 'Because of our multilayer aseptic carton packaging that locks out oxygen and light: PIO Mango has a shelf life of 9 months, and PIO Lychee has a shelf life of 6 months from the date of manufacture.',
  },
  {
    q: 'Does PIO contain added artificial preservatives?',
    a: 'No! PIO does not require chemical preservatives. The sterilization process combined with sealed aseptic barrier cartons protects the beverage naturally.',
  },
  {
    q: 'Where is PIO manufactured?',
    a: 'PIO is proudly developed and manufactured in Mangaldai, Assam by Repose Agrotech Pvt Ltd, a unit of the SRD Group with over 90 years of food processing expertise.',
  },
];

const PARTNER_OPTIONS = [
  'Become a Distributor',
  'Become a Retailer',
  'B2B / Institutional',
  'General Consumer Feedback',
];

const FACTORY_MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=Repose%20Agrotech%20Pvt%20Ltd%20Ramhari%20Mangaldai%20Darrang%20Assam%20784125';

export function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [website, setWebsite] = useState('');
  const pending = useRef(false);
  const warmed = useRef(false);
  const [fieldErrors, setFieldErrors] = useState<ContactErrors>({});
  const base = ''; // Website and API share the same Netlify origin.
  const warmBackend = () => {
    if (warmed.current) return;
    warmed.current = true;
    void fetch(base + '/api/health', { signal: AbortSignal.timeout(60000) }).catch(() => {
      warmed.current = false;
    });
  };
  const updateField = (field: keyof ContactForm, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
    setFieldErrors(current => ({ ...current, [field]: undefined }));
    setError('');
  };
  const fieldProps = (field: keyof ContactForm) => ({
    id: field === 'type' ? 'partner-type-select' : 'contact-' + field,
    name: field,
    disabled: submitting,
    'aria-invalid': Boolean(fieldErrors[field]),
    'aria-describedby': fieldErrors[field] ? 'contact-' + field + '-error' : undefined,
    onBlur: () => setFieldErrors(current => ({ ...current, [field]: validateContact(form)[field] })),
  });
  const fieldError = (field: keyof ContactForm) => fieldErrors[field] && (
    <p id={'contact-' + field + '-error'} className="mt-1 text-xs text-red-700">{fieldErrors[field]}</p>
  );
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: PARTNER_OPTIONS[0], message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending.current) return;
    const errors = validateContact(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      console.warn('[PIO contact] Validation failed', { fields: Object.keys(errors) });
      const field = Object.keys(errors)[0];
      document.getElementById(field === 'type' ? 'partner-type-select' : 'contact-' + field)?.focus();
      return;
    }
    pending.current = true;
    setSubmitting(true);
    setError('');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 90000);
    try {
      if (base && !/^https?:\/\//i.test(base)) throw new Error('Contact service is temporarily unavailable. Please call our helpline.');
      console.info('[PIO contact] Sending enquiry', { endpoint: base + '/api/pio/contact' });
      const response = await fetch(base + '/api/pio/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(),
          inquiryType: form.type, message: form.message, website }),
      });
      const result = await response.json().catch(() => null);
      console.info('[PIO contact] API response', { status: response.status, json: result !== null, accepted: result?.emailStatus === 'accepted' });
      if (!result) {
        console.error('[PIO contact] Expected JSON. Check Netlify VITE_CONTACT_API_BASE_URL, rebuild, and verify the Render API route.');
        throw new Error('Contact service is temporarily unavailable. Please call our helpline.');
      }
      if (response.status === 400 && result?.errors) {
        const errors: ContactErrors = {};
        for (const field of ['name', 'phone', 'email', 'type', 'message'] as const) {
          const message = result.errors[field === 'type' ? 'inquiryType' : field];
          if (typeof message === 'string') errors[field] = message;
        }
        setFieldErrors(errors);
      }
      if (!response.ok || result?.emailStatus !== 'accepted') {
        throw new Error(response.status === 429
          ? 'Too many enquiries. Please wait 15 minutes before trying again.'
          : response.status === 400 ? 'Please correct the highlighted details.'
          : 'Your enquiry could not be sent. Please try again or call our helpline.');
      }
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', type: PARTNER_OPTIONS[0], message: '' });
      setWebsite('');
    } catch (failure) {
      console.error('[PIO contact] Submission failed', { category: failure instanceof Error ? failure.name : 'UnknownError', hint: 'Check API status above. Network errors may indicate CORS, an unavailable backend, or an incorrect API URL.' });
      setError(failure instanceof Error && !['AbortError', 'TypeError'].includes(failure.name)
        ? failure.message
        : 'Unable to confirm submission. Please check your connection or call our helpline.');
    } finally {
      window.clearTimeout(timeout);
      pending.current = false;
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-[#ffffff] border-t border-emerald-900/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#0b8043] bg-[#eef8f1] px-4 py-1.5 rounded-full">
            Get in Touch
          </span>
          <h2 className="mt-4 font-['Space_Grotesk',sans-serif] text-[clamp(2.2rem,6vw,3.75rem)] font-black text-[#083b20] tracking-tight">
            Contact & FAQs
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#3b5e48]">
            Have a question, feedback, or business enquiry? We’d love to hear from you.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-12 items-start">
          
          {/* Left Column: FAQ Accordion */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2 mb-4 text-[#07582f] font-extrabold text-sm uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Frequently Asked Questions</span>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={faq.q}
                    className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-[#f9fcf9] transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`contact-faq-panel-${i}`}
                      className="flex w-full items-center justify-between p-5 text-left font-extrabold text-sm sm:text-base text-[#083b20] hover:text-[#0b8043] transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#07582f] transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div id={`contact-faq-panel-${i}`} aria-hidden={!isOpen}>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Contact Info Cards */}
            <div className="mt-8 grid sm:grid-cols-2 gap-3 pt-2">
              <a
                href={FACTORY_MAP_URL}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-[#eef8f1] border border-[#cbe8d3] flex items-start gap-3 transition-colors hover:bg-[#e4f4e9] focus:outline-none focus:ring-2 focus:ring-[#07582f]/30"
                aria-label="Open Factory and Office location in Google Maps"
              >
                <MapPin className="w-5 h-5 text-[#07582f] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-black text-[#083b20]">Factory & Office</div>
                  <div className="text-slate-600 mt-0.5">Mangaldai, Darrang, Assam - 784125</div>
                </div>
              </a>

              <a
                href="tel:+919971918470"
                className="p-4 rounded-2xl bg-[#eef8f1] border border-[#cbe8d3] flex items-start gap-3 transition-colors hover:bg-[#e4f4e9]"
                aria-label="Call Direct Helpline +91 99719 18470"
              >
                <Phone className="w-5 h-5 text-[#07582f] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-black text-[#083b20]">Direct Helpline</div>
                  <span className="text-[#07582f] font-bold mt-0.5 block hover:underline">
                    +91 99719 18470
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-6">
            <div
              id="send-us-form"
              className="scroll-mt-28 rounded-[32px] border border-emerald-900/10 bg-[#f4faf5] p-7 sm:p-10 shadow-lg"
            >
              <h3 className="text-2xl font-black text-[#083b20] mb-2">
                Send Us a Message
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6">
                Fill in your details and our team will get back to you within 24 hours.
              </p>

              {submitted ? (
                <div role="status" className="py-12 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-lg font-black text-emerald-950">Thank you!</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Your enquiry has been accepted for email delivery to our team.
                  </p>
                  <button type="button" onClick={() => setSubmitted(false)} className="text-sm font-bold text-[#07582f] underline">Send another enquiry</button>
                </div>
              ) : (
                <form noValidate onFocusCapture={warmBackend} onSubmit={handleSubmit} className="space-y-4" aria-busy={submitting}>
                  <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label></div>
                  {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text" autoComplete="name"
                        required
                        {...fieldProps('name')}
                        maxLength={100} value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="Rahul Lodhi"
                        className="w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#07582f] focus:ring-1 focus:ring-[#07582f]"
                      />
                      {fieldError('name')}
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel" autoComplete="tel" inputMode="tel"
                        required
                        {...fieldProps('phone')}
                        maxLength={30} value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="+91 99999 99999"
                        className="w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#07582f] focus:ring-1 focus:ring-[#07582f]"
                      />
                      {fieldError('phone')}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email" autoComplete="email"
                      required
                      {...fieldProps('email')}
                        maxLength={254} value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="rahul@example.com"
                      className="w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#07582f] focus:ring-1 focus:ring-[#07582f]"
                    />
                      {fieldError('email')}
                  </div>

                  <div>
                    <label htmlFor="partner-type-select" className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                      Enquiry Purpose
                    </label>
                    <select
                      {...fieldProps('type')}
                      value={form.type}
                      onChange={(e) => updateField('type', e.target.value)}
                      className="w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#07582f] focus:ring-1 focus:ring-[#07582f]"
                    >
                      {PARTNER_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {fieldError('type')}
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                      Message / City & Details (optional)
                    </label>
                    <textarea
                      rows={3}
                      {...fieldProps('message')}
                        maxLength={5000} value={form.message}
                      onChange={(e) => updateField('message', e.target.value)}
                      placeholder="Please mention your location and requirement details..."
                      className="w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#07582f] focus:ring-1 focus:ring-[#07582f] resize-none"
                    />
                      {fieldError('message')}
                  </div>

                  <button
                    type="submit" disabled={submitting}
                    className="disabled:opacity-60 disabled:cursor-wait w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#07582f] hover:bg-[#0a6d3b] text-white py-3.5 text-xs font-black uppercase tracking-wider shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <span>{submitting ? 'Sending enquiry...' : 'Submit Enquiry'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
