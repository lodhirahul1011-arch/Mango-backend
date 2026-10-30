import { useEffect, useRef } from 'react';

import { Navbar } from '@/components/Navbar';
import { ScrollProgress } from '@/components/ScrollProgress';
import { MouseProvider } from '@/components/MouseProvider';
import { ScrollHero } from '@/components/ScrollHero';
import { OrangeTraveller } from '@/components/OrangeTraveller';
import { Flavours } from '@/components/BrandSections';
import { FlavourFrameStories } from '@/components/FlavourFrameStories';
import { InteractiveMap } from '@/components/InteractiveMap';
import { Partner } from '@/components/Partner';
import { Contact } from '@/components/Contact';
import { OurStory } from '@/components/OurStory';
import { PioMoments } from '@/components/PioMoments';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Footer } from '@/components/Footer';
import { initPioMotion } from '@/utils/motionSystem';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!appRef.current) return;
    return initPioMotion(appRef.current);
  }, []);

  return (
    <MouseProvider>
      <div ref={appRef} className="relative min-h-screen bg-white text-[#10271b] selection:bg-emerald-200 selection:text-emerald-950">
        {/* Global Reading Scroll Progress */}
        <ScrollProgress />

        <OrangeTraveller />

        {/* Sleek Navigation Bar */}
        <Navbar />

        <main className="relative z-10">
          {/* 1. Lightweight image hero */}
          <ScrollHero />

          {/* 2. Signature Flavours Showcase (Alphonso Mango & Floral Lychee) */}
          <Flavours />

          <FlavourFrameStories />

          <OurStory />

          <PioMoments />

          {/* 8. Interactive Distribution Network & Store Locator Map */}
          <InteractiveMap />

          {/* 10. Partner With Us (Distributor, Retailer, Institutional) */}
          <Partner />

          {/* 11. Contact */}
          <Contact />
        </main>

        {/* Global Brand Footer */}
        <Footer />
      </div>
    </MouseProvider>
  );
}

export default App;
