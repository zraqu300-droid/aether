import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../game/GameContext';
import { GameEngine } from '../game/engine';
import { hapticImpact, hapticNotify } from '../game/haptics';
import Joystick from './Joystick';
import HUD from './HUD';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { state, setWorldState, setNearbyEcho, triggerEchoInteraction, setProgress } = useGame();

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onStatsUpdate: (ws) => {
        setWorldState(ws);
        const healProg = engine.getHealProgress();
        const echoProg = engine.getEchoProgress();
        setProgress(healProg, echoProg);

        // Check for ending condition
        if (healProg >= 1 && echoProg >= 0.8) {
          hapticNotify('success');
        }
      },
      onEchoInteract: (echo) => {
        setNearbyEcho(echo);
        triggerEchoInteraction();
        if (echo.satisfied) hapticNotify('success');
        else hapticImpact('medium');
      },
      onHeal: () => {
        hapticImpact('light');
      },
    });

    engineRef.current = engine;
    engine.start();

    // Check for nearby echoes periodically
    const echoCheckInterval = setInterval(() => {
      const nearby = engine.interactWithEcho();
      // Only update prompt if echo is near and not satisfied
      const avatarPos = engine.avatar.group.position;
      let nearest: typeof nearby = null;
      let minDist = 5;
      engine.echoes.forEach((e) => {
        if (e.satisfied) return;
        const dist = avatarPos.distanceTo(e.position);
        if (dist < minDist) {
          minDist = dist;
          nearest = e;
        }
      });
      setNearbyEcho(nearest);
    }, 500);

    return () => {
      clearInterval(echoCheckInterval);
      engine.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync insight lens toggle to engine
  useEffect(() => {
    engineRef.current?.toggleInsightLens(state.showInsightLens);
  }, [state.showInsightLens]);

  // Handle tree planting
  useEffect(() => {
    if (state.treePlanted && engineRef.current) {
      engineRef.current.plantTree();
    }
  }, [state.treePlanted]);

  return (
    <div className="fixed inset-0">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* HUD overlay */}
      <HUD />

      {/* Joystick — bottom right */}
      <div className="fixed bottom-4 right-4 z-20">
        <Joystick
          onMove={(x, y) => {
            engineRef.current?.setInput(x, y, false);
          }}
          onEnd={() => {
            engineRef.current?.setInput(0, 0, false);
          }}
        />
      </div>

      {/* Run button — bottom left */}
      <div className="fixed bottom-8 left-4 z-20">
        <button
          onPointerDown={() => engineRef.current?.setInput(
            engineRef.current.input.moveX,
            engineRef.current.input.moveY,
            true
          )}
          onPointerUp={() => engineRef.current?.setInput(
            engineRef.current.input.moveX,
            engineRef.current.input.moveY,
            false
          )}
          onPointerLeave={() => engineRef.current?.setInput(
            engineRef.current.input.moveX,
            engineRef.current.input.moveY,
            false
          )}
          className="h-16 w-16 rounded-full glass border-2 border-ember-400/30 flex items-center justify-center active:scale-95 active:bg-ember-500/20 transition-all touch-none"
          style={{ touchAction: 'none' }}
        >
          <span className="text-xs font-bold text-ember-300">ركض</span>
        </button>
      </div>

      {/* Hint text */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ top: '35%' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: state.worldState && state.worldState.dayCount === 1 ? 0.4 : 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-center"
        >
          <p className="text-xs text-aether-200/50">حرّك العصا للسير في الأرض الجرداء</p>
          <p className="text-[10px] text-aether-300/30 mt-1">مشيك يُحيي الأرض حولك</p>
        </motion.div>
      </div>
    </div>
  );
}
