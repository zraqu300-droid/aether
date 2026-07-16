import { useRef, useCallback, useState, useEffect } from 'react';

type JoystickProps = {
  onMove: (x: number, y: number) => void;
  onEnd: () => void;
};

export default function Joystick({ onMove, onEnd }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const touchId = useRef<number | null>(null);

  const handleStart = useCallback((clientX: number, clientY: number, id?: number) => {
    if (touchId.current !== null && id !== undefined && touchId.current !== id) return;
    if (id !== undefined) touchId.current = id;
    setActive(true);
    updateKnob(clientX, clientY);
  }, []);

  const updateKnob = useCallback((clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const maxR = rect.width / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setKnobPos({ x: dx, y: dy });
    onMove(dx / maxR, dy / maxR);
  }, [onMove]);

  const handleEnd = useCallback(() => {
    setActive(false);
    setKnobPos({ x: 0, y: 0 });
    touchId.current = null;
    onEnd();
  }, [onEnd]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (touchId.current === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === touchId.current) {
          updateKnob(e.touches[i].clientX, e.touches[i].clientY);
          e.preventDefault();
          break;
        }
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId.current) {
          handleEnd();
          break;
        }
      }
    };
    if (active) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [active, updateKnob, handleEnd]);

  return (
    <div
      ref={baseRef}
      onPointerDown={(e) => handleStart(e.clientX, e.clientY)}
      onPointerMove={(e) => active && updateKnob(e.clientX, e.clientY)}
      onPointerUp={handleEnd}
      onPointerLeave={handleEnd}
      className="relative w-32 h-32 rounded-full glass border-2 border-white/10 touch-none select-none"
      style={{ touchAction: 'none' }}
    >
      <div className="absolute inset-2 rounded-full border border-impact-400/20" />
      <div
        className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-impact-400/60 to-aether-500/40 border border-impact-300/40 shadow-lg shadow-impact-500/20 transition-transform"
        style={{
          transform: `translate(calc(-50% + ${knobPos.x}px), calc(-50% + ${knobPos.y}px))`,
          left: '50%',
          top: '50%',
        }}
      >
        <div className="absolute inset-2 rounded-full bg-impact-400/20" />
      </div>
    </div>
  );
}
