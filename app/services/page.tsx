import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Services',
    description: 'Creative direction, production, cinematography, photography, editing, and campaign content from Zero Degree.',
    alternates: { canonical: '/services' },
};

export default function ServicesPage() {
    const capabilities = [
        ['Creative direction', 'Find the point of view. Shape the idea, visual language and campaign world.'],
        ['Campaign production', 'Take a campaign from a clear brief to a finished body of work.'],
        ['Cinematography', 'Build each frame around movement, texture, light and feeling.'],
        ['Photography', 'Create stills with the same intent and atmosphere as the moving image.'],
        ['Editing', 'Give every frame its place. Find the pace, shape and final rhythm.'],
        ['Motion / VFX', 'Extend an image with considered movement and post-production craft.'],
        ['Product photography', 'Make the details, material and form impossible to miss.'],
        ['Fashion films', 'Bring collection, character and movement into one visual story.'],
        ['Social content', 'Create platform-ready work without losing the idea behind it.'],
        ['Creator collaborations', 'Bring the right creative voices into the production.'],
    ];

    return (
        <div className="page-shell">
            <section className="section intro-block">
                <div className="eyebrow">Zero Degree / Capabilities</div>
                <h1 className="page-title">From first thought to final frame.</h1>
            </section>

            <section className="services-intro">
                <p>One studio across the whole process. Pull in at the idea, stay through the making, and leave with work ready for the world.</p>
                <div>
                    <Image
                        src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=85"
                        alt="Wide cinematic landscape at the edge of golden hour"
                        width={1500}
                        height={850}
                        sizes="(max-width: 620px) 100vw, 58vw"
                    />
                    <span>IDEA / SET / SCREEN</span>
                </div>
            </section>

            <section className="services-list" aria-label="Zero Degree services">
                {capabilities.map(([service, description], index) => (
                    <article key={service} className="service-row">
                        <span className="service-index">0{index + 1}</span>
                        <h2>{service}</h2>
                        <p>{description}</p>
                        <span className="service-arrow" aria-hidden="true">↗</span>
                    </article>
                ))}
            </section>
        </div>
    );
}
