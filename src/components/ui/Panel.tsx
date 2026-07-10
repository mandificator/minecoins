import type { ReactNode } from "react";

/**
 * Vintage "bracket" corner ticks — the dashboard's panel chrome, shared
 * site-wide wherever a `.dash-panel` box is used.
 */
export function Corners() {
  return (
    <span aria-hidden>
      <i className="dash-corner tl" />
      <i className="dash-corner tr" />
      <i className="dash-corner bl" />
      <i className="dash-corner br" />
    </span>
  );
}

/**
 * The dashboard's panel: dashed border, corner ticks, an optional
 * label/note header row. This is the site-wide replacement for the old
 * ASCII `┌─[ TITLE ]──┐` terminal-window card.
 */
export default function Panel({
  label,
  note,
  children,
  className = "",
}: {
  label?: ReactNode;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`dash-panel relative p-4 sm:p-5 ${className}`}>
      <Corners />
      {(label || note) && (
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
          {label && <span className="dash-label">{label}</span>}
          {note && <span className="dash-note">{note}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
