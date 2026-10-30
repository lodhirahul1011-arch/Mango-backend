import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Leaf, MapPin, Search } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CityHub {
  id: string;
  name: string;
  state: string;
  type: 'factory' | 'central' | 'hub';
  stores: string;
  distributors: string;
  status: string;
  leadTime: string;
  x: number;
  y: number;
}

interface SearchMatch {
  label: string;
  aliases: string[];
  pinPrefixes: string[];
  hubId: string;
  availability: 'active' | 'expanding';
}

const CITY_HUBS: CityHub[] = [
  { id: 'mangaldai', name: 'Mangaldai', state: 'Assam', type: 'factory', stores: 'Factory & Origin', distributors: 'Main aseptic facility', status: 'Origin - Our Home', leadTime: 'Production source', x: 75, y: 34 },
  { id: 'delhi', name: 'Delhi', state: 'North India', type: 'central', stores: '850+ Outlets', distributors: 'Institutional hub', status: 'Active Hub', leadTime: 'Direct institutional', x: 30, y: 28 },
  { id: 'patna', name: 'Patna', state: 'Bihar', type: 'hub', stores: '1,100+ Outlets', distributors: 'Express corridor', status: 'Active Hub', leadTime: 'Express freight', x: 54, y: 37 },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', type: 'central', stores: '3,200+ Outlets', distributors: 'Regional distribution', status: 'Active Hub', leadTime: '24-hour corridor', x: 63, y: 45 },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', type: 'hub', stores: 'Expanding Retail', distributors: 'West India route', status: 'Expanding Network', leadTime: 'Mapped corridor', x: 16, y: 56 },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', type: 'hub', stores: 'Expanding Retail', distributors: 'Central-south route', status: 'Expanding Network', leadTime: 'Mapped corridor', x: 34, y: 61 },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', type: 'hub', stores: 'Expanding Retail', distributors: 'South India route', status: 'Expanding Network', leadTime: 'Mapped corridor', x: 31, y: 74 },
];

const SEARCH_INDEX: SearchMatch[] = [
  { label: 'Mangaldai', aliases: ['mangaldai', 'darrang', 'ramhari'], pinPrefixes: ['7841'], hubId: 'mangaldai', availability: 'active' },
  { label: 'Delhi', aliases: ['delhi', 'new delhi', 'ncr', 'noida', 'gurgaon', 'gurugram', 'faridabad', 'ghaziabad'], pinPrefixes: ['110', '201', '122', '121'], hubId: 'delhi', availability: 'active' },
  { label: 'Patna', aliases: ['patna', 'bihar'], pinPrefixes: ['800', '801'], hubId: 'patna', availability: 'active' },
  { label: 'Kolkata', aliases: ['kolkata', 'calcutta', 'west bengal'], pinPrefixes: ['700', '701'], hubId: 'kolkata', availability: 'active' },
  { label: 'Mumbai', aliases: ['mumbai', 'bombay', 'thane', 'navi mumbai'], pinPrefixes: ['400', '401', '410'], hubId: 'mumbai', availability: 'expanding' },
  { label: 'Hyderabad', aliases: ['hyderabad', 'secunderabad', 'telangana'], pinPrefixes: ['500'], hubId: 'hyderabad', availability: 'expanding' },
  { label: 'Bengaluru', aliases: ['bengaluru', 'bangalore'], pinPrefixes: ['560'], hubId: 'bengaluru', availability: 'expanding' },
  { label: 'Guwahati', aliases: ['guwahati', 'gauhati', 'kamrup'], pinPrefixes: ['781'], hubId: 'mangaldai', availability: 'active' },
  { label: 'Dibrugarh', aliases: ['dibrugarh', 'upper assam'], pinPrefixes: ['7860'], hubId: 'mangaldai', availability: 'active' },
  { label: 'Jorhat', aliases: ['jorhat'], pinPrefixes: ['7850'], hubId: 'mangaldai', availability: 'active' },
  { label: 'Tezpur', aliases: ['tezpur', 'sonitpur'], pinPrefixes: ['7840'], hubId: 'mangaldai', availability: 'active' },
  { label: 'Silchar', aliases: ['silchar', 'cachar', 'barak'], pinPrefixes: ['788'], hubId: 'kolkata', availability: 'active' },
];

const MAP_ROUTES = [
  'M75 34 C66 23,45 23,30 28',
  'M75 34 C68 32,60 35,54 37',
  'M75 34 C76 42,70 45,63 45',
  'M75 34 C56 37,35 45,16 56',
  'M75 34 C65 47,47 54,34 61',
  'M75 34 C62 48,44 65,31 74',
];

function IndiaMapPanel({
  className,
  mobile = false,
  activeHub,
  onSelectHub,
}: {
  className: string;
  mobile?: boolean;
  activeHub: CityHub;
  onSelectHub: (hub: CityHub) => void;
}) {
  return (
    <div className={`pio-map-panel overflow-visible ${className}`}>
      <img
        src="/images/india-network-map.svg"
        alt=""
        draggable={false}
        className="pio-india-shape absolute inset-0 h-full w-full select-none object-fill"
      />

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id={mobile ? 'pioMobileRouteGlow' : 'pioRouteGlow'} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e9ff9d" />
            <stop offset="55%" stopColor="#fff7a0" />
            <stop offset="100%" stopColor="#ffae12" />
          </linearGradient>
        </defs>
        {MAP_ROUTES.map((route) => (
          <path key={route} d={route} className="pio-route-path" fill="none" stroke={`url(#${mobile ? 'pioMobileRouteGlow' : 'pioRouteGlow'})`} strokeWidth="0.9" strokeLinecap="round" />
        ))}
        <circle className="pio-route-bead" r="0.72" fill="#fff47a" opacity="0">
          <animateMotion dur="6.2s" repeatCount="indefinite" path={MAP_ROUTES[0]} />
        </circle>
      </svg>

      {CITY_HUBS.filter((hub) => hub.type !== 'factory').map((hub) => {
        const isSelected = activeHub.id === hub.id;
        return (
          <button
            key={`${mobile ? 'mobile' : 'desktop'}-${hub.id}`}
            onClick={() => onSelectHub(hub)}
            style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
            className={`pio-city-node absolute z-10 -translate-x-1/2 -translate-y-1/2 p-1 ${mobile ? '' : 'hidden md:block'}`}
            aria-label={`Select hub ${hub.name}`}
          >
            <span className={`${mobile ? '' : 'relative'} mx-auto flex h-9 w-9 items-center justify-center rounded-full text-white shadow-[0_12px_22px_rgba(23,85,49,0.24)] ${isSelected ? 'bg-[#f59e0b]' : 'bg-[#207d46]'}`}>
              <MapPin className="h-4 w-4" />
            </span>
            <span className={`mt-1 block whitespace-nowrap rounded-xl bg-[#fffbe9]/95 px-3 py-1.5 text-xs font-extrabold text-[#15241b] shadow-[0_10px_18px_rgba(14,54,31,0.12)] ${mobile ? '' : 'md:px-4 md:py-2 md:text-base'}`}>
              {hub.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function InteractiveMap() {
  const [activeHub, setActiveHub] = useState<CityHub>(CITY_HUBS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState<{
    title: string;
    body: string;
    tone: 'success' | 'expanding' | 'neutral';
  } | null>(null);
  const mapStageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = mapStageRef.current;
    if (!stage) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const routes = gsap.utils.toArray<SVGPathElement>('.pio-route-path');
      routes.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top 76%',
          once: true,
        },
      })
        .from('.pio-map-story', { autoAlpha: 0, y: 22, duration: 0.7, ease: 'power3.out' })
        .from('.pio-india-shape', { autoAlpha: 0, scale: 0.94, y: 12, duration: 0.8, ease: 'power3.out' }, 0.08)
        .to(routes, { strokeDashoffset: 0, duration: 1.45, ease: 'power2.out', stagger: 0.1 }, 0.35)
        .from('.pio-city-node', { autoAlpha: 0, scale: 0.68, duration: 0.5, ease: 'back.out(1.8)', stagger: 0.08 }, 0.75)
        .from('.pio-map-product, .pio-map-legend', { autoAlpha: 0, y: 16, duration: 0.65, ease: 'power3.out', stagger: 0.08 }, 0.9);

      gsap.to('.pio-expansion-ring', {
        scale: 1.12,
        autoAlpha: 0,
        duration: 4.8,
        ease: 'sine.out',
        repeat: -1,
        stagger: 1.3,
        transformOrigin: 'center',
      });

      gsap.to('.pio-route-bead', {
        autoAlpha: 1,
        duration: 0.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.35,
      });
    }, stage);

    return () => ctx.revert();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.toLowerCase().trim();
    const digits = q.replace(/\D/g, '');
    const match = SEARCH_INDEX.find(
      (item) =>
        item.aliases.some((alias) => alias.includes(q) || q.includes(alias)) ||
        item.pinPrefixes.some((prefix) => digits.startsWith(prefix))
    );

    if (match) {
      const hub = CITY_HUBS.find((item) => item.id === match.hubId);
      if (!hub) return;

      setActiveHub(hub);
      setSearchFeedback(
        match.availability === 'active'
          ? {
              title: `${match.label} is in the active PIO network`,
              body: `Nearest serving hub: ${hub.name}. ${hub.leadTime} dispatch is mapped for this location.`,
              tone: 'success',
            }
          : {
              title: `${match.label} is being mapped for expansion`,
              body: `Nearest regional corridor: ${hub.name}. The team can confirm distributor availability for this city.`,
              tone: 'expanding',
            }
      );
      return;
    }

    setSearchFeedback({
      title: `No active hub found for "${searchQuery}" yet`,
      body: 'Share your city through the partner form and the distribution team can check supply options for your area.',
      tone: 'neutral',
    });
  };

  return (
    <section
      id="map"
      className="relative overflow-hidden border-t border-emerald-900/10 bg-[#f7f3df] py-10 text-[#0b2218] sm:py-14 lg:py-16"
    >
      <div className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-[#2f6d20]/25 blur-[80px]" />
      <div className="pointer-events-none absolute -right-16 top-10 h-80 w-80 rounded-full bg-[#f9b51d]/25 blur-[90px]" />

      <div className="relative z-10 mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8">
        <div
          ref={mapStageRef}
          className="relative min-h-0 overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_68%_28%,rgba(255,214,74,0.26),transparent_19%),radial-gradient(circle_at_60%_62%,rgba(25,122,70,0.22),transparent_32%),linear-gradient(120deg,#faf9eb_0%,#eef6e5_54%,#fff3c7_100%)] pb-6 shadow-[0_32px_90px_-34px_rgba(10,61,35,0.45)] md:min-h-[760px] md:pb-0 lg:min-h-[720px]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_58%,rgba(255,255,255,0.66)_100%)]" />
          <div className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-[#1d5c23]/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-[42%] h-44 w-[44rem] rounded-full bg-[#125f37]/18 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-[45%] bg-[radial-gradient(circle_at_60%_36%,rgba(255,255,255,0.86),transparent_24%),radial-gradient(circle_at_70%_58%,rgba(255,173,35,0.24),transparent_22%)]" />

          <div className="pio-map-story relative z-20 max-w-none p-5 sm:p-7 md:absolute md:left-10 md:top-14 md:max-w-[33rem] md:p-0 lg:left-16 lg:top-20">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/48 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#264336] shadow-sm backdrop-blur-md">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6f1dc] text-[#1f8a46]">
                <Leaf className="h-4 w-4" />
              </span>
              PIO Distribution Network
            </div>

            <h2 className="mt-6 font-['Cormorant_Garamond',serif] text-[clamp(3.05rem,15vw,4.35rem)] font-bold leading-[0.88] tracking-tight text-[#0a1f16] md:text-[clamp(3.1rem,5.7vw,5.6rem)]">
              From Assam,<br />
              <span className="text-[#237849]">Across India.</span>
            </h2>

            <p className="mt-5 max-w-[29rem] text-base font-semibold leading-relaxed text-[#526258] sm:text-lg">
              Born in Mangaldai and moving outward through a growing distribution network to bring PIO to more people.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-5 text-[#10271b]">
              <div className="flex items-center gap-3">
                <span className="font-['Cormorant_Garamond',serif] text-5xl font-bold leading-none">1</span>
                <span className="text-sm font-semibold leading-tight text-[#4f5d55]">Origin<br />Assam</span>
              </div>
              <span className="h-10 w-px bg-[#10271b]/18" />
              <div className="flex items-center gap-3">
                <span className="font-['Cormorant_Garamond',serif] text-5xl font-bold leading-none">8+</span>
                <span className="text-sm font-semibold leading-tight text-[#4f5d55]">Active<br />Hubs</span>
              </div>
              <span className="h-10 w-px bg-[#10271b]/18" />
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-end justify-center gap-1 text-[#2d9b58]">
                  <span className="h-4 w-2 rounded-t bg-current" />
                  <span className="h-7 w-2 rounded-t bg-current" />
                  <span className="h-10 w-2 rounded-t bg-current" />
                </span>
                <span className="text-sm font-semibold leading-tight text-[#4f5d55]">Expanding<br />Across India</span>
              </div>
            </div>
          </div>

          <div className="relative z-20 mx-5 mt-1 hidden h-[420px] overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/28 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_18px_38px_rgba(29,76,41,0.12)] md:hidden">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="pioMobileMapLand" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f8efbe" />
                  <stop offset="48%" stopColor="#dbeab2" />
                  <stop offset="100%" stopColor="#19723f" />
                </linearGradient>
                <linearGradient id="pioMobileRouteGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#e9ff9d" />
                  <stop offset="100%" stopColor="#ffae12" />
                </linearGradient>
                <filter id="pioMobileLandShadow" x="-30%" y="-30%" width="160%" height="170%">
                  <feDropShadow dx="0" dy="10" stdDeviation="4" floodColor="#0b4a2d" floodOpacity="0.24" />
                </filter>
              </defs>
              <g transform="translate(18 6) scale(0.82)">
                <path d="M36 8 C40 7,44 9,48 12 C49 17,53 19,55 24 C59 25,62 29,65 32 C70 32,74 34,79 36 C78 39,75 41,73 44 C70 48,68 53,65 56 C62 62,58 66,55 71 C53 77,51 84,47 91 C43 86,40 80,37 74 C34 68,31 64,27 58 C23 52,21 46,20 40 C18 34,19 29,22 24 C24 19,28 17,31 13 C33 11,34 9,36 8 Z" fill="url(#pioMobileMapLand)" filter="url(#pioMobileLandShadow)" />
                <path d="M70 30 C76 29,83 31,89 35 C86 38,82 39,78 40 C74 41,70 39,66 37 C67 34,68 32,70 30 Z" fill="#c9e28a" stroke="#27824a" strokeWidth="0.45" />
                <path d="M65 37 C69 39,72 43,73 47 C70 47,67 45,64 42 C64 40,65 38,65 37 Z" fill="#e4f2b6" stroke="#27824a" strokeWidth="0.34" />
                <path d="M36 8 C40 7,44 9,48 12 C49 17,53 19,55 24 C59 25,62 29,65 32 C70 32,74 34,79 36 C78 39,75 41,73 44 C70 48,68 53,65 56 C62 62,58 66,55 71 C53 77,51 84,47 91 C43 86,40 80,37 74 C34 68,31 64,27 58 C23 52,21 46,20 40 C18 34,19 29,22 24 C24 19,28 17,31 13 C33 11,34 9,36 8 Z" fill="none" stroke="#ffffff" strokeWidth="0.75" opacity="0.72" />
              </g>
              <g transform="translate(18 6) scale(0.82)">
                {MAP_ROUTES.map((route) => (
                  <path key={route} d={route} fill="none" stroke="url(#pioMobileRouteGlow)" strokeWidth="1.05" strokeLinecap="round" opacity="0.88" />
                ))}
              </g>
            </svg>

            {CITY_HUBS.filter((hub) => hub.type !== 'factory').map((hub) => {
              const isSelected = activeHub.id === hub.id;
              return (
                <button
                  key={`mobile-${hub.id}`}
                  onClick={() => {
                    setActiveHub(hub);
                    setSearchFeedback(null);
                  }}
                  style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 p-1"
                  aria-label={`Select hub ${hub.name}`}
                >
                  <span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-white shadow-[0_12px_22px_rgba(23,85,49,0.24)] ${isSelected ? 'bg-[#f59e0b]' : 'bg-[#207d46]'}`}>
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="mt-1 block whitespace-nowrap rounded-xl bg-[#fffbe9]/95 px-3 py-1.5 text-xs font-extrabold text-[#15241b] shadow-[0_10px_18px_rgba(14,54,31,0.12)]">
                    {hub.name}
                  </span>
                </button>
              );
            })}
          </div>

          <IndiaMapPanel
            mobile
            activeHub={activeHub}
            onSelectHub={(hub) => {
              setActiveHub(hub);
              setSearchFeedback(null);
            }}
            className="relative z-20 mx-5 mt-1 aspect-[768/976] overflow-visible rounded-[1.6rem] border border-white/70 bg-white/28 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_18px_38px_rgba(29,76,41,0.12)] md:hidden"
          />

          <IndiaMapPanel
            activeHub={activeHub}
            onSelectHub={(hub) => {
              setActiveHub(hub);
              setSearchFeedback(null);
            }}
            className="absolute left-[40%] top-[2%] z-10 hidden h-[96%] aspect-[768/976] md:block"
          />

          <svg viewBox="0 0 100 100" className="hidden">
            <defs>
              <linearGradient id="pioMapLand" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f8efbe" />
                <stop offset="43%" stopColor="#dbeab2" />
                <stop offset="74%" stopColor="#74ad59" />
                <stop offset="100%" stopColor="#19723f" />
              </linearGradient>
              <linearGradient id="pioRouteGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e9ff9d" />
                <stop offset="55%" stopColor="#fff7a0" />
                <stop offset="100%" stopColor="#ffae12" />
              </linearGradient>
              <filter id="pioLandShadow" x="-30%" y="-30%" width="160%" height="170%">
                <feDropShadow dx="-2" dy="4" stdDeviation="2.6" floodColor="#23551f" floodOpacity="0.28" />
                <feDropShadow dx="0" dy="14" stdDeviation="5.2" floodColor="#0b4a2d" floodOpacity="0.22" />
              </filter>
              <filter id="pioRouteShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.38" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <pattern id="pioTerrain" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M0 4 C1 2,3 2,5 0 M0 2 C2 3,3 4,5 3" fill="none" stroke="#ffffff" strokeWidth="0.22" opacity="0.26" />
              </pattern>
            </defs>

            <g className="pio-india-shape" transform="translate(23 8) scale(0.78)">
              <path d="M36 8 C40 7,44 9,48 12 C49 17,53 19,55 24 C59 25,62 29,65 32 C70 32,74 34,79 36 C78 39,75 41,73 44 C70 48,68 53,65 56 C62 62,58 66,55 71 C53 77,51 84,47 91 C43 86,40 80,37 74 C34 68,31 64,27 58 C23 52,21 46,20 40 C18 34,19 29,22 24 C24 19,28 17,31 13 C33 11,34 9,36 8 Z" fill="url(#pioMapLand)" filter="url(#pioLandShadow)" />
              <path d="M36 8 C40 7,44 9,48 12 C49 17,53 19,55 24 C59 25,62 29,65 32 C70 32,74 34,79 36 C78 39,75 41,73 44 C70 48,68 53,65 56 C62 62,58 66,55 71 C53 77,51 84,47 91 C43 86,40 80,37 74 C34 68,31 64,27 58 C23 52,21 46,20 40 C18 34,19 29,22 24 C24 19,28 17,31 13 C33 11,34 9,36 8 Z" fill="url(#pioTerrain)" opacity="0.9" />
              <path d="M33 15 C38 18,45 20,50 25 C55 30,60 36,64 42 C59 41,54 39,49 36 C44 33,38 29,32 27 C28 26,25 25,23 24 C26 20,29 17,33 15 Z" fill="#fff8cc" opacity="0.42" />
              <path d="M29 50 C34 47,39 48,44 51 C49 54,53 57,57 62 C54 67,51 72,48 79 C44 72,40 66,36 61 C33 57,31 53,29 50 Z" fill="#2f914e" opacity="0.32" />
              <path d="M70 30 C76 29,83 31,89 35 C86 38,82 39,78 40 C74 41,70 39,66 37 C67 34,68 32,70 30 Z" fill="#c9e28a" stroke="#27824a" strokeWidth="0.45" />
              <path d="M65 37 C69 39,72 43,73 47 C70 47,67 45,64 42 C64 40,65 38,65 37 Z" fill="#e4f2b6" stroke="#27824a" strokeWidth="0.34" />
              <path d="M36 8 C40 7,44 9,48 12 C49 17,53 19,55 24 C59 25,62 29,65 32 C70 32,74 34,79 36 C78 39,75 41,73 44 C70 48,68 53,65 56 C62 62,58 66,55 71 C53 77,51 84,47 91 C43 86,40 80,37 74 C34 68,31 64,27 58 C23 52,21 46,20 40 C18 34,19 29,22 24 C24 19,28 17,31 13 C33 11,34 9,36 8 Z" fill="none" stroke="#ffffff" strokeWidth="0.65" opacity="0.72" />
            </g>

            <g className="opacity-95" filter="url(#pioRouteShadow)" transform="translate(23 8) scale(0.78)">
              {MAP_ROUTES.map((route) => (
                <path key={route} className="pio-route-path" d={route} fill="none" stroke="url(#pioRouteGlow)" strokeWidth="0.9" strokeLinecap="round" />
              ))}
              <path className="pio-route-path" d="M84 35 C72 44,58 49,32 48" fill="none" stroke="#edfff0" strokeWidth="0.62" strokeLinecap="round" opacity="0.9" />
              <path className="pio-route-path" d="M84 35 C72 58,58 74,49 78" fill="none" stroke="#edfff0" strokeWidth="0.62" strokeLinecap="round" opacity="0.9" />
              <circle className="pio-route-bead" r="0.72" fill="#ffffff" opacity="0">
                <animateMotion dur="6.2s" repeatCount="indefinite" path="M84 35 C73 24,60 22,48 25" />
              </circle>
              <circle className="pio-route-bead" r="0.72" fill="#fff47a" opacity="0">
                <animateMotion dur="6.8s" repeatCount="indefinite" path="M84 35 C67 34,49 37,32 48" />
              </circle>
              <circle className="pio-route-bead" r="0.72" fill="#ffffff" opacity="0">
                <animateMotion dur="7.4s" repeatCount="indefinite" path="M84 35 C73 50,61 67,49 78" />
              </circle>
            </g>
          </svg>

          <div className="pointer-events-none absolute left-[65%] top-[38%] z-0 hidden h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/45 md:block" />
          <div className="pointer-events-none absolute left-[73%] top-[41%] z-0 hidden h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35 md:block" />
          <div className="pio-expansion-ring pointer-events-none absolute left-[70%] top-[35%] z-20 hidden h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ffb21c]/50 bg-[#ffb21c]/10 md:block" />
          <div className="pio-expansion-ring pointer-events-none absolute left-[70%] top-[35%] z-20 hidden h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 md:block" />

          {CITY_HUBS.filter((hub) => hub.type !== 'factory').map((hub) => {
            const isSelected = activeHub.id === hub.id;
            return (
              <button
                key={hub.id}
                onClick={() => {
                  setActiveHub(hub);
                  setSearchFeedback(null);
                }}
                style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
                className="hidden"
                aria-label={`Select hub ${hub.name}`}
              >
                <span className={`absolute inset-2 rounded-full ${isSelected ? 'animate-ping bg-[#f9b51d]/70' : 'bg-white/0'}`} />
                <span className={`relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_18px_28px_rgba(23,85,49,0.24)] transition-transform duration-200 group-hover:-translate-y-1 ${isSelected ? 'bg-[#f59e0b]' : 'bg-[#207d46]'}`}>
                  <MapPin className="h-6 w-6" />
                </span>
                <span className="absolute left-1/2 top-[3.6rem] -translate-x-1/2 whitespace-nowrap rounded-2xl bg-[#fffbe9]/95 px-4 py-2 text-base font-extrabold text-[#15241b] shadow-[0_12px_22px_rgba(14,54,31,0.14)] backdrop-blur-sm">
                  {hub.name}
                </span>
              </button>
            );
          })}

          <div className="pio-map-product pointer-events-none absolute right-[8%] top-[8%] z-30 hidden items-end">
            <img src="/images/pio-mango-lossless.webp" loading="lazy" decoding="async" alt="" draggable={false} className="h-44 w-auto -rotate-[8deg] object-contain drop-shadow-[0_26px_30px_rgba(38,67,31,0.28)] lg:h-56" />
            <img src="/images/pio-lychee-lossless.webp" loading="lazy" decoding="async" alt="" draggable={false} className="-ml-14 h-40 w-auto rotate-[5deg] object-contain drop-shadow-[0_26px_30px_rgba(38,67,31,0.24)] lg:h-52" />
          </div>

          <form onSubmit={handleSearch} className="absolute bottom-8 right-5 z-40 hidden w-[23rem] rounded-3xl border border-white/70 bg-white/52 p-4 shadow-[0_18px_42px_rgba(29,76,41,0.14)] backdrop-blur-md lg:block">
            <label className="mb-2 block text-sm font-black text-[#10271b]">Find your nearest PIO corridor</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#237849]" />
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFeedback(null);
                  }}
                  placeholder="City or pin code"
                  className="w-full rounded-2xl border border-[#0f3a27]/10 bg-white/80 py-3 pl-9 pr-3 text-sm font-semibold text-[#10271b] outline-none transition focus:border-[#237849] focus:ring-2 focus:ring-[#237849]/15"
                />
              </div>
              <button type="submit" className="rounded-2xl bg-[#0f3a27] px-4 text-sm font-black text-white transition hover:bg-[#237849]">
                Locate
              </button>
            </div>
            <AnimatePresence>
              {searchFeedback && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mt-3 rounded-2xl bg-white/74 p-3 text-xs font-semibold text-[#4f5d55]">
                  <span className="block font-black text-[#10271b]">{searchFeedback.title}</span>
                  {searchFeedback.body}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="pio-map-legend absolute bottom-8 left-5 z-30 hidden flex-wrap items-center gap-5 rounded-3xl border border-white/70 bg-white/52 px-5 py-4 text-sm font-bold text-[#10271b] shadow-[0_18px_42px_rgba(29,76,41,0.12)] backdrop-blur-md sm:left-10 md:flex lg:left-16">
            <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-[#ff8a00]" />Origin</span>
            <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-[#2aa653]" />Active Hub</span>
            <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border border-[#237849]" />Expanding Network</span>
          </div>

          <div className="relative z-40 mx-5 mt-4 flex max-w-[calc(100%-2.5rem)] gap-2 overflow-x-auto rounded-3xl border border-white/70 bg-white/48 p-2 shadow-[0_18px_42px_rgba(29,76,41,0.12)] backdrop-blur-md md:hidden">
            {CITY_HUBS.map((hub) => (
              <button
                key={hub.id}
                onClick={() => setActiveHub(hub)}
                className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-black ${activeHub.id === hub.id ? 'bg-[#0f3a27] text-white' : 'bg-white/70 text-[#10271b]'}`}
              >
                {hub.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
