'use client';

import { gsap } from 'gsap';
import { useLayoutEffect } from 'react';
import { consumeProjectTransition } from '@/lib/project-transition';

export function ProjectTransitionTarget({ slug }: { slug: string }) {
  useLayoutEffect(() => {
    const record = consumeProjectTransition(slug);
    if (!record || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let animation: gsap.core.Tween | undefined;
    let clone: HTMLImageElement | undefined;
    let target: HTMLElement | null = null;
    const frame = requestAnimationFrame(() => {
      target = document.querySelector<HTMLElement>('[data-project-hero]');
      if (!target) return;

      const destination = target.getBoundingClientRect();
      clone = document.createElement('img');
      clone.src = record.image;
      clone.alt = '';
      clone.setAttribute('aria-hidden', 'true');
      Object.assign(clone.style, {
        position: 'fixed',
        zIndex: '200',
        left: `${record.left}px`,
        top: `${record.top}px`,
        width: `${record.width}px`,
        height: `${record.height}px`,
        objectFit: 'cover',
        objectPosition: 'center',
        pointerEvents: 'none',
        transformOrigin: 'top left',
        willChange: 'transform',
      });

      target.style.opacity = '0';
      document.body.appendChild(clone);

      animation = gsap.to(clone, {
        x: destination.left - record.left,
        y: destination.top - record.top,
        scaleX: destination.width / record.width,
        scaleY: destination.height / record.height,
        duration: 0.85,
        ease: 'power3.inOut',
        onComplete: () => {
          clone?.remove();
          if (target) target.style.opacity = '';
        },
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      animation?.kill();
      clone?.remove();
      if (target) target.style.opacity = '';
    };
  }, [slug]);

  return null;
}
