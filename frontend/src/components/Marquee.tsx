import { motion, useReducedMotion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const PHRASES = [
  'Har Sip Jio',
  'Born in Assam',
  'No Preservatives',
  'Aseptically Packed',
  'Made for India',
  '160 mL / Rs 10',
  'Generations of Trust',
  'Premium Fruit Beverage',
];

export function Marquee() {
  const prefersReducedMotion = useReducedMotion();
  const items = [...PHRASES, ...PHRASES];
  return (
    <div className="relative isolate overflow-hidden border-y border-[#e9d79e]/25 bg-[#123b2d] py-5 text-[#fff6db]">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#123b2d] to-transparent md:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#123b2d] to-transparent md:w-28" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e9d79e]/70 to-transparent" />
      <motion.div
        className="flex w-max whitespace-nowrap"
        animate={prefersReducedMotion ? undefined : { x: [0, '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((p, i) => (
          <span key={`${p}-${i}`} className="mx-5 flex items-center gap-5 font-display text-base font-semibold uppercase tracking-[0.12em] text-[#fff6db] md:mx-7 md:gap-7 md:text-lg">
            {p}
            <span className="grid size-7 place-items-center rounded-full border border-[#e9d79e]/45 text-[#f1d38a] md:size-8"><Leaf size={14} strokeWidth={1.6} /></span>
          </span>
        ))}
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#e9d79e]/40 to-transparent" />
    </div>
  );
}
