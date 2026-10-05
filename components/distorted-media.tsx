'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createWebGLProgram } from '@/lib/webgl';

const vertexShader = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 v_uv;
  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  uniform vec2 u_imageSize;
  uniform vec3 u_trail[8];
  uniform float u_time;

  vec2 coverUv(vec2 uv) {
    float imageAspect = u_imageSize.x / u_imageSize.y;
    float frameAspect = u_resolution.x / u_resolution.y;
    if (imageAspect > frameAspect) {
      uv.x = (uv.x - 0.5) * frameAspect / imageAspect + 0.5;
    } else {
      uv.y = (uv.y - 0.5) * imageAspect / frameAspect + 0.5;
    }
    return uv;
  }

  void main() {
    vec2 displacement = vec2(0.0);
    float strongest = 0.0;

    for (int i = 0; i < 8; i++) {
      vec2 delta = v_uv - u_trail[i].xy;
      float distanceFromTrail = length(delta);
      float influence = exp(-distanceFromTrail * distanceFromTrail * 150.0) * u_trail[i].z;
      float ripple = sin(distanceFromTrail * 52.0 - u_time * 0.012) * 0.003;
      displacement += normalize(delta + vec2(0.00001)) * influence * (0.025 + ripple);
      strongest = max(strongest, influence);
    }

    vec2 sampleUv = clamp(coverUv(v_uv - displacement), 0.001, 0.999);
    vec2 chromaticOffset = normalize(displacement + vec2(0.00001)) * strongest * 0.003;
    vec4 color = texture2D(u_texture, sampleUv);
    color.r = texture2D(u_texture, clamp(sampleUv + chromaticOffset, 0.001, 0.999)).r;
    color.b = texture2D(u_texture, clamp(sampleUv - chromaticOffset, 0.001, 0.999)).b;
    gl_FragColor = color;
  }
`;

type TrailPoint = {
  x: number;
  y: number;
  strength: number;
  time: number;
};

type DistortedMediaProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  imageClassName?: string;
  objectPosition?: string;
  sizes?: string;
  priority?: boolean;
};

export function DistortedMedia({
  src,
  alt,
  width,
  height,
  className = '',
  imageClassName = '',
  objectPosition = 'center',
  sizes = '100vw',
  priority = false,
}: DistortedMediaProps) {
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const media = mediaRef.current;
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!media || !image || !canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const trail: TrailPoint[] = [];
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let texture: WebGLTexture | null = null;
    let uniforms: {
      texture: WebGLUniformLocation;
      resolution: WebGLUniformLocation;
      imageSize: WebGLUniformLocation;
      trail: WebGLUniformLocation;
      time: WebGLUniformLocation;
    } | null = null;
    let animationFrame = 0;
    let previousPointerTime = 0;
    let previousPointerX = 0.5;
    let previousPointerY = 0.5;
    let resizeObserver: ResizeObserver | undefined;

    const setStatus = (status: 'ready' | 'fallback') => {
      media.dataset.webglStatus = status;
      window.dispatchEvent(new Event('zero:webgl-ready'));
    };

    const render = (time: number) => {
      if (!gl || !program || !buffer || !texture || !uniforms) return;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1 : 1.5);
      const width = Math.max(1, Math.round(media.clientWidth * pixelRatio));
      const height = Math.max(1, Math.round(media.clientHeight * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      const trailValues = new Float32Array(24);
      const activeTrail = trail.filter((point) => time - point.time < 700);
      activeTrail.forEach((point, index) => {
        const age = Math.max(0, (time - point.time) / 700);
        trailValues[index * 3] = point.x;
        trailValues[index * 3 + 1] = point.y;
        trailValues[index * 3 + 2] = point.strength * (1 - age) * (1 - age);
      });
      trail.splice(0, trail.length, ...activeTrail);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniforms.texture, 0);
      gl.uniform2f(uniforms.resolution, width, height);
      gl.uniform2f(uniforms.imageSize, image.naturalWidth, image.naturalHeight);
      gl.uniform3fv(uniforms.trail, trailValues);
      gl.uniform1f(uniforms.time, time);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!reducedMotion.matches && !document.hidden && activeTrail.length > 0) {
        animationFrame = requestAnimationFrame(render);
      } else {
        animationFrame = 0;
      }
    };

    const requestDraw = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(render);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reducedMotion.matches) return;

      const bounds = media.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      const y = 1 - Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      const now = performance.now();
      const elapsed = Math.max(1, now - previousPointerTime);
      const speed = Math.hypot(x - previousPointerX, y - previousPointerY) / elapsed;
      trail.unshift({ x, y, strength: Math.min(1, 0.24 + speed * 9), time: now });
      trail.length = Math.min(trail.length, 8);
      previousPointerX = x;
      previousPointerY = y;
      previousPointerTime = now;
      requestDraw();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        requestDraw();
      }
    };

    const onMotionPreferenceChange = () => {
      trail.length = 0;
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      requestDraw();
    };

    const initialize = () => {
      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        setImageFailed(true);
        setStatus('fallback');
        return;
      }
      if (window.matchMedia('(pointer: coarse)').matches) {
        setStatus('fallback');
        return;
      }

      try {
        gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
        if (!gl) {
          setStatus('fallback');
          return;
        }

        program = createWebGLProgram(gl, vertexShader, fragmentShader);
        const context = gl;
        const linkedProgram = program;
        const getUniform = (name: string) => {
          const location = context.getUniformLocation(linkedProgram, name);
          if (!location) throw new Error(`Unable to find media shader uniform ${name}`);
          return location;
        };
        uniforms = {
          texture: getUniform('u_texture'),
          resolution: getUniform('u_resolution'),
          imageSize: getUniform('u_imageSize'),
          trail: getUniform('u_trail[0]'),
          time: getUniform('u_time'),
        };
        buffer = gl.createBuffer();
        texture = gl.createTexture();
        if (!buffer || !texture) throw new Error('Unable to allocate media shader resources');

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.clearColor(0, 0, 0, 1);

        media.addEventListener('pointermove', onPointerMove, { passive: true });
        document.addEventListener('visibilitychange', onVisibilityChange);
        reducedMotion.addEventListener('change', onMotionPreferenceChange);
        resizeObserver = new ResizeObserver(requestDraw);
        resizeObserver.observe(media);
        setStatus('ready');
        requestDraw();
      } catch (error) {
        console.error('Media distortion could not be initialized', error);
        setStatus('fallback');
      }
    };

    const onImageError = () => {
      setImageFailed(true);
      setStatus('fallback');
    };
    image.addEventListener('error', onImageError);
    if (image.complete) initialize();
    else image.addEventListener('load', initialize, { once: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      image.removeEventListener('error', onImageError);
      image.removeEventListener('load', initialize);
      media.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', onMotionPreferenceChange);
      resizeObserver?.disconnect();
      if (gl && texture) gl.deleteTexture(texture);
      if (gl && buffer) gl.deleteBuffer(buffer);
      if (gl && program) gl.deleteProgram(program);
    };
  }, [src]);

  return (
    <div
      ref={mediaRef}
      className={`distorted-media ${className}`.trim()}
      data-webgl-status="pending"
      data-image-failed={imageFailed}
    >
      <Image
        ref={imageRef}
        className={`distorted-media-image ${imageClassName}`.trim()}
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onError={() => setImageFailed(true)}
        style={{ objectPosition }}
      />
      <span className="distorted-media-fallback" aria-hidden="true">ZERO DEGREE<span>.</span></span>
      <canvas ref={canvasRef} className="distorted-media-canvas" aria-hidden="true" />
    </div>
  );
}
