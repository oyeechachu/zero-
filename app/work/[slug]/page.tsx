import Link from 'next/link';
import type { Metadata } from 'next';
import { Media } from '@/components/media';
import { ProjectTransitionTarget } from '@/components/project-transition-target';
import { notFound } from 'next/navigation';
import { getProjectBySlug, projects } from '@/lib/site-data';
import { siteOrigin } from '@/lib/site-meta';

export function generateStaticParams() {
    return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const project = getProjectBySlug(slug);

    if (!project) notFound();

    return {
        title: `${project.title} — ${project.client}`,
        description: project.intro,
        alternates: { canonical: `/work/${project.slug}` },
        openGraph: {
            title: `${project.title} — ${project.client}`,
            description: project.intro,
            url: new URL(`/work/${project.slug}`, siteOrigin),
            images: [{ url: project.image, width: 1200, height: 900, alt: project.title }],
        },
    };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = getProjectBySlug(slug);

    if (!project) {
        notFound();
    }

    const projectIndex = projects.findIndex((item) => item.slug === project.slug);
    const nextProject = projects[(projectIndex + 1) % projects.length];

    return (
        <div className="page-shell project-editorial">
            <ProjectTransitionTarget slug={project.slug} />
            <div className="project-return">
                <Link href="/work">← All work</Link>
                <span>{String(projectIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
            </div>
            <section className="project-hero">
                <div className="project-hero-meta">
                    <span className="eyebrow">{project.client} / {project.year}</span>
                    <h1>{project.title}</h1>
                </div>
                <div className="project-hero-image-wrap" data-project-hero>
                    <Media
                        imageSrc={project.image}
                        alt={project.title}
                        width={1600}
                        height={1000}
                        videoSources={project.videoSources}
                        poster={project.poster}
                        objectPosition={project.objectPosition}
                        sizes="100vw"
                        priority
                    />
                </div>
            </section>

            <section className="project-summary">
                <div>
                    <p className="eyebrow">Category</p>
                    <p>{project.category}</p>
                </div>
                <div>
                    <p className="eyebrow">Client</p>
                    <p>{project.client}</p>
                </div>
            </section>

            <section className="project-description">
                <p className="eyebrow">{project.category}</p>
                <p className="story-intro">{project.intro}</p>
            </section>

            <section className="project-next">
                <div className="project-next-label">
                    <span className="eyebrow">Next project</span>
                    <span>{nextProject.client} / {nextProject.year}</span>
                </div>
                <Link href={`/work/${nextProject.slug}`} className="project-next-link">
                    <span>{nextProject.title}</span>
                    <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/work" className="project-all-work">Back to all work <span aria-hidden="true">↗</span></Link>
            </section>
        </div>
    );
}
