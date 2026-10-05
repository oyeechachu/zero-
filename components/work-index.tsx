'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type PointerEvent as ReactPointerEvent, type FocusEvent, useCallback, useEffect, useRef, useState } from 'react';
import type { Project } from '@/lib/site-data';
import { saveProjectTransition } from '@/lib/project-transition';

type WorkIndexProps = {
  projects: Project[];
  variant?: 'archive' | 'home';
};

export function WorkIndex({ projects, variant = 'archive' }: WorkIndexProps) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const activeProjectRef = useRef<string | null>(null);
  const frameRef = useRef(0);
  const pointer = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    vx: 0,
    angle: 0,
    rotation: 0,
  });
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const activeProject = projects.find((project) => project.slug === activeSlug);

  const animatePreview = useCallback(function animate() {
    const preview = previewRef.current;
    if (!preview || !activeProjectRef.current) {
      frameRef.current = 0;
      return;
    }

    const motion = pointer.current;
    motion.vx += (motion.targetX - motion.x) * 0.13;
    motion.x += motion.vx;
    motion.vx *= 0.78;
    motion.y += (motion.targetY - motion.y) * 0.13;
    motion.angle += (motion.rotation - motion.angle) * 0.12;
    preview.style.transform = `translate3d(${motion.x}px, ${motion.y}px, 0) translate3d(0, -50%, 0) rotate(${motion.angle}deg)`;
    frameRef.current = requestAnimationFrame(animate);
  }, []);

  const activateProject = (project: Project, x: number, y: number) => {
    const wasInactive = !activeProjectRef.current;
    activeProjectRef.current = project.slug;
    setActiveSlug(project.slug);
    const motion = pointer.current;
    const previewWidth = Math.min(window.innerWidth * 0.36, 460);
    motion.targetX = Math.max(20, Math.min(window.innerWidth - previewWidth - 20, x + 28));
    motion.targetY = y;
    if (wasInactive) {
      motion.x = motion.targetX;
      motion.y = motion.targetY;
    }
    if (!frameRef.current) frameRef.current = requestAnimationFrame(animatePreview);
  };

  const updatePosition = (event: ReactPointerEvent<HTMLElement>) => {
    const motion = pointer.current;
    const previewWidth = Math.min(window.innerWidth * 0.36, 460);
    const nextX = Math.max(20, Math.min(window.innerWidth - previewWidth - 20, event.clientX + 28));
    const deltaX = nextX - motion.targetX;
    motion.targetX = nextX;
    motion.targetY = event.clientY;
    motion.rotation = Math.max(-1.8, Math.min(1.8, deltaX * 0.025));
  };

  const clearProject = () => {
    activeProjectRef.current = null;
    setActiveSlug(null);
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
  };

  const handleBlur = (event: FocusEvent<HTMLAnchorElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) clearProject();
  };

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  return (
    <div className="work-index">
      <section className="work-index-heading">
        <div className="work-index-overline">
          <span>{variant === 'home' ? 'ZERO DEGREE / CREATIVE STUDIO' : 'ZERO DEGREE / WORK'}</span>
          <span>{variant === 'home' ? 'DIRECTION / IMAGE / PRODUCTION' : 'INDEPENDENT CREATIVE STUDIO'}</span>
        </div>
        <h1>{variant === 'home' ? <>WE BUILD<br />THE WAY<br />IT IS SEEN<span>.</span></> : <>SELECTED<br />WORK<span>.</span></>}</h1>
        <div className="work-index-intro">
          <p>{variant === 'home'
            ? <>Creative production for film, fashion<br />and the culture around us.</>
            : <>Ideas made tangible.<br />A selection of recent collaborations.</>}</p>
          <span>{String(projects.length).padStart(2, '0')} PROJECTS / 2023—25</span>
        </div>
      </section>

      <div className="work-index-labels" aria-hidden="true">
        <span>PROJECT</span>
        <span>CLIENT</span>
        <span>YEAR</span>
      </div>

      <div className="work-index-list" onPointerLeave={clearProject}>
        {projects.map((project, index) => (
          <Link
            key={project.slug}
            href={`/work/${project.slug}`}
            className={`work-index-row ${activeSlug === project.slug ? 'is-active' : ''}`}
            onPointerEnter={(event) => activateProject(project, event.clientX, event.clientY)}
            onPointerMove={updatePosition}
            onFocus={(event) => activateProject(project, window.innerWidth / 2, event.currentTarget.getBoundingClientRect().top + 60)}
            onBlur={handleBlur}
            onClick={(event) => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              const preview = previewRef.current;
              const previewImage = preview?.querySelector('img');
              const mobileImage = event.currentTarget.querySelector<HTMLImageElement>('.work-row-mobile-media img');
              const image = previewImage && preview && preview.getBoundingClientRect().width > 0
                ? previewImage
                : mobileImage;
              const bounds = image === previewImage ? preview?.getBoundingClientRect() : mobileImage?.getBoundingClientRect();
              if (image && bounds) saveProjectTransition(project.slug, image.currentSrc || image.src, bounds);
              clearProject();
            }}
          >
            <span className="work-row-number">0{index + 1}</span>
            <span className="work-row-title">{project.title}</span>
            <span className="work-row-client">{project.client}</span>
            <span className="work-row-year">{project.year}</span>
            <span className="work-row-arrow" aria-hidden="true">↗</span>
            <span className="work-row-mobile-media">
              <Image
                src={project.image}
                alt=""
                width={520}
                height={360}
                sizes="90vw"
              />
            </span>
          </Link>
        ))}
      </div>

      <p className="work-index-end">
        {variant === 'home'
          ? <Link href="/work" className="work-index-all">VIEW ALL WORK <span aria-hidden="true">↗</span></Link>
          : 'A FEW THINGS WE’VE MADE, WITH A FEW PEOPLE WE LIKE.'}
      </p>

      <div
        className="work-preview"
        ref={previewRef}
        data-visible={Boolean(activeProject)}
        aria-hidden="true"
      >
        {activeProject && (
          <>
            <Image
              key={activeProject.slug}
              src={activeProject.image}
              alt=""
              width={760}
              height={560}
              sizes="(max-width: 1100px) 36vw, 32vw"
            />
            <span>{activeProject.category} / {activeProject.year}</span>
          </>
        )}
      </div>
    </div>
  );
}
