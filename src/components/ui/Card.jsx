/**
 * Card — base surface component for Life OS
 *
 * Props:
 *  children     — content
 *  className    — additional Tailwind classes
 *  hover        — adds subtle lift + border highlight on hover
 *  accent       — hex color string; draws a 2px left-border accent line
 *  padding      — "none" | "sm" | "md" (default) | "lg"
 *  onClick      — makes the card interactive (cursor-pointer)
 */
export default function Card({
  children,
  className = "",
  hover = false,
  accent = null,
  padding = "md",
  onClick,
}) {
  const paddingMap = {
    none: "p-0",
    sm: "p-3",
    md: "p-5",
    lg: "p-7",
  };

  const base = {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 14,
    fontFamily: "'Syne', sans-serif",
    transition: "border-color 0.2s ease, background 0.2s ease",
    ...(accent
      ? {
          borderLeft: `2px solid ${accent}`,
          borderRadius: "0 14px 14px 0",
        }
      : {}),
    ...(onClick ? { cursor: "pointer" } : {}),
  };

  const hoverHandlers = hover || onClick
    ? {
        onMouseEnter: (e) => {
          e.currentTarget.style.borderColor = "#3f3f46";
          e.currentTarget.style.background = "#1c1c22";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.borderColor = accent ? accent : "#27272a";
          e.currentTarget.style.background = "#18181b";
        },
      }
    : {};

  return (
    <div
      style={base}
      className={`${paddingMap[padding]} ${className}`}
      onClick={onClick}
      {...hoverHandlers}
    >
      {children}
    </div>
  );
}