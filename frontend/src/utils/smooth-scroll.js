import Lenis from "lenis";

let lenis = null;
let rafId = 0;

export function getLenis() {
  return lenis;
}

/** Start inertial scrolling. Skipped for users who prefer reduced motion. */
export function startSmoothScroll() {
  if (lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  lenis = new Lenis({
    lerp: 0.11,
    smoothWheel: true,
    wheelMultiplier: 1,
    anchors: { offset: -72 },
  });

  const frame = (time) => {
    lenis?.raf(time);
    rafId = requestAnimationFrame(frame);
  };
  rafId = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(rafId);
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}
