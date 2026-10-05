'use client';

import { useEffect, useRef } from 'react';
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
  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform float u_time;
  uniform float u_scroll;
  uniform float u_footer;

  float noise(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yxz + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  void main() {
    vec2 uv = v_uv;
    vec2 centered = uv - vec2(0.5);
    centered.x *= u_resolution.x / u_resolution.y;
    float pointerDistance = length(centered - vec2((u_pointer.x - 0.5) * 0.38, -(u_pointer.y - 0.5) * 0.38));
    float interaction = exp(-pointerDistance * 5.5);
    float aspect = u_resolution.x / u_resolution.y;
    vec2 point = uv - vec2(0.5);
    point.x *= aspect;
    point += vec2(sin(u_time * 0.23) * 0.018, cos(u_time * 0.19) * 0.025);
    point.y += u_scroll * 0.08;

    float radius = u_footer > 0.5 ? 0.31 : 0.34;
    point += normalize(point + vec2(0.0001)) * interaction * 0.035;
    float distanceToSphere = length(point) - radius;
    float sphereMask = 1.0 - smoothstep(-0.003, 0.008, distanceToSphere);
    float edge = exp(-abs(distanceToSphere) * 32.0);
    vec3 normal = normalize(vec3(point * -1.0, sqrt(max(radius * radius - dot(point, point), 0.001))));
    vec3 light = normalize(vec3(-0.48 + (u_pointer.x - 0.5) * 0.7, 0.7, 0.8));
    float diffuse = max(dot(normal, light), 0.0);
    float specular = pow(max(dot(reflect(-light, normal), vec3(0.0, 0.0, 1.0)), 0.0), 24.0);
    float grain = noise(vec3(uv * u_resolution * 0.22, u_time * 0.4)) - 0.5;
    float redRim = smoothstep(0.46, 0.88, edge + interaction * 0.32);

    vec3 base = mix(vec3(0.76, 0.75, 0.72), vec3(0.98, 0.97, 0.94), diffuse);
    base += specular * vec3(0.42, 0.41, 0.38);
    base = mix(base, vec3(0.77, 0.025, 0.035), redRim * 0.82);
    base += grain * 0.035;

    float shadow = (1.0 - smoothstep(0.0, 0.12, distanceToSphere)) * 0.15;
    float alpha = max(sphereMask * 0.96, shadow);
    gl_FragColor = vec4(base, alpha);
  }
`;

type WebglOrbProps = {
  variant?: 'hero' | 'footer';
};

export function WebglOrb({ variant = 'hero' }: WebglOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let uniforms: {
      resolution: WebGLUniformLocation;
      pointer: WebGLUniformLocation;
      time: WebGLUniformLocation;
      scroll: WebGLUniformLocation;
      footer: WebGLUniformLocation;
    } | null = null;
    let animationFrame = 0;
    let previousTime = 0;
    let scrollProgress = 0;
    let intersectionObserver: IntersectionObserver | undefined;
    const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

    const setStatus = (status: 'ready' | 'fallback') => {
      canvas.dataset.webglStatus = status;
      window.dispatchEvent(new Event('zero:webgl-ready'));
    };

    const updatePointer = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      pointer.targetX = (event.clientX - bounds.left) / bounds.width;
      pointer.targetY = (event.clientY - bounds.top) / bounds.height;
    };

    const updateScroll = () => {
      const bounds = host.getBoundingClientRect();
      scrollProgress = Math.max(-1, Math.min(1, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)));
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else if (!reducedMotion.matches && !animationFrame) {
        previousTime = 0;
        animationFrame = requestAnimationFrame(render);
      }
    };

    const onMotionPreferenceChange = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      previousTime = 0;
      if (!document.hidden) animationFrame = requestAnimationFrame(render);
    };

    const render = (time: number) => {
      if (!gl || !program || !buffer || !uniforms) return;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1 : 1.5);
      const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
      previousTime = time;
      const smoothing = 1 - Math.exp(-delta * 7);
      pointer.x += (pointer.targetX - pointer.x) * smoothing;
      pointer.y += (pointer.targetY - pointer.y) * smoothing;

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(uniforms.resolution, width, height);
      gl.uniform2f(uniforms.pointer, pointer.x, pointer.y);
      gl.uniform1f(uniforms.time, reducedMotion.matches ? 0 : time * 0.001);
      gl.uniform1f(uniforms.scroll, reducedMotion.matches ? 0 : scrollProgress);
      gl.uniform1f(uniforms.footer, variant === 'footer' ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!reducedMotion.matches && !document.hidden) {
        animationFrame = requestAnimationFrame(render);
      } else {
        animationFrame = 0;
      }
    };

    const initialize = () => {
      if (canvas.dataset.webglStatus !== 'pending') return;

      try {
        gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
        if (!gl) {
          setStatus('fallback');
          return;
        }

        program = createWebGLProgram(gl, vertexShader, fragmentShader);
        const context = gl;
        const linkedProgram = program;
        const getUniform = (name: string) => {
          const location = context.getUniformLocation(linkedProgram, name);
          if (!location) throw new Error(`Unable to find WebGL uniform ${name}`);
          return location;
        };
        uniforms = {
          resolution: getUniform('u_resolution'),
          pointer: getUniform('u_pointer'),
          time: getUniform('u_time'),
          scroll: getUniform('u_scroll'),
          footer: getUniform('u_footer'),
        };

        buffer = gl.createBuffer();
        if (!buffer) throw new Error('Unable to create WebGL geometry buffer');

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);

        host.addEventListener('pointermove', updatePointer, { passive: true });
        window.addEventListener('scroll', updateScroll, { passive: true });
        document.addEventListener('visibilitychange', onVisibilityChange);
        reducedMotion.addEventListener('change', onMotionPreferenceChange);
        updateScroll();
        setStatus('ready');
        animationFrame = requestAnimationFrame(render);
      } catch (error) {
        console.error('WebGL artwork could not be initialized', error);
        setStatus('fallback');
      }
    };

    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          intersectionObserver?.disconnect();
          initialize();
        }
      }, { rootMargin: '240px' });
      intersectionObserver.observe(host);
    } else {
      initialize();
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      intersectionObserver?.disconnect();
      host.removeEventListener('pointermove', updatePointer);
      window.removeEventListener('scroll', updateScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', onMotionPreferenceChange);
      if (gl && buffer) gl.deleteBuffer(buffer);
      if (gl && program) gl.deleteProgram(program);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className={`webgl-orb webgl-orb-${variant}`}
      aria-hidden="true"
      data-webgl-status="pending"
    />
  );
}
