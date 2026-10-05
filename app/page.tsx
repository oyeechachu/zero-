import type { Metadata } from 'next';
import Link from 'next/link';
import { HomeMotion } from '@/components/home-motion';
import { WorkIndex } from '@/components/work-index';
import { projects } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Creative Studio & Production House',
  description: 'Zero Degree is a creative production studio working across direction, film, image, and culture.',
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <HomeMotion>
      <div className="home-page">
        <WorkIndex projects={projects.slice(0, 3)} variant="home" />
        <section className="home-studio-note">
          <p className="eyebrow">INDEPENDENT CREATIVE STUDIO / MUMBAI, INDIA</p>
          <p>
            Zero Degree works across creative direction, production, cinematography,
            photography and post — building the way ideas are seen.
          </p>
          <div className="home-studio-links">
            <Link href="/about">A little about us <span aria-hidden="true">↗</span></Link>
            <Link href="/services">What we do <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </div>
    </HomeMotion>
  );
}
