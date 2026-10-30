/**
 * Stable small viewport avoids rebuilding scenes as mobile browser chrome
 * collapses. Visible height still wins for a keyboard or magnified viewport.
 */
export function measureScrollViewport(parent: HTMLElement) {
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none;overflow:clip';
  parent.appendChild(probe);
  return {
    height: () => {
      const layout = document.documentElement.clientHeight;
      const stable = probe.offsetHeight || layout;
      const visible = Math.floor(window.visualViewport?.height || layout);
      return Math.min(stable, visible, layout);
    },
    destroy: () => probe.remove(),
  };
}
