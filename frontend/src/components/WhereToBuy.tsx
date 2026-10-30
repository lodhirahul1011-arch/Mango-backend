import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, MapPin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// 3D MINIATURE RETAIL WORLD
// ---------------------------------------------------------------------------

// Miniature Store / Kiosk
function MiniStore() {
  return (
    <group position={[0, 0.45, 0]}>
      {/* Main Kiosk Building */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.7, 0.9]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.05} />
      </mesh>

      {/* Roof / Green Canopy */}
      <mesh position={[0, 0.75, 0.05]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[1.35, 0.12, 1.05]} />
        <meshStandardMaterial color="#07582f" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* PIO Green Brand Banner on front */}
      <mesh position={[0, 0.52, 0.455]} castShadow>
        <boxGeometry args={[0.9, 0.18, 0.01]} />
        <meshStandardMaterial color="#0b8043" roughness={0.2} />
      </mesh>

      {/* Front Window Counter */}
      <mesh position={[0, 0.22, 0.455]}>
        <boxGeometry args={[0.75, 0.3, 0.01]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.65} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.06, 0.52]} castShadow>
        <boxGeometry args={[0.85, 0.05, 0.16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} />
      </mesh>
    </group>
  );
}

// 3D Map Pin with smooth growth
function LocationPin({ pinScale }: { pinScale: number }) {
  return (
    <group position={[0, 1.45, 0]} scale={pinScale}>
      {/* Pin Head */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.22, 24, 20]} />
        <meshStandardMaterial
          color="#ef4444"
          roughness={0.2}
          metalness={0.1}
          emissive="#b91c1c"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Pin Inner Dot */}
      <mesh position={[0, 0.3, 0.18]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </mesh>
      {/* Pin Cone Needle */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.15, 0.3, 20]} />
        <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.1} />
      </mesh>
    </group>
  );
}

// PIO Retail Crates & Cartons outside store
function RetailPacks({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <group position={[0.85, 0.3, 0.3]}>
      {/* PIO Mango Crate */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.4, 0.16, 0.3]} />
        <meshStandardMaterial color="#d97706" roughness={0.6} />
      </mesh>
      {/* Tiny PIO Mango carton */}
      <mesh position={[-0.08, 0.24, 0]} castShadow>
        <boxGeometry args={[0.12, 0.22, 0.08]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.2} />
      </mesh>
      {/* Tiny PIO Lychee carton */}
      <mesh position={[0.08, 0.24, 0]} castShadow>
        <boxGeometry args={[0.12, 0.22, 0.08]} />
        <meshStandardMaterial color="#f43f5e" roughness={0.2} />
      </mesh>
    </group>
  );
}

// Foliage / Trees on Island
function MiniTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.4, 10]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {/* Green foliage cone/sphere */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.26, 16, 14]} />
        <meshStandardMaterial color="#16a34a" roughness={0.5} />
      </mesh>
    </group>
  );
}

// Miniature Floating Island Base with Curved Road
function FloatingIsland({
  scrollProgress,
  pointer,
}: {
  scrollProgress: React.MutableRefObject<number>;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const islandRef = useRef<THREE.Group>(null!);
  const [pinScale, setPinScale] = useState(0);
  const [cartonsVisible, setCartonsVisible] = useState(false);

  useFrame(() => {
    if (!islandRef.current) return;
    const p = scrollProgress.current; // 0 to 1

    // 0-25%: Island rises into view
    const targetY = THREE.MathUtils.lerp(-1.2, 0, Math.min(1, p * 3.5));
    islandRef.current.position.y = THREE.MathUtils.lerp(islandRef.current.position.y, targetY, 0.08);

    // 25-50%: Camera/Island rotates 15-20 deg (0.35 rad)
    const targetRotY = THREE.MathUtils.lerp(-0.35, 0.2, p);
    islandRef.current.rotation.y = THREE.MathUtils.lerp(islandRef.current.rotation.y, targetRotY, 0.05);

    // Mouse tilt (desktop)
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      islandRef.current.rotation.x = THREE.MathUtils.lerp(
        islandRef.current.rotation.x,
        -pointer.current.y * 0.06,
        0.05
      );
    }

    // 50-75%: Location pin grows upward
    if (p > 0.4) {
      const pinProgress = Math.min(1, (p - 0.4) * 3.5);
      setPinScale(pinProgress);
    } else {
      setPinScale(0);
    }

    // 75-100%: Cartons become visible
    setCartonsVisible(p > 0.65);
  });

  return (
    <group ref={islandRef} position={[0, -1.2, 0]}>
      {/* Island Top Grass Surface */}
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.2, 2.3, 0.25, 36]} />
        <meshStandardMaterial color="#22c55e" roughness={0.6} />
      </mesh>

      {/* Curved Asphalt Road */}
      <mesh position={[0, 0.18, 0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0.9, 1.35, 32, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Earth / Rock base below grass */}
      <mesh position={[0, -0.65, 0]} receiveShadow>
        <coneGeometry args={[2.2, 1.2, 36]} />
        <meshStandardMaterial color="#854d0e" roughness={0.9} />
      </mesh>

      {/* Soft stylized clouds below island */}
      <mesh position={[-1.2, -1.1, 0.4]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.75} roughness={0.1} />
      </mesh>
      <mesh position={[1.1, -1.0, -0.3]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.75} roughness={0.1} />
      </mesh>

      {/* Buildings & Island elements */}
      <MiniStore />
      <LocationPin pinScale={pinScale} />
      <RetailPacks visible={cartonsVisible} />

      {/* Trees */}
      <MiniTree position={[-1.2, 0.18, 0.4]} />
      <MiniTree position={[-0.9, 0.18, -0.7]} />
      <MiniTree position={[1.2, 0.18, -0.5]} />

      {/* Ground Contact Shadow */}
      <ContactShadows position={[0, -1.4, 0]} opacity={0.35} scale={6} blur={2.5} far={3} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// MAIN WHERE TO BUY COMPONENT
// ---------------------------------------------------------------------------
export function WhereToBuy() {
  const [pincode, setPincode] = useState('');
  const [searched, setSearched] = useState(false);
  const sectionRef = useRef<HTMLElement>(null!);
  const scrollProgress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) return;

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      },
    });

    const handlePointer = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handlePointer);

    return () => window.removeEventListener('mousemove', handlePointer);
  }, [prefersReduced]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="where-to-buy"
      ref={sectionRef}
      className="py-20 lg:py-28 bg-[#ffffff] overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        
        <div className="grid items-center gap-10 lg:grid-cols-12 rounded-[36px] border border-emerald-900/10 bg-gradient-to-br from-[#f8fdf9] via-[#edf7f0] to-[#e6f4ea] p-8 sm:p-12 lg:p-16 overflow-hidden relative shadow-lg">
          
          {/* Left Text & Location Finder Box */}
          <div className="lg:col-span-6 space-y-5 relative z-10">
            {/*
            <span className="inline-block text-xs font-black uppercase tracking-[0.25em] text-[#07582f] bg-white px-3.5 py-1.5 rounded-full shadow-2xs">
              Where to Buy
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-[#083b20] tracking-tight leading-tight">
              Available at your<br />
              <span className="text-[#07582f]">nearby stores.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#30523d] leading-relaxed font-medium">
              Found across local grocery stores, modern retail shops, and school canteens across Assam and Northeast India — and expanding rapidly!
            </p>
            */}

            {/* Quick Locator Box */}
            <div className="max-w-md pt-2">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value); setSearched(false); }}
                  placeholder="Enter Pincode or City (e.g. 784125, Guwahati)"
                  className="flex-1 rounded-full border border-emerald-900/20 bg-white px-5 py-3 text-sm font-semibold text-emerald-950 placeholder:text-slate-400 focus:outline-none focus:border-[#07582f]"
                />
                <button 
                  onClick={() => setSearched(true)}
                  className="rounded-full bg-[#07582f] hover:bg-[#0a6d3b] text-white px-6 py-3 text-xs font-black uppercase tracking-wider shadow-sm transition-all shrink-0 hover:scale-105 active:scale-95"
                >
                  FIND NEAR YOU →
                </button>
              </div>

              {searched && (
                <div className="mt-3 p-3.5 rounded-2xl bg-white border border-emerald-900/10 text-xs text-[#07582f] font-bold shadow-2xs flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Available at 500+ verified retail points in your area. Look for the green PIO counter rack!</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => go('partner')}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#07582f] hover:underline"
              >
                Become a Retailer / Distributor <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Miniature 3D Floating Retail Island Canvas */}
          <div className="lg:col-span-6 relative w-full h-[380px] sm:h-[460px] lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#f0fdf4] via-[#ecfdf5] to-[#d1fae5] border border-emerald-900/10 shadow-sm flex items-center justify-center">
            {!prefersReduced ? (
              <Canvas
                dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
                camera={{ position: [2.8, 2.5, 4.2], fov: 42 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
              >
                <ambientLight intensity={0.75} />
                <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" castShadow />
                <directionalLight position={[-4, 2, -2]} intensity={0.35} color="#86efac" />
                <pointLight position={[0, 4, 2]} intensity={0.5} color="#fef08a" />
                <Environment preset="park" />
                <FloatingIsland scrollProgress={scrollProgress} pointer={pointer} />
              </Canvas>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-6">
                <img 
                  src="/images/where-to-buy-card.jpg" 
                  alt="Where to Buy Store Kiosk Illustration" 
                  className="w-full h-auto max-w-sm rounded-3xl object-cover shadow-md border border-white"
                />
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
