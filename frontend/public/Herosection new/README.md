# PIO optimized hero sequence

Source: 2200 × 940, approximately 8.04 seconds, 24 fps. Desktop retains original dimensions and frame cadence; WebP is lossy and does not add detail beyond the source. Mobile is 1100 × 470 at 15 fps, preserves the full composition and both packs. Source blur and any existing watermark are retained.

## Preview
Extract ZIP, then run `python3 -m http.server 8000` inside this folder. Open http://localhost:8000. Do not open index.html directly using file://. Demo uses native scroll, no CDN or GSAP dependency. Demo copy is illustrative only.

## Integration prompt for Codex / Bolt
Use the attached frame folders and manifest.json to replace only the existing hero visual with a scroll-controlled canvas sequence. Preserve all existing navigation, text, CTAs, forms and functionality. Copy assets into public/pio-hero and adapt paths accordingly. Select exactly one sequence at initial mount: mobile below 768 CSS px, desktop otherwise. Never preload both variants. Do not swap the selected sequence midway through a scroll; reselect on remount if required.

Use GSAP ScrollTrigger if already installed: progress maps to round(progress * (count - 1)); use ease none, and a single owner for pinning. The supplied preview uses CSS sticky, so do not add pin:true on that same element. Keep visual updates inside requestAnimationFrame, not React state on every scroll. Show the first frame as soon as available. Use a bounded decoded image cache (approximately 24–32 frames) and at most four concurrent loads; prioritize the target frame and nearby frames, cancel/reprioritize stale queued work on fast scrubs, and draw the nearest ready frame rather than clearing to blank. Abort pending fetches and clean up triggers/listeners/RAF on unmount. Trigger error fallback to a static poster.

Desktop: preserve full image with canvas contain sizing, bounded pixel ratio around 1.5, and responsive hero copy placement. Mobile: place existing heading and CTAs above or below the animation, keep the wide visual in a landscape area, and use contain sizing so BOTH packs remain visible. Do not force this landscape video into a portrait cover crop. A full-height portrait composition requires a separately art-directed source video.

Reduced-motion: show a static frame without a tall pinned scroll zone. Include an accessible canvas label and keep text/buttons in HTML above the canvas. Reserve dimensions to avoid layout shifts. Recalculate canvas backing dimensions and redraw on resize, refreshing ScrollTrigger only when layout changes. Avoid unnecessary filters, per-frame React renders, and decoding the whole sequence simultaneously.

Validate on actual mobile and desktop: forward/reverse scrolling, rapid scrubbing, slow network, resize, failed image requests and reduced motion. Smoothness depends on device, network and integration; do not promise universal 60 fps. Frames are lighter individually but the entire desktop sequence is still substantial, so serve with long-lived caching and choose the mobile set on smaller screens. No audio is included because this is a scroll sequence.
