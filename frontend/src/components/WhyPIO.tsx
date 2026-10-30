import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// 3D REAL PRODUCT PACKS (MAPPED WITH REAL UPLOADED ARTWORK)
// ---------------------------------------------------------------------------

// Real PIO Mango Carton: Front-facing 3D Tetra Pack with real pack texture
function RealMangoCarton({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const texture = useTexture('/images/pio-mango-lossless.webp');
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  // Real 160ml tetra pack aspect ratio (width: 1.0, height: 1.45, depth: 0.52)
  const width = 1.05;
  const height = 1.52;
  const depth = 0.54;

  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* 3D Tetra Pack Body with realistic side/top colors */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        {/* Six face materials: [right, left, top, bottom, front, back] */}
        <meshStandardMaterial attach="material-0" color="#eab308" roughness={0.25} metalness={0.05} />
        <meshStandardMaterial attach="material-1" color="#ca8a04" roughness={0.25} metalness={0.05} />
        <meshStandardMaterial attach="material-2" color="#a16207" roughness={0.3} metalness={0.08} />
        <meshStandardMaterial attach="material-3" color="#78350f" roughness={0.4} />
        {/* Front panel with high-res real PIO packaging art */}
        <meshStandardMaterial
          attach="material-4"
          map={texture}
          transparent={true}
          roughness={0.2}
          metalness={0.03}
        />
        <meshStandardMaterial attach="material-5" color="#d97706" roughness={0.3} />
      </mesh>

      {/* Top Gable Straw Port & Seal Bar for realistic tetra-pack feel */}
      <mesh position={[0, height / 2 + 0.04, 0]} castShadow>
        <boxGeometry args={[width * 0.98, 0.08, depth * 0.9]} />
        <meshStandardMaterial color="#b45309" roughness={0.35} metalness={0.1} />
      </mesh>
      {/* Attached Straw Detail */}
      <mesh position={[width * 0.3, height / 2 + 0.05, 0]} rotation={[0, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.05} />
      </mesh>
    </group>
  );
}

// Real PIO Lychee Carton: Front-facing 3D Tetra Pack with real pack texture
function RealLycheeCarton({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const texture = useTexture('/images/pio-lychee-lossless.webp');
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  const width = 1.05;
  const height = 1.52;
  const depth = 0.54;

  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* 3D Tetra Pack Body with realistic side/top colors */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        {/* Six face materials: [right, left, top, bottom, front, back] */}
        <meshStandardMaterial attach="material-0" color="#f43f5e" roughness={0.25} metalness={0.05} />
        <meshStandardMaterial attach="material-1" color="#e11d48" roughness={0.25} metalness={0.05} />
        <meshStandardMaterial attach="material-2" color="#be123c" roughness={0.3} metalness={0.08} />
        <meshStandardMaterial attach="material-3" color="#881337" roughness={0.4} />
        {/* Front panel with high-res real PIO packaging art */}
        <meshStandardMaterial
          attach="material-4"
          map={texture}
          transparent={true}
          roughness={0.2}
          metalness={0.03}
        />
        <meshStandardMaterial attach="material-5" color="#9f1239" roughness={0.3} />
      </mesh>

      {/* Top Gable Straw Port & Seal Bar */}
      <mesh position={[0, height / 2 + 0.04, 0]} castShadow>
        <boxGeometry args={[width * 0.98, 0.08, depth * 0.9]} />
        <meshStandardMaterial color="#9f1239" roughness={0.35} metalness={0.1} />
      </mesh>
      {/* Attached Straw Detail */}
      <mesh position={[width * 0.3, height / 2 + 0.05, 0]} rotation={[0, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.05} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4 BRAND-CONNECTED 3D BENEFIT ELEMENTS
// ---------------------------------------------------------------------------

// 1. ₹10 VALUE — Bold, glossy green-gold 3D medallion near lower-left of product cluster
function GlossyRupeeMedallion({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0.15, 0.3, 0]}>
      {/* Heavy Gold/Green Outer Medallion */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.12, 48]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.1} metalness={0.85} />
      </mesh>
      {/* Green Inner Bezel */}
      <mesh position={[0, 0.062, 0]}>
        <cylinderGeometry args={[0.41, 0.41, 0.015, 48]} />
        <meshStandardMaterial color="#07582f" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Outer Torus Rim */}
      <mesh castShadow>
        <torusGeometry args={[0.48, 0.035, 16, 48]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.08} metalness={0.9} />
      </mesh>
      {/* 3D ₹ symbol bar accents */}
      <mesh position={[0, 0.075, 0]} castShadow>
        <boxGeometry args={[0.28, 0.04, 0.02]} />
        <meshStandardMaterial color="#fef08a" roughness={0.1} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.075, 0.09]} castShadow>
        <boxGeometry args={[0.22, 0.035, 0.02]} />
        <meshStandardMaterial color="#fef08a" roughness={0.1} metalness={0.8} />
      </mesh>
    </group>
  );
}

// 2. REAL FRUIT — Mango slice near Mango pack + Peeled lychee near Lychee pack
function MangoSliceItem({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0.4, -0.3, 0.5]}>
      {/* Realistic Mango Slice */}
      <mesh castShadow>
        <sphereGeometry args={[0.32, 24, 18, 0, Math.PI, 0, Math.PI * 0.7]} />
        <meshStandardMaterial
          color="#f59e0b"
          roughness={0.22}
          metalness={0.02}
        />
      </mesh>
      {/* Mango Cube Accent */}
      <mesh position={[0.2, 0.25, 0.1]} rotation={[0.2, 0.4, 0.1]} castShadow>
        <boxGeometry args={[0.18, 0.18, 0.18]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.25} metalness={0.02} />
      </mesh>
    </group>
  );
}

function LycheeFruitItem({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[-0.2, 0.4, 0]}>
      {/* Peeled Translucent Lychee Flesh */}
      <mesh castShadow>
        <sphereGeometry args={[0.26, 24, 20]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.12}
          transmission={0.75}
          thickness={0.65}
          ior={1.4}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>
      {/* Lychee Shell Accent */}
      <mesh position={[-0.15, -0.15, -0.05]} castShadow>
        <sphereGeometry args={[0.22, 20, 16, 0, Math.PI * 1.5, 0, Math.PI * 0.7]} />
        <meshStandardMaterial color="#e11d48" roughness={0.45} />
      </mesh>
    </group>
  );
}

// 3. NO ADDED PRESERVATIVES — Transparent glass shield with delicate green leaf detail
function GlassShieldBenefit({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[-0.1, 0.2, 0]}>
      {/* Physical Glass Shield */}
      <mesh castShadow>
        <sphereGeometry args={[0.38, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
        <meshPhysicalMaterial
          color="#a7f3d0"
          transparent
          opacity={0.45}
          roughness={0.06}
          transmission={0.85}
          thickness={0.6}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
      {/* Embedded Green Leaf Accent */}
      <mesh position={[0, 0.08, 0.04]} rotation={[0.3, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.015, 0.14, 0.32, 12]} />
        <meshStandardMaterial color="#059669" roughness={0.25} />
      </mesh>
    </group>
  );
}

// 4. REFRESHING TASTE — Crystal-clear water droplet or splash orb
function CrystalWaterDroplet({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <sphereGeometry args={[0.28, 32, 32]} />
      <meshPhysicalMaterial
        color="#bae6fd"
        transparent
        opacity={0.35}
        roughness={0.0}
        metalness={0.04}
        transmission={0.94}
        thickness={0.9}
        ior={1.48}
        clearcoat={1}
        clearcoatRoughness={0.02}
      />
    </mesh>
  );
}

// Subtle Floating Leaves & Particles
function FloatingDecor() {
  return (
    <group>
      {/* Floating green leaf 1 */}
      <Float speed={2.0} rotationIntensity={0.2} floatIntensity={0.35}>
        <mesh position={[-0.8, 1.45, 0.2]} rotation={[0.4, 0.3, 0.5]} castShadow>
          <cylinderGeometry args={[0.02, 0.15, 0.34, 12]} />
          <meshStandardMaterial color="#16a34a" roughness={0.35} />
        </mesh>
      </Float>
      {/* Floating green leaf 2 */}
      <Float speed={1.8} rotationIntensity={0.18} floatIntensity={0.3}>
        <mesh position={[1.4, -0.9, 0.4]} rotation={[-0.3, 0.2, -0.4]} castShadow>
          <cylinderGeometry args={[0.02, 0.14, 0.32, 12]} />
          <meshStandardMaterial color="#059669" roughness={0.35} />
        </mesh>
      </Float>
      {/* Tiny glass bubble */}
      <Float speed={2.5} floatIntensity={0.4}>
        <mesh position={[-1.6, -0.4, 0.6]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} transmission={0.9} roughness={0} />
        </mesh>
      </Float>
      <Float speed={2.2} floatIntensity={0.4}>
        <mesh position={[1.8, 0.7, 0.3]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} transmission={0.9} roughness={0} />
        </mesh>
      </Float>
    </group>
  );
}

// ---------------------------------------------------------------------------
// MASTER 3D SCENE GROUP (REACTIVE TO SCROLL & MOUSE)
// ---------------------------------------------------------------------------
function WhyPio3DScene({
  scrollProgress,
  pointer,
}: {
  scrollProgress: React.MutableRefObject<number>;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const mangoPackRef = useRef<THREE.Group>(null!);
  const lycheePackRef = useRef<THREE.Group>(null!);
  const rupeeRef = useRef<THREE.Group>(null!);
  const fruitsRef = useRef<THREE.Group>(null!);
  const dropletRef = useRef<THREE.Group>(null!);
  const shieldRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const p = scrollProgress.current; // 0 to 1
    const isMobile = window.innerWidth < 768;

    // 0-20%: Products rise gently from below, camera pushes in softly
    state.camera.position.z = THREE.MathUtils.lerp(5.4, 4.4, p);
    state.camera.position.y = THREE.MathUtils.lerp(0.6, 0.1, p);

    // Desktop pointer tilt: max 2deg X, 3deg Y as strictly requested
    if (!isMobile && groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        pointer.current.x * (Math.PI / 60), // max 3deg
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -pointer.current.y * (Math.PI / 90), // max 2deg
        0.05
      );
    }

    // Scroll-staggered entry of benefit objects
    // 20-40%: ₹10 enters from front-left
    if (rupeeRef.current) {
      const rupeeProgress = Math.min(1, Math.max(0, (p - 0.15) * 3));
      rupeeRef.current.position.x = THREE.MathUtils.lerp(-2.6, -1.9, rupeeProgress);
      rupeeRef.current.position.y = THREE.MathUtils.lerp(-1.2, -0.65, rupeeProgress);
      rupeeRef.current.scale.setScalar(rupeeProgress);
    }

    // 40-60%: Mango/Lychee fruits orbit & enter
    if (fruitsRef.current) {
      const fruitProgress = Math.min(1, Math.max(0, (p - 0.25) * 2.8));
      fruitsRef.current.scale.setScalar(fruitProgress);
    }

    // 60-80%: Water droplet and natural leaf/shield objects enter at different Z-depths
    if (dropletRef.current) {
      const dropProgress = Math.min(1, Math.max(0, (p - 0.35) * 2.6));
      dropletRef.current.scale.setScalar(dropProgress);
    }

    if (shieldRef.current) {
      const shieldProgress = Math.min(1, Math.max(0, (p - 0.4) * 2.5));
      shieldRef.current.scale.setScalar(shieldProgress);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Mango pack slightly left/front (subtle tilt toward camera) */}
      <group ref={mangoPackRef} position={[-0.65, -0.05, 0.2]}>
        <Float speed={1.4} rotationIntensity={0.04} floatIntensity={0.18}>
          <RealMangoCarton position={[0, 0, 0]} rotation={[0.04, 0.16, -0.02]} />
        </Float>
      </group>

      {/* Lychee pack slightly right/back (subtle tilt toward camera) */}
      <group ref={lycheePackRef} position={[0.72, 0.12, -0.25]}>
        <Float speed={1.6} rotationIntensity={0.04} floatIntensity={0.22}>
          <RealLycheeCarton position={[0, 0, 0]} rotation={[0.02, -0.15, 0.02]} />
        </Float>
      </group>

      {/* 1. ₹10 VALUE (Medallion near lower-left) */}
      <group ref={rupeeRef} position={[-1.9, -0.65, 0.4]}>
        <Float speed={1.3} floatIntensity={0.25}>
          <GlossyRupeeMedallion position={[0, 0, 0]} />
        </Float>
      </group>

      {/* 2. REAL FRUIT (Mango slice near Mango pack, Peeled Lychee near Lychee pack) */}
      <group ref={fruitsRef}>
        <Float speed={1.7} floatIntensity={0.3} rotationIntensity={0.15}>
          <MangoSliceItem position={[-1.6, 0.95, 0.2]} />
        </Float>
        <Float speed={1.9} floatIntensity={0.32} rotationIntensity={0.12}>
          <LycheeFruitItem position={[1.8, 1.05, 0.1]} />
        </Float>
      </group>

      {/* 3. NO ADDED PRESERVATIVES (Glass shield icon near upper-right) */}
      <group ref={shieldRef} position={[1.9, -0.15, -0.2]}>
        <Float speed={1.2} floatIntensity={0.22}>
          <GlassShieldBenefit position={[0, 0, 0]} />
        </Float>
      </group>

      {/* 4. REFRESHING TASTE (Crystal water droplet near upper-left/center) */}
      <group ref={dropletRef} position={[-1.4, 0.1, 0.6]}>
        <Float speed={2.1} floatIntensity={0.35}>
          <CrystalWaterDroplet position={[0, 0, 0]} scale={0.85} />
        </Float>
      </group>

      {/* Additional subtle floating decor (Leaves & glass bubbles) */}
      <FloatingDecor />

      {/* Soft Contact Shadows below products */}
      <ContactShadows position={[0, -0.92, 0]} opacity={0.38} scale={5.5} blur={2.4} far={3} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// MAIN WHY PIO COMPONENT
// ---------------------------------------------------------------------------
export function WhyPIO() {
  const sectionRef = useRef<HTMLElement>(null!);
  const headlineRef = useRef<HTMLDivElement>(null!);
  const subRef = useRef<HTMLParagraphElement>(null!);
  const ctaRef = useRef<HTMLDivElement>(null!);
  const benefitsListRef = useRef<HTMLDivElement>(null!);
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

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.fromTo(headlineRef.current, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' })
        .fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.45')
        .fromTo(ctaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.35');

      if (benefitsListRef.current) {
        gsap.fromTo(
          Array.from(benefitsListRef.current.children),
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: benefitsListRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => {
      window.removeEventListener('mousemove', handlePointer);
      ctx.revert();
    };
  }, [prefersReduced]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="why-pio"
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-20 lg:py-28"
    >
      {/* Soft White + Green Ambient Atmosphere with Warm Mango & Lychee Freshness */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_65%_35%,rgba(7,88,47,0.06),transparent_60%),radial-gradient(circle_at_85%_75%,rgba(244,63,94,0.05),transparent_45%),radial-gradient(circle_at_45%_80%,rgba(245,158,11,0.06),transparent_45%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        
        {/* Two-Column Split Layout */}
        <div className="grid items-center gap-10 lg:grid-cols-12">
          
          {/* LEFT SIDE: Text Content & 4 Benefits List */}
          <div className="lg:col-span-5 space-y-6">
            {/*
            <span className="inline-block text-xs font-black uppercase tracking-[0.25em] text-[#07582f] bg-[#eef8f1] px-4 py-1.5 rounded-full border border-emerald-200/60 shadow-xs">
              Why PIO?
            </span>

            <div ref={headlineRef}>
              <h2 className="text-3xl sm:text-5xl font-black text-[#083b20] tracking-tight leading-tight">
                More than just<br />
                <span className="text-[#07582f]">a drink.</span>
              </h2>
            </div>

            <p ref={subRef} className="text-base sm:text-lg text-[#325340] leading-relaxed font-medium">
              It’s a refreshing experience for everyone. Born in Assam, crafted with food-grade purity, and designed to bring a big smile in every small sip.
            </p>
            */}

            {/* 4 Minimalist Supporting Benefits List */}
            <div ref={benefitsListRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#f8fcf9] border border-emerald-900/10 shadow-2xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-black text-xs">
                  ₹10
                </div>
                <span className="text-xs font-black text-[#083b20]">Just ₹10</span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#f8fcf9] border border-emerald-900/10 shadow-2xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs">
                  🥭
                </div>
                <span className="text-xs font-black text-[#083b20]">Made with Real Fruit</span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#f8fcf9] border border-emerald-900/10 shadow-2xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-100 text-sky-800 font-black text-xs">
                  🛡️
                </div>
                <span className="text-xs font-black text-[#083b20]">No Added Preservatives</span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#f8fcf9] border border-emerald-900/10 shadow-2xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-100 text-rose-700 font-black text-xs">
                  💧
                </div>
                <span className="text-xs font-black text-[#083b20]">Refreshing Taste</span>
              </div>
            </div>

            {/* CTA Button */}
            <div ref={ctaRef} className="pt-2">
              <button
                onClick={() => go('inside')}
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#07582f] hover:bg-[#0a6d3b] text-white px-7 py-3.5 text-xs font-black uppercase tracking-wider shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span>SEE WHAT’S INSIDE</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Real 3D Product Showcase Canvas */}
          <div className="lg:col-span-7 relative w-full h-[420px] sm:h-[480px] lg:h-[540px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#f8fdf9] via-[#f0f9f2] to-[#ecfdf5] border border-emerald-900/10 shadow-sm flex items-center justify-center">
            {!prefersReduced ? (
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center gap-6">
                    <img src="/images/pio-mango-lossless.webp" alt="PIO Mango Pack" className="h-44 object-contain drop-shadow-xl" />
                    <img src="/images/pio-lychee-lossless.webp" alt="PIO Lychee Pack" className="h-44 object-contain drop-shadow-xl" />
                  </div>
                }
              >
                <Canvas
                  dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
                  camera={{ position: [0, 0.3, 5.0], fov: 40 }}
                  gl={{ antialias: true, alpha: true }}
                  style={{ background: 'transparent' }}
                >
                  <ambientLight intensity={0.8} />
                  <directionalLight position={[4, 8, 5]} intensity={1.3} color="#ffffff" castShadow />
                  <directionalLight position={[-4, 2, -2]} intensity={0.4} color="#86efac" />
                  <pointLight position={[-1, 2, 3]} intensity={0.45} color="#fef08a" />
                  <pointLight position={[2, -1, 2]} intensity={0.35} color="#fecdd3" />
                  <Environment preset="studio" />
                  <WhyPio3DScene scrollProgress={scrollProgress} pointer={pointer} />
                </Canvas>
              </Suspense>
            ) : (
              <div className="w-full h-full flex items-center justify-center gap-6">
                <img src="/images/pio-mango-lossless.webp" alt="PIO Mango" className="h-48 object-contain drop-shadow-2xl" />
                <img src="/images/pio-lychee-lossless.webp" alt="PIO Lychee" className="h-48 object-contain drop-shadow-2xl" />
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
