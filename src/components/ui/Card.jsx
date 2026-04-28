/**
 * Card — base surface component for Life OS
 *
 * Props:
 *  children  — content
 *  className — additional Tailwind classes
 *  hover     — subtle lift + border highlight on hover
 *  accent    — hex string; draws a 2px left-border accent line
 *  padding   — "none" | "sm" | "md" (default) | "lg"
 *  onClick   — makes the card interactive
 */
export default function Card({ children, className = "", hover = false, accent = null, padding = "md", onClick }) {
  const padMap = { none: "p-0", sm: "p-3", md: "p-5", lg: "p-7" };

  const base = {
    background:   "var(--bg-surface)",
    border:       `1px solid ${accent ? accent + "55" : "var(--border)"}`,
    borderLeft:   accent ? `2px solid ${accent}` : undefined,
    borderRadius: accent ? "0 14px 14px 0" : 14,
    transition:   "border-color 0.2s ease, background 0.2s ease",
    cursor:       onClick ? "pointer" : undefined,
    fontFamily:   "'Syne', sans-serif",
  };

  const hoverHandlers = hover || onClick
    ? {
        onMouseEnter: (e) => {
          e.currentTarget.style.borderColor = accent ? accent : "var(--border-2)";
          e.currentTarget.style.background  = "var(--bg-surface-2, var(--bg-surface))";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.borderColor = accent ? accent + "55" : "var(--border)";
          e.currentTarget.style.background  = "var(--bg-surface)";
        },
      }
    : {};

  return (
    <div style={base} className={`${padMap[padding]} ${className}`} onClick={onClick} {...hoverHandlers}>
      {children}
    </div>
  );
}