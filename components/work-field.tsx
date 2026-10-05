'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import type { Project } from '@/lib/site-data';
import { saveProjectTransition } from '@/lib/project-transition';

type WorkFieldProps = {
  projects: Project[];
};

type MediaLayer = {
  key: number;
  project: Project;
  visible: boolean;
};

const transitionDuration = 280;

export function WorkField({ projects }: WorkFieldProps) {
  const cells = projects.length
    ? Array.from({ length: 16 }, (_, index) => projects[index % projects.length])
    : [];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [layers, setLayers] = useState<MediaLayer[]>([]);
  const activeIndexRef = useRef<number | null>(null);
  const layersRef = useRef<MediaLayer[]>([]);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const layerKeyRef = useRef(0);
  const frameRef = useRef(0);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<number | null>(null);

  const updateLayers = (next: MediaLayer[]) => {
    layersRef.current = next;
    setLayers(next);
  };

  const clearTimers = () => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  };

  const mostVisibleLayer = () => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-work-layer]'));
    const mostVisibleElement = elements
      .map((element) => ({
        key: Number(element.dataset.workLayer),
        opacity: Number.parseFloat(window.getComputedStyle(element).opacity),
      }))
      .sort((left, right) => right.opacity - left.opacity)[0];

    return layersRef.current.find((layer) => layer.key === mostVisibleElement?.key)
      ?? layersRef.current.at(-1);
  };

  const activateProject = (index: number) => {
    const project = cells[index];
    if (!project || activeIndexRef.current === index) return;

    const previousIndex = activeIndexRef.current;
    activeIndexRef.current = index;
    setActiveIndex(index);

    if (previousIndex !== null && cells[previousIndex]?.slug === project.slug) return;

    clearTimers();
    const previousLayer = mostVisibleLayer();
    const nextKey = ++layerKeyRef.current;
    const nextLayers: MediaLayer[] = [
      ...(previousLayer ? [{ ...previousLayer, visible: false }] : []),
      { key: nextKey, project, visible: false },
    ];
    updateLayers(nextLayers);

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      updateLayers(layersRef.current.map((layer) => (
        layer.key === nextKey ? { ...layer, visible: true } : layer
      )));
    });

    clearTimerRef.current = setTimeout(() => {
      clearTimerRef.current = null;
      updateLayers(layersRef.current.filter((layer) => layer.visible));
    }, transitionDuration);
  };

  const deactivateProject = () => {
    if (activeIndexRef.current === null) return;

    activeIndexRef.current = null;
    setActiveIndex(null);
    clearTimers();
    const currentLayer = layersRef.current.at(-1);
    if (!currentLayer) return;

    updateLayers([{ ...currentLayer, visible: false }]);
    clearTimerRef.current = setTimeout(() => {
      clearTimerRef.current = null;
      updateLayers([]);
    }, transitionDuration);
  };

  const handleGridPointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    if (event.relatedTarget instanceof Node && gridRef.current?.contains(event.relatedTarget)) return;
    if (gridRef.current?.contains(document.activeElement)) return;
    deactivateProject();
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, index: number, project: Project) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
      const isSecondTap = lastTapRef.current === index;
      if (!isSecondTap) {
        event.preventDefault();
        lastTapRef.current = index;
        if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
        tapTimerRef.current = setTimeout(() => {
          lastTapRef.current = null;
          tapTimerRef.current = null;
        }, 1800);
        activateProject(index);
        return;
      }
      lastTapRef.current = null;
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }
    }

    saveProjectTransition(
      project.slug,
      project.poster ?? project.image,
      new DOMRect(0, 0, window.innerWidth, window.innerHeight),
    );
  };

  useEffect(() => () => {
    cancelAnimationFrame(frameRef.current);
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
  }, []);

  return (
    <section className="work-field" aria-labelledby="work-field-heading">
      <h1 id="work-field-heading" className="work-field-heading">Zero Degree / Selected Work</h1>
      <div className="work-field-background" aria-hidden="true">
        {layers.map((layer) => (
          <div
            key={layer.key}
            className="work-field-media"
            data-visible={layer.visible}
            data-work-layer={layer.key}
          >
            <Image
              src={layer.project.poster ?? layer.project.image}
              alt=""
              fill
              sizes="100vw"
              loading="eager"
              style={{ objectPosition: layer.project.objectPosition ?? 'center' }}
            />
            {layer.project.videoSources?.[0] && (
              <video
                key={layer.project.videoSources[0].src}
                src={layer.project.videoSources[0].src}
                poster={layer.project.poster ?? layer.project.image}
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                onError={(event) => {
                  console.error('Work field video could not load', layer.project.videoSources?.[0]?.src);
                  event.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="work-field-grid" ref={gridRef} onPointerLeave={handleGridPointerLeave}>
        {cells.map((project, index) => (
          <Link
            key={`${project.slug}-${index}`}
            href={`/work/${project.slug}`}
            className="work-field-cell"
            data-active={activeIndex === index}
            aria-label={`${project.title}, ${project.client}, ${project.year}`}
            onPointerEnter={(event) => {
              if (event.pointerType !== 'touch') activateProject(index);
            }}
            onFocus={() => activateProject(index)}
            onClick={(event) => handleClick(event, index, project)}
          >
            <span className="work-field-project">{project.title}</span>
            <span className="work-field-meta">
              <span>{project.client}</span>
              <span>{project.year}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="work-field-preload" aria-hidden="true">
        {projects.slice(0, 4).map((project) => (
          <Image
            key={project.slug}
            src={project.poster ?? project.image}
            alt=""
            width={1600}
            height={1000}
            sizes="100vw"
            loading="eager"
          />
        ))}
      </div>
    </section>
  );
}
