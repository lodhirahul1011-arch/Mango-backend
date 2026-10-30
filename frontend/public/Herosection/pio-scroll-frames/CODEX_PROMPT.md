# Codex implementation prompt

Integrate the supplied PIO image sequence into the existing website's hero section. Preserve existing brand content, navigation, CTA links and other sections. Inspect the existing framework before editing. This is a scroll-scrubbed canvas sequence, not autoplay. Do not add Three.js just to display these frames.

## Assets
Copy desktop/, mobile/, poster-desktop.webp, poster-mobile.webp and manifest.json into public/pio-sequence/. Read manifest.json for the actual frame counts, dimensions and filenames. Frames start at 0000. Desktop contains every source frame at 24 fps; mobile contains every second source frame (12 fps), including the final frame. Never request desktop and mobile sequences together. Choose mobile below 768 CSS pixels or for saveData, and lock the chosen variant for the component lifetime.

## Visual and scroll behavior
- Use a sticky hero canvas within a section spanning roughly 300vh desktop / 220vh mobile, with responsive tuning after testing. Map progress through the sticky interval to round(progress * (frameCount - 1)), clamped to valid indices.
- Scrolling downward advances the sequence; upward reverses it. No timer-based autoplay and no frame wrapping at the end. Use existing GSAP ScrollTrigger if already installed; otherwise native scroll plus requestAnimationFrame is sufficient.
- Both PIO packs must remain visible. Source is very wide (~2.34:1). Use contain on phones over a dark matching background, with heading and CTA outside the image composition; do not stretch it or blindly cover a portrait viewport. Desktop can use a wide media area with restrained text overlays outside the product centers.
- Show responsive first-frame poster immediately in an image element with explicit dimensions/aspect ratio; use high fetch priority for this hero poster. Do not wait for all frames to render the page or disable scrolling. Keep poster under the canvas until a decoded frame is drawn. Keep text and links as real accessible DOM elements.
- Reduced-motion and save-data users get the static poster without loading the sequence; no long empty pinned section in this mode.

## Performance implementation requirements
- Use one canvas. No 193 image elements, React setState on every scroll, base64 images, or fetching the original MP4.
- Coalesce scroll events into requestAnimationFrame and redraw only when target frame or canvas size changes. Cap device pixel ratio at 1.5 desktop / 1 mobile and avoid backing-store sizes above asset resolution without reason.
- Prioritize current target and immediate neighbors; use at most 4 concurrent downloads desktop / 2 mobile. Reprioritize queued requests on fast scroll. Do not download all frames as a prerequisite to starting.
- Use a bounded decoded-frame LRU cache (~24 frames desktop / 16 mobile) with directional look-ahead. Close evicted ImageBitmaps; revoke any object URLs. Avoid retaining every decoded frame: compressed byte sizes do NOT represent GPU/decoded memory.
- If the exact target is not ready, keep the last drawn frame, request the target first, and draw it upon arrival. Handle failed frame loads without blanking the canvas or creating infinite retry loops. Rapid scrolling on a cold connection may skip intermediate frames; do not promise smooth playback before loading.
- Use ResizeObserver and refresh the progress calculation on resize/orientation changes. Dispose listeners, observers, RAF, fetches and cached bitmaps on unmount, including React Strict Mode double mounting.
- Use versioned asset paths and long-lived immutable cache headers in production. Only preload the selected poster, not both frame directories. No third-party animation CDN dependency unless already part of the project.

## Acceptance tests
Test desktop, narrow mobile, resize, reverse scroll, quick jumps to middle/end, slow network, a missing frame, reduced motion, save-data, and repeated mount/unmount. Confirm first/last indices and no off-by-one requests; verify only one variant loads and concurrency/cache limits are respected. Show actual network totals and performance observations, without claiming Lighthouse scores you did not measure.

Provide the implemented component and integration changes, then list any remaining real-device testing needed.
