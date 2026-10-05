import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About',
    description: 'Meet Zero Degree, a creative studio and production house bringing visual ideas from direction through to final cut.',
    alternates: { canonical: '/about' },
};

export default function AboutPage() {
    return (
        <div className="page-shell">
            <section className="section intro-block narrow">
                <div className="eyebrow">Zero Degree / Info</div>
                <h1 className="page-title">We build the way it is seen.</h1>
            </section>

            <section className="about-story">
                <div className="about-text">
                    <p>
                        Zero Degree is a creative production studio built around the intersection of direction,
                        cinematography, photography, editing and culture.
                    </p>
                    <p>
                        We build campaigns, films and visual systems designed to be seen — bringing a clear point
                        of view from the first conversation through the final frame.
                    </p>
                    <span className="about-signoff">CREATIVE STUDIO × PRODUCTION HOUSE</span>
                </div>
                <div className="about-image-pair">
                    <div className="about-image">
                        <Image
                            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85"
                            alt="Editorial fashion portrait in warm natural light"
                            width={1200}
                            height={1400}
                            sizes="(max-width: 620px) 90vw, 48vw"
                        />
                    </div>
                    <div className="about-image about-image-detail">
                        <Image
                            src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=900&q=85"
                            alt="Cinematography camera framing a film scene"
                            width={900}
                            height={1200}
                            sizes="(max-width: 620px) 60vw, 25vw"
                        />
                        <span>POINT OF VIEW / 01</span>
                    </div>
                </div>
            </section>

            <section className="about-principle">
                <p className="eyebrow">HOW WE WORK</p>
                <h2>One point of view.<br />Every frame considered.</h2>
                <p>Direction, making, and post-production work together as one continuous process.</p>
                <Link className="text-link" href="/services">Explore our capabilities <span aria-hidden="true">↗</span></Link>
            </section>
        </div>
    );
}
