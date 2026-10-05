'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { navItems } from '@/lib/site-data';

export function Navigation() {
    const pathname = usePathname();
    const glassRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const glass = glassRef.current;
        if (!glass) return;

        const updateLight = (event: PointerEvent) => {
            const bounds = glass.getBoundingClientRect();
            glass.style.setProperty('--light-x', `${event.clientX - bounds.left}px`);
            glass.style.setProperty('--light-y', `${event.clientY - bounds.top}px`);
        };
        const resetLight = () => {
            glass.style.setProperty('--light-x', '50%');
            glass.style.setProperty('--light-y', '0%');
        };

        glass.addEventListener('pointermove', updateLight, { passive: true });
        glass.addEventListener('pointerleave', resetLight);
        return () => {
            glass.removeEventListener('pointermove', updateLight);
            glass.removeEventListener('pointerleave', resetLight);
        };
    }, []);

    return (
        <header className="site-header">
            <div className="nav-glass" ref={glassRef}>
                <nav className="nav-links" aria-label="Main navigation">
                    {navItems.map((item) => {
                        const active = pathname === item.href
                            || (item.href === '/work' && pathname.startsWith('/work/'))
                            || (item.href === '/about' && pathname === '/services');

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-link ${active ? 'nav-link-active' : ''}`}
                                aria-current={active ? 'page' : undefined}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
