import { Store, Truck, Building2, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};

type PartnerType = {
  id: string;
  title: string;
  icon: typeof Store;
  description: string;
  benefits: string[];
  badge: string;
};

const PARTNER_TYPES: PartnerType[] = [
  {
    id: 'distributor',
    title: 'Become a Distributor',
    icon: Truck,
    description: 'Partner with us to expand PIO across urban and rural markets with high return on investment.',
    benefits: ['Exclusive territory rights', 'Marketing & point-of-sale branding', 'High inventory turnover rate'],
    badge: 'Distribution Network',
  },
  {
    id: 'retailer',
    title: 'Become a Retailer',
    icon: Store,
    description: 'Stock PIO at your store or counter and delight your everyday shoppers with the ₹10 favorite.',
    benefits: ['Attractive counter display racks', 'Fast weekly restocking', 'High consumer repeat purchases'],
    badge: 'Retail Outlets',
  },
  {
    id: 'b2b',
    title: 'B2B & Canteens',
    icon: Building2,
    description: 'Bulk supply for school canteens, college campuses, corporate dining, and events.',
    benefits: ['Customized bulk packaging', 'Aseptic shelf-stability (no chillers required for storage)', 'Dedicated account manager'],
    badge: 'Institutional',
  },
];

export function Partner() {
  const scrollToContact = (id: string) => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const select = document.getElementById('partner-type-select') as HTMLSelectElement | null;
      if (select) {
        if (id === 'distributor') select.value = 'Become a Distributor';
        else if (id === 'retailer') select.value = 'Become a Retailer';
        else if (id === 'b2b') select.value = 'B2B / Institutional';
      }
    }
  };

  return (
    <section id="partner" className="py-20 lg:py-28 bg-[#f8fcf9] border-t border-emerald-900/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        
        <motion.div {...reveal} className="mb-14 text-center max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#0b8043] bg-[#eef8f1] px-4 py-1.5 rounded-full">
            Grow With PIO
          </span>
          <h2 className="mt-4 font-['Space_Grotesk',sans-serif] text-[clamp(2.2rem,6vw,3.75rem)] font-black text-[#083b20] tracking-tight">
            Partner With Us
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#3b5e48]">
            Join our fast-growing distribution and retail network across Assam, Northeast, and pan-India.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:[&>*]:justify-self-center">
          {PARTNER_TYPES.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="w-full rounded-3xl border border-emerald-900/10 bg-white p-5 sm:p-7 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f6ed] text-[#07582f]">
                  <p.icon className="h-6 w-6" />
                </div>
                
                <span className="mt-4 inline-block text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {p.badge}
                </span>

                <h3 className="mt-2 text-xl font-black text-[#083b20]">
                  {p.title}
                </h3>

                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {p.description}
                </p>

                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  {p.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs font-bold text-slate-700">
                      <Check className="h-3.5 w-3.5 text-[#0b8043] mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-5 sm:pt-6">
                <button
                  onClick={() => scrollToContact(p.id)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#f2f8f4] hover:bg-[#07582f] active:bg-[#054022] text-[#07582f] hover:text-white py-3 text-xs font-black uppercase tracking-wider transition-all duration-200 min-h-[44px] cursor-pointer"
                >
                  <span>Enquire Now</span> <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
