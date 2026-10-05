import type { Metadata } from 'next';
import Image from 'next/image';
import { ContactForm } from '@/components/contact-form';

export const metadata: Metadata = {
    title: 'Contact',
    description: 'Start a conversation with Zero Degree about your next campaign, production, or creative idea.',
    alternates: { canonical: '/contact' },
};

export default function ContactPage() {
    const configuredInstagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/heyzerodegree/?hl=en';
    const instagramUrl = configuredInstagramUrl.startsWith('https://www.instagram.com/')
        ? configuredInstagramUrl
        : null;
    const studioLocation = process.env.NEXT_PUBLIC_STUDIO_LOCATION ?? 'Mumbai, India';

    return (
        <div className="page-shell contact-page">
            <section className="section intro-block narrow">
                <div className="eyebrow">Zero Degree / Contact</div>
                <h1 className="page-title">Let’s build<br />something.</h1>
            </section>

            <section className="contact-layout">
                <div className="contact-details">
                    <p className="contact-kicker">Campaigns, films, collaborations, and good ideas.</p>
                    <a className="contact-email" href="mailto:hello@zerodegree.studio">hello@zerodegree.studio <span aria-hidden="true">↗</span></a>
                    <dl className="contact-social">
                        <div>
                            <dt>EMAIL</dt>
                            <dd><a href="mailto:hello@zerodegree.studio">hello@zerodegree.studio</a></dd>
                        </div>
                        <div>
                            <dt>INSTAGRAM</dt>
                            <dd>
                                {instagramUrl
                                    ? <a href={instagramUrl} target="_blank" rel="noreferrer">Follow Zero Degree ↗</a>
                                    : <a href="mailto:hello@zerodegree.studio?subject=Zero%20Degree%20Instagram">Ask us for our Instagram ↗</a>}
                            </dd>
                        </div>
                        <div>
                            <dt>LOCATION</dt>
                            <dd>{studioLocation}</dd>
                        </div>
                    </dl>
                </div>
                <ContactForm />
            </section>

            <section className="contact-atmosphere" aria-label="A glimpse into the creative process">
                <Image
                    src="https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=2000&q=85"
                    alt="A camera operator filming on location"
                    width={2000}
                    height={1000}
                    sizes="(max-width: 620px) 100vw, 84vw"
                />
                <span>IDEAS DON’T MAKE THEMSELVES.</span>
            </section>
        </div>
    );
}
