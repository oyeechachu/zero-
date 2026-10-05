'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { MediaSource } from '@/lib/media';

const noVideoSources: MediaSource[] = [];

type MediaProps = {
  imageSrc: string;
  alt: string;
  width: number;
  height: number;
  videoSources?: MediaSource[];
  poster?: string;
  objectPosition?: string;
  sizes?: string;
  priority?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
};

export function Media({
  imageSrc,
  alt,
  width,
  height,
  videoSources = noVideoSources,
  poster = imageSrc,
  objectPosition = 'center',
  sizes = '100vw',
  priority = false,
  autoplay = true,
  loop = true,
  className = '',
}: MediaProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fallbackRef = useRef<HTMLImageElement | null>(null);
  const [activeVideo, setActiveVideo] = useState(() => videoSources.find((source) => !source.media) ?? videoSources[0]);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!videoSources.length) return;

    const mediaQueries = videoSources
      .map((source) => source.media)
      .filter((media): media is string => Boolean(media))
      .map((media) => window.matchMedia(media));
    const selectSource = () => {
      const source = videoSources.find((candidate) => candidate.media && window.matchMedia(candidate.media).matches)
        ?? videoSources.find((candidate) => !candidate.media)
        ?? videoSources[0];
      if (activeVideo?.src !== source.src) {
        setVideoReady(false);
        setVideoFailed(false);
      }
      setActiveVideo((current) => current?.src === source.src ? current : source);
    };

    mediaQueries.forEach((query) => query.addEventListener('change', selectSource));
    selectSource();

    return () => {
      mediaQueries.forEach((query) => query.removeEventListener('change', selectSource));
    };
  }, [activeVideo?.src, videoSources]);

  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video || !activeVideo) return;

    const startPlayback = () => {
      if (!autoplay || videoFailed) return;
      video.preload = 'metadata';
      void video.play().catch((error: unknown) => {
        if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'AbortError')) return;
        console.error('Project video could not play', error);
      });
    };

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          startPlayback();
        } else {
          video.pause();
        }
      }, { rootMargin: '180px' })
      : null;

    if (observer) observer.observe(frame);
    else startPlayback();

    return () => {
      observer?.disconnect();
      video.pause();
    };
  }, [activeVideo, autoplay, videoFailed]);

  const handleVideoError = () => {
    setVideoFailed(true);
    console.error('Project video failed to load', activeVideo?.src);
  };

  return (
    <div
      ref={frameRef}
      className={`media-frame ${className}`.trim()}
      data-video-ready={videoReady}
      data-video-failed={videoFailed}
      data-image-failed={imageFailed}
    >
      <Image
        ref={fallbackRef}
        className="media-poster"
        src={poster}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        style={{ objectPosition }}
        onError={() => setImageFailed(true)}
      />
      {activeVideo && (
        <video
          key={activeVideo.src}
          ref={videoRef}
          className="media-video"
          src={activeVideo.src}
          poster={poster}
          muted
          loop={loop}
          playsInline
          preload="none"
          controls={!autoplay}
          aria-label={alt}
          onLoadedData={() => setVideoReady(true)}
          onError={handleVideoError}
        />
      )}
      <span className="media-unavailable" aria-hidden="true">ZERO DEGREE<span>.</span></span>
    </div>
  );
}
