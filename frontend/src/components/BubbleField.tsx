import { useMemo } from 'react';

type Bubble = {
  left: string;
  size: string;
  delay: string;
  duration: string;
};

export function BubbleField({ count = 15, color = 'rgba(255,255,255,0.4)' }: { count?: number; color?: string }) {
  const bubbles = useMemo<Bubble[]>(() => {
    return Array.from({ length: count }).map(() => {
      const size = 8 + Math.random() * 36;
      return {
        left: `${Math.random() * 100}%`,
        size: `${size}px`,
        delay: `${Math.random() * 8}s`,
        duration: `${6 + Math.random() * 6}s`,
      };
    });
  }, [count]);

  return (
    <div className="bubble-field">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="bubble animate-rise-bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
            animationDuration: b.duration,
            background: `radial-gradient(circle at 30% 30%, ${color}, rgba(255,255,255,0.05))`,
          }}
        />
      ))}
    </div>
  );
}
