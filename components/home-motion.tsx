'use client';

import { gsap } from 'gsap';
import { type ReactNode, useEffect, useRef } from 'react';

export function HomeMotion({ children }: { children: ReactNode }) {
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const context = gsap.context(() => {
      if (reducedMotion) return;

      gsap.fromTo(
        '.work-index-overline, .work-index-heading h1, .work-index-intro',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out', delay: 0.12 },
      );
    }, page);

    return () => context.revert();
  }, []);

  return <div ref={pageRef}>{children}</div>;
}
