'use client';

import { useEffect, useRef } from 'react';

const stiffness = 0.16;
const damping = 0.65;
const maxSpeed = 14;

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motion = {
      targetX: 0,
      targetY: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rotation: 0,
      appearance: 0.7,
      initialized: false,
    };
    const triangle = cursor.querySelector<SVGSVGElement>('svg');

    let frame = 0;
    let previousTime = 0;

    const isEnabled = () => finePointer.matches;

    const onPointerMove = (event: PointerEvent) => {
      if (!isEnabled() || event.pointerType === 'touch') return;

      motion.targetX = event.clientX;
      motion.targetY = event.clientY;

      if (!motion.initialized) {
        motion.x = event.clientX;
        motion.y = event.clientY;
        motion.initialized = true;
        motion.appearance = 0.7;
      }

      cursor.classList.add('cursor-visible');
    };

    const onPointerLeave = () => {
      cursor.classList.remove('cursor-visible');
      motion.initialized = false;
      motion.vx = 0;
      motion.vy = 0;
    };

    const animate = (time: number) => {
      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.033) : 1 / 60;
      const frameScale = delta * 60;
      previousTime = time;

      if (motion.initialized) {
        const dx = motion.targetX - motion.x;
        const dy = motion.targetY - motion.y;

        motion.vx += dx * stiffness * frameScale;
        motion.vy += dy * stiffness * frameScale;
        const frameDamping = Math.pow(damping, frameScale);
        motion.vx *= frameDamping;
        motion.vy *= frameDamping;
        motion.x += motion.vx * frameScale;
        motion.y += motion.vy * frameScale;
      }

      const speed = Math.hypot(motion.vx, motion.vy);
      const velocityFactor = Math.min(speed / maxSpeed, 1);
      if (triangle) {
        const targetRotation = speed > 0.12 ? Math.atan2(motion.vy, motion.vx) + Math.PI / 2 : 0;
        const angleDifference = Math.atan2(
          Math.sin(targetRotation - motion.rotation),
          Math.cos(targetRotation - motion.rotation),
        );
        motion.rotation += angleDifference * (1 - Math.exp(-delta / 0.1));
        triangle.style.transform = `rotate(${motion.rotation}rad)`;
      }

      motion.appearance += (1 - motion.appearance) * (1 - Math.exp(-delta / 0.11));
      cursor.style.transform =
        `translate3d(${motion.x}px, ${motion.y}px, 0) ` +
        'translate(-50%, -50%)';
      cursor.style.opacity = String(motion.appearance * (0.94 + velocityFactor * 0.06));

      frame = requestAnimationFrame(animate);
    };

    const syncMotionPreference = () => {
      if (isEnabled()) {
        if (!frame) {
          previousTime = 0;
          frame = requestAnimationFrame(animate);
        }
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
        cursor.classList.remove('cursor-visible');
        motion.initialized = false;
        motion.vx = 0;
        motion.vy = 0;
      }
    };

    document.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    finePointer.addEventListener('change', syncMotionPreference);
    syncMotionPreference();

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      finePointer.removeEventListener('change', syncMotionPreference);
    };
  }, []);

  return (
    <div ref={cursorRef} className="cursor" aria-hidden="true">
      <svg viewBox="0 0 100 100" focusable="false">
        <polygon points="50,8 94,88 6,88" />
      </svg>
    </div>
  );
}
