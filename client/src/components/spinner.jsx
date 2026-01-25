import "./spinner.css";

/**
 * Simple, theme-aware spinner.
 *
 * Props:
 * - size: number (px)
 * - label: string (aria)
 * - centered: boolean (full-width centered row)
 * - className: string
 */
export default function Spinner({
  size = 30,
  label = "Loading…",
  centered = false,
  className = "",
}) {
  const borderWidth = Math.max(3, Math.round(size / 10));

  return (
    <div
      className={`fc-spinner-wrap ${centered ? "is-centered" : ""} ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className="fc-spinner"
        style={{ width: size, height: size, borderWidth }}
        role="status"
        aria-label={label}
      />
      {/* Keep the label for screen readers, but hide visually */}
      <span className="sr-only">{label}</span>
    </div>
  );
}
