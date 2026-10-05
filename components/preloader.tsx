'use client';

import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [visible, setVisible] = useState(true);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const startedAt = performance.now();
    const images = Array.from(document.images).filter(
      (image) => image.loading !== 'lazy' || image.fetchPriority === 'high',
    );
    let finishedImages = images.filter((image) => image.complete).length;
    let fontsReady = document.fonts.status === 'loaded';
    let webglReady = !document.querySelector('[data-webgl-status="pending"]');
    let exitTimer = 0;
    let maximumWaitTimer = 0;

    const updateProgress = () => {
      const imageProgress = images.length ? finishedImages / images.length : 1;
      const settled = fontsReady && webglReady && finishedImages >= images.length;
      const nextProgress = settled ? 100 : Math.min(92, Math.round(10 + imageProgress * 70 + (fontsReady ? 12 : 0) + (webglReady ? 8 : 0)));
      setProgress((current) => Math.max(current, nextProgress));

      if (settled && !exitTimer) {
        const remaining = Math.max(0, 500 - (performance.now() - startedAt));
        exitTimer = window.setTimeout(() => setComplete(true), remaining);
      }
    };

    const onImageSettled = () => {
      finishedImages += 1;
      updateProgress();
    };

    const onWebglReady = () => {
      webglReady = true;
      updateProgress();
    };

    images.forEach((image) => {
      if (!image.complete) {
        image.addEventListener('load', onImageSettled, { once: true });
        image.addEventListener('error', onImageSettled, { once: true });
      }
    });
    window.addEventListener('zero:webgl-ready', onWebglReady);
    document.fonts.ready.then(() => {
      fontsReady = true;
      updateProgress();
    });
    maximumWaitTimer = window.setTimeout(() => {
      webglReady = true;
      fontsReady = true;
      finishedImages = images.length;
      updateProgress();
    }, 2200);
    updateProgress();

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(maximumWaitTimer);
      window.removeEventListener('zero:webgl-ready', onWebglReady);
      images.forEach((image) => {
        image.removeEventListener('load', onImageSettled);
        image.removeEventListener('error', onImageSettled);
      });
    };
  }, []);

  useEffect(() => {
    if (!complete || !overlayRef.current) return;

    const animation = gsap.to(overlayRef.current, {
      yPercent: -100,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.25 : 0.9,
      ease: 'power3.inOut',
      onComplete: () => setVisible(false),
    });

    return () => {
      animation.kill();
    };
  }, [complete]);

  if (!visible) return null;

  return (
    <div className="preloader" ref={overlayRef} aria-hidden="true">
      <div className="preloader-topline">
        <span>ZERO DEGREE</span>
        <span>CREATIVE STUDIO / PRODUCTION HOUSE</span>
      </div>
      <div className="preloader-center">
        <span className="preloader-mark">ZERO<br />DEGREE</span>
        <span className="preloader-progress">{String(progress).padStart(2, '0')}%</span>
      </div>
      <div className="preloader-track"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
    </div>
  );
}
