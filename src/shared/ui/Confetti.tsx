import { useEffect, useState } from 'react';

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

const COLORS = ['#edb1ff', '#ffd700', '#50c878', '#ff6b35', '#4169e1', '#c9a0ff'];
const PARTICLE_COUNT = 50;

interface Particle {
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  speedX: number;
  speedY: number;
  rotSpeed: number;
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: 50 + (Math.random() - 0.5) * 40,
    y: -10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 360,
    speedX: (Math.random() - 0.5) * 3,
    speedY: 1.5 + Math.random() * 3,
    rotSpeed: (Math.random() - 0.5) * 10,
  }));
}

/**
 * Confetti animation overlay — renderiza partículas caindo.
 * Ativa com `active={true}`, desaparece após `duration` ms.
 * Leve: CSS-only, sem canvas, sem lib externa.
 */
export function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    setParticles(createParticles());
    setVisible(true);
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [active, duration]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: '1px',
            transform: `rotate(${p.rotation}deg)`,
            animationDuration: `${2 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 0.5}s`,
            '--confetti-x': `${p.speedX * 100}px`,
            '--confetti-rot': `${p.rotation + p.rotSpeed * 50}deg`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
