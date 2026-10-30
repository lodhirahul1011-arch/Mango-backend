/**
 * A small, cancellable window of decoded hero frames.
 * Only the requested frame is delivered, so a cold-cache jump never flashes
 * unrelated nearby frames. Canvas keeps its previous drawing while it loads.
 */
export interface HeroFrameLoaderStats {
  count: number;
  target: number;
  cache: number;
  active: number;
  maxActive: number;
  queued: number;
  requests: number;
  loaded: number;
  failed: number;
  cacheHits: number;
  evicted: number;
  aborted: number;
  destroyed: boolean;
}

export interface HeroFrameLoaderOptions {
  count: number;
  url: (index: number) => string;
  mobile: boolean;
  onFrame: (index: number, image: CanvasImageSource) => void;
  onStats?: (stats: HeroFrameLoaderStats) => void;
}

type DecodedFrame = ImageBitmap | HTMLImageElement;

function abortError() {
  return new DOMException('Hero frame request was cancelled', 'AbortError');
}

function disposeFrame(image: DecodedFrame) {
  if ('close' in image) image.close();
  else image.removeAttribute('src');
}

async function decodeFrame(url: string, signal: AbortSignal): Promise<DecodedFrame> {
  const response = await fetch(url, { signal, cache: 'force-cache' });
  if (!response.ok) throw new Error(`Hero frame returned HTTP ${response.status}`);
  const blob = await response.blob();
  if (signal.aborted) throw abortError();

  if (typeof createImageBitmap === 'function') {
    try {
      const image = await createImageBitmap(blob);
      if (signal.aborted) {
        image.close();
        throw abortError();
      }
      return image;
    } catch (error) {
      if (signal.aborted) throw abortError();
      // Some Safari versions expose createImageBitmap without decoding WebP.
      // Fall through to the browser image decoder using the same fetched blob.
    }
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(blob);
    let settled = false;
    const cleanup = () => {
      signal.removeEventListener('abort', onAbort);
      image.onload = null;
      image.onerror = null;
      URL.revokeObjectURL(objectUrl);
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      image.removeAttribute('src');
      reject(error);
    };
    const onAbort = () => fail(abortError());
    image.decoding = 'async';
    image.onload = () => {
      if (settled) return;
      if (signal.aborted) {
        onAbort();
        return;
      }
      settled = true;
      cleanup();
      resolve(image);
    };
    image.onerror = () => fail(new Error('Hero frame could not be decoded'));
    signal.addEventListener('abort', onAbort, { once: true });
    if (signal.aborted) onAbort();
    else image.src = objectUrl;
  });
}

export function createHeroFrameLoader(options: HeroFrameLoaderOptions) {
  const { count, mobile, onFrame, onStats } = options;
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('Hero frame count must be a positive integer');
  }

  const concurrency = mobile ? 2 : 4;
  const cacheLimit = mobile ? 16 : 24;
  const queueLimit = mobile ? 8 : 12;
  const reach = mobile ? 5 : 9;
  const cache = new Map<number, DecodedFrame>();
  const active = new Map<number, AbortController>();
  const failures = new Map<number, number>();
  let desired: number[] = [];
  let queued: number[] = [];
  let target = -1;
  let direction = 1;
  let lastDelivered = -1;
  let destroyed = false;
  const totals = {
    maxActive: 0, requests: 0, loaded: 0, failed: 0,
    cacheHits: 0, evicted: 0, aborted: 0,
  };

  function getStats(): HeroFrameLoaderStats {
    return {
      count, target, cache: cache.size, active: active.size,
      queued: queued.length, ...totals, destroyed,
    };
  }

  function report() {
    onStats?.(getStats());
  }

  function touch(index: number) {
    const frame = cache.get(index);
    if (frame) {
      cache.delete(index);
      cache.set(index, frame);
    }
    return frame;
  }

  function deliver(force = false) {
    if (destroyed || (!force && lastDelivered === target)) return;
    const frame = touch(target);
    if (!frame) return;
    lastDelivered = target;
    onFrame(target, frame);
  }

  function buildPriority() {
    const candidates = [
      target, target + direction, target - direction,
      target + direction * 2, target - direction * 2,
    ];
    for (let step = 3; step <= reach; step++) {
      candidates.push(target + direction * step);
    }
    if (!mobile) candidates.push(target - direction * 3, target - direction * 4);
    desired = [...new Set(candidates)].filter(index => index >= 0 && index < count);
  }

  function trimCache() {
    while (cache.size > cacheLimit) {
      const oldest = [...cache.keys()].find(index => index !== target);
      if (oldest === undefined) break;
      const frame = cache.get(oldest)!;
      cache.delete(oldest);
      disposeFrame(frame);
      totals.evicted++;
    }
  }

  function pump() {
    if (destroyed || target < 0) return;
    queued = desired.filter(index =>
      !cache.has(index) && !active.has(index) && (failures.get(index) || 0) < 2
    ).slice(0, queueLimit);
    while (active.size < concurrency && queued.length > 0) {
      const index = queued.shift()!;
      const controller = new AbortController();
      active.set(index, controller);
      totals.requests++;
      totals.maxActive = Math.max(totals.maxActive, active.size);
      void load(index, controller);
    }
    report();
  }

  async function load(index: number, controller: AbortController) {
    let frame: DecodedFrame | undefined;
    try {
      frame = await decodeFrame(options.url(index), controller.signal);
    } catch {
      if (controller.signal.aborted || destroyed) totals.aborted++;
      else {
        failures.set(index, (failures.get(index) || 0) + 1);
        totals.failed++;
      }
    } finally {
      active.delete(index);
    }

    if (frame) {
      if (destroyed || controller.signal.aborted) {
        disposeFrame(frame);
      } else {
        totals.loaded++;
        cache.set(index, frame);
        trimCache();
        // A response for an old scroll position may warm the cache, but must
        // never replace the exact frame now being requested.
        if (index === target) deliver();
      }
    }
    if (!destroyed) pump();
  }

  function request(index: number) {
    if (destroyed || !Number.isFinite(index)) return;
    const next = Math.max(0, Math.min(count - 1, Math.round(index)));
    if (target !== next) {
      if (target >= 0) direction = next > target ? 1 : -1;
      target = next;
      if (cache.has(target)) totals.cacheHits++;
      buildPriority();
      // Only cancel distant work: ordinary one-frame scrolling keeps useful
      // in-flight neighbours, while large jumps release scarce mobile slots.
      for (const [inFlight, controller] of active) {
        if (!desired.includes(inFlight) && Math.abs(inFlight - target) > reach * 2) {
          controller.abort();
        }
      }
    }
    deliver();
    pump();
  }

  function redraw() {
    deliver(true);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    for (const controller of active.values()) controller.abort();
    for (const frame of cache.values()) disposeFrame(frame);
    cache.clear();
    desired = [];
    queued = [];
    failures.clear();
    report();
  }

  return { request, redraw, getStats, destroy };
}

export type HeroFrameLoader = ReturnType<typeof createHeroFrameLoader>;
