import { useSyncExternalStore } from "react";

const KEY = "yatrashield-theme";
const listeners = new Set();

function readInitial() {
  if (typeof window === "undefined") return "light";
  const attr = document.documentElement.dataset.theme;
  if (attr === "dark" || attr === "light") return attr;
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

let current = readInitial();

function paint(theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0d0d0b" : "#efede6");
}

function commit(theme, persist) {
  current = theme;
  paint(theme);
  if (persist) {
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Follow the OS preference until the user makes an explicit choice.
if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    let stored = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      /* ignore */
    }
    if (!stored) commit(e.matches ? "dark" : "light", false);
  });
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Switch theme. When supported, animates a circular reveal from (x, y). */
export function setTheme(next, origin) {
  if (next === current) return;
  const canTransition = typeof document.startViewTransition === "function" && !reducedMotion();
  if (!canTransition) {
    commit(next, true);
    return;
  }
  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = document.startViewTransition(() => commit(next, true));
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 520, easing: "cubic-bezier(.22,.61,.36,1)", pseudoElement: "::view-transition-new(root)" }
      );
    })
    .catch(() => {});
}

export function toggleTheme(origin) {
  setTheme(current === "dark" ? "light" : "dark", origin);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () => current, () => "light");
  return { theme, isDark: theme === "dark", setTheme, toggleTheme };
}
