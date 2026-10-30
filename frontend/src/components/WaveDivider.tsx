type WaveProps = {
  fill: string;
  flip?: boolean;
  className?: string;
};

/** An animated liquid wave divider that sits between sections. */
export function WaveDivider({ fill, flip = false, className = '' }: WaveProps) {
  return (
    <div className={`wave-divider relative w-full overflow-hidden ${flip ? 'rotate-180' : ''} ${className}`} style={{ height: '80px' }}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute h-[200%] w-[200%] animate-wave"
        style={{ left: 0 }}
      >
        <path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,120 L0,120 Z"
          fill={fill}
          opacity="0.5"
        />
      </svg>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute h-[200%] w-[200%] animate-wave-slow"
        style={{ left: 0 }}
      >
        <path
          d="M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,120 L0,120 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
