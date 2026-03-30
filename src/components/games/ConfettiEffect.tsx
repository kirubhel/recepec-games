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
      
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => {
        clearInterval(interval);
      };
    } else if (!active) {
      hasRun.current = false;
    }
  }, [active, onComplete]);

  return null;
}
