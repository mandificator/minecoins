"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps children with a "draw-in" reveal that triggers when scrolled into view.
 * Used for the system diagram on the homepage.
 */
export default function ScrollReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`draw-in ${className}`}>
      {children}
    </div>
  );
}
