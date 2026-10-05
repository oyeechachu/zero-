'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useRef } from 'react';

export function ScrollProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const lenis = new Lenis({
            duration: 1.2,
            wheelMultiplier: 0.9,
            smoothWheel: true,
            touchMultiplier: 1.05,
            gestureOrientation: 'vertical',
            lerp: 0.08,
        });
        lenisRef.current = lenis;

        const handleScroll = () => ScrollTrigger.update();
        const handleRaf = (time: number) => {
            lenis.raf(time * 1000);
        };

        lenis.on('scroll', handleScroll);
        gsap.ticker.add(handleRaf);
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.off('scroll', handleScroll);
            gsap.ticker.remove(handleRaf);
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    useEffect(() => {
        const lenis = lenisRef.current;
        if (lenis) {
            lenis.scrollTo(0, { immediate: true, force: true });
            requestAnimationFrame(() => ScrollTrigger.refresh());
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [pathname]);

    return <>{children}</>;
}
