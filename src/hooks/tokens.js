/**
 * src/utils/tokens.js
 *
 * Maps friendly token names → CSS custom property references.
 * App.css defines the actual values for :root (light) and .dark.
 * ThemeContext toggles the .dark class on <html>.
 *
 * NO hardcoded hex values here — App.css is the single source of truth.
 *
 * Usage in any page:
 *   import { t, mono, sans } from "../utils/tokens";
 *   const tk = t();
 *   <div style={{ background: tk.surface, color: tk.text }}>
 *
 * Migration from the old pattern:
 *   BEFORE:  const { isDark } = useTheme();  const tk = t(isDark);
 *   AFTER:   const tk = t();
 *   (keep useTheme() only if you need userName or toggle)
 */

export const t = () => ({
  bg:        "var(--bg-base)",
  surface:   "var(--bg-surface)",
  surface2:  "var(--bg-surface-2)",
  border:    "var(--border)",
  border2:   "var(--border-2)",
  text:      "var(--text)",
  textSub:   "var(--text-sub)",
  textMuted: "var(--text-muted)",
  textFaint: "var(--text-faint)",
  accent:    "var(--accent)",
  inputBg:   "var(--input-bg)",
  inputBdr:  "var(--input-border)",
  overlay:   "var(--overlay)",
});

export const mono = "'Space Mono', monospace";
export const sans = "'Syne', sans-serif";