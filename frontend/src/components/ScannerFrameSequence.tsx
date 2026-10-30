import { useRef } from 'react';
import { ArrowDown, Leaf, ArrowUpRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { frameUrl, useFlavourFrames } from '@/hooks/useFlavourFrames';
import './ScannerFrameSequence.css';

export function ScannerFrameSequence({ flavour }: { flavour: 'mango' | 'lychee' }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const mango = flavour === 'mango';
  useFlavourFrames({ flavour, count: mango ? 89 : 57, sectionRef, canvasRef, progressRef, start: 'top 85%', end: 'bottom 25%' });
  return (
    <div ref={sectionRef} className={`pack-editorial ${mango ? 'pack-editorial--mango' : 'pack-editorial--lychee'}`} data-local-motion="true">
      <div className="pack-editorial__header">
        <span className="pack-editorial__eyebrow"><span /> THE FRUIT COLLECTION</span>
        <span className="pack-editorial__edition">{mango ? '01' : '02'} / 02</span>
      </div>
      <div className="pack-editorial__title">
        <h3>{mango ? 'A sip of ' : 'Your little '}<em>{mango ? 'sunshine.' : 'sweet escape.'}</em></h3>
        <span>{mango ? 'ALPHONSO MANGO' : 'FLORAL LYCHEE'}</span>
      </div>
      <div className="pack-editorial__film">
        <img src={frameUrl(flavour, 0)} alt={`PIO ${mango ? 'Mango' : 'Lychee'} pack in a sunlit fruit orchard`} width="540" height="960" loading="lazy" />
        <canvas ref={canvasRef} width="540" height="960" aria-hidden="true" />
      </div>
      <div className="pack-editorial__bottom">
        <div className="pack-editorial__signature"><Leaf size={14} /><span>Fruity. Refreshing. PIO.</span></div>
        <div className="pack-editorial__details">
          <div><span className="pack-editorial__label">YOUR EVERYDAY SIP</span><strong>160 ml <span>/ Grab &amp; go</span></strong></div>
          <div className="pack-editorial__price"><span className="pack-editorial__label">JUST</span><strong>&#8377;10<ArrowUpRight size={23} /></strong></div>
        </div>
        {!reducedMotion && <div className="pack-editorial__scroll"><ArrowDown size={12} /><span>SCROLL TO EXPLORE</span><div className="pack-editorial__track" aria-hidden="true"><div ref={progressRef} /></div></div>}
      </div>
    </div>
  );
}
