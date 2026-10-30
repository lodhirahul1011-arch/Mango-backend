export const HERO_ASSET_VERSION = 'pio-jpg-20261026';
export const HERO_VARIANTS = {
  desktop: { count: 192, start: 36, width: 1920, height: 1080 },
  mobile: { count: 97, start: 18, width: 960, height: 540 },
} as const;
export type HeroVariant = keyof typeof HERO_VARIANTS;
export type DataConnection = EventTarget & { saveData?: boolean };
export const dataConnection = () =>
  (navigator as Navigator & { connection?: DataConnection }).connection;
export const selectHeroVariant = (): HeroVariant =>
  window.innerWidth < 768 || dataConnection()?.saveData ? 'mobile' : 'desktop';
export const heroFrame = (variant: HeroVariant, index: number) => {
  const position = Math.max(0, Math.min(HERO_VARIANTS[variant].count - 1, Math.round(index)));
  const frame = variant === 'mobile' ? Math.min(position * 2, 191) : position;
  const folder = variant === 'mobile' ? 'mobile/' : '';
  return '/new%20Herosection%20high/' + folder + 'frame_' + String(frame).padStart(4, '0') + '.jpg?v=' + HERO_ASSET_VERSION;
};
// Begin after the soft source reveal, while preserving forward/reverse scrubbing.
export const heroPoster = (variant: HeroVariant) => heroFrame(variant, HERO_VARIANTS[variant].start);
