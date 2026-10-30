import { Award, Droplets, Factory, Leaf, PackageCheck, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const PILLARS = [
  { icon: ShieldCheck, title: 'Food Safety First', text: 'Modern, state-of-the-art manufacturing facilities designed to meet the highest food safety standards.' },
  { icon: Leaf, title: 'Quality Ingredients', text: 'From the ingredients we choose to the way our beverages are processed, every part is designed with quality in mind.' },
  { icon: PackageCheck, title: 'Aseptic Packaging', text: 'Packed in multilayer Tetra Pak cartons that protect the beverage from light, oxygen and microbial contamination.' },
  { icon: Droplets, title: 'No Preservatives', text: 'Pio does not require added preservatives to achieve its shelf stability, just pure refreshment.' },
];

export function Quality() {
  return (
    <section id="quality" className="relative overflow-hidden bg-[#050505] px-5 py-28 sm:px-8 lg:py-36">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#050505,#080808_45%,#050505),radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_38%)]" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-white/60">
            <Award className="h-4 w-4 text-mango-300" />
            Manufacturing & Quality
          </div>
          <h2 className="font-display text-5xl font-black uppercase leading-[0.88] tracking-[-0.07em] text-white sm:text-7xl">
            Quality is not a feature. It is our foundation.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/58">
            When you have been in the food business for generations, you learn that people do not just buy products. They put their trust in them.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-px overflow-hidden border border-white/10 lg:grid-cols-4">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.65, delay: i * 0.08 }}
                className="group bg-white/[0.035] p-7 transition-colors hover:bg-white/[0.07]"
              >
                <div className="mb-8 flex h-14 w-14 items-center justify-center border border-white/15 bg-black text-mango-200">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-[-0.02em] text-white">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/56">{p.text}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
          className="glass-panel mt-16 grid gap-8 p-7 lg:grid-cols-[0.7fr_1.3fr] lg:p-10"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center border border-mango-300/25 bg-mango-300/10 text-mango-200">
              <Factory className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-white/42">Origin</p>
              <p className="font-display text-3xl font-black uppercase tracking-[-0.06em] text-white">Made in Assam</p>
            </div>
          </div>
          <p className="text-xl leading-relaxed text-white/72">
            Pio is made in Assam using modern, state-of-the-art manufacturing facilities, bringing together the experience of generations with the standards of a new-age beverage brand.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
