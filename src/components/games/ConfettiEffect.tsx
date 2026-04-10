'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiEffectProps {
  active: boolean;
  onComplete?: () => void;
}

export default function ConfettiEffect({ active, onComplete }: ConfettiEffectProps) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (active && !hasRun.current) {
      hasRun.current = true;
      
      const count = 200;
      const defaults = {
        origin: { y: 0.7 }
      };

      function fire(particleRatio: number, opts: any) {
        confetti(Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio)
        }));
      }

      // Massive Multi-Stage Burst (The "Throw")
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });

      // Secondary delay "throw"
      setTimeout(() => {
        fire(0.2, { spread: 60, startVelocity: 45, origin: { y: 0.8 } });
      }, 300);

      if (onComplete) {
        setTimeout(onComplete, 4000);
      }
    } else if (!active) {
      hasRun.current = false;
    }
  }, [active, onComplete]);

  return null;
}
