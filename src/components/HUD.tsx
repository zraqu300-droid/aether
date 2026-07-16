import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../game/GameContext';
import { Eye, Sprout, Sparkles, Sun, Moon, Zap } from 'lucide-react';

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-aether-300/70 w-12 text-left">{label}</span>
      <div className="h-1.5 w-20 rounded-full bg-aether-900/60 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

export default function HUD() {
  const { state, triggerEchoInteraction, toggleInsightLens, plantTree } = useGame();
  const ws = state.worldState;

  if (!ws) return null;

  const timeStr = (() => {
    const hours = Math.floor(ws.timeOfDay * 24);
    const mins = Math.floor((ws.timeOfDay * 24 - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  })();

  const isNight = ws.timeOfDay < 0.25 || ws.timeOfDay > 0.75;

  return (
    <>
      {/* Top bar — stats */}
      <div className="fixed top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-start justify-between p-3">
          {/* Left: stats */}
          <div className="glass rounded-2xl px-3 py-2 space-y-1.5 pointer-events-auto">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-impact-400" />
              <span className="text-xs font-semibold text-aether-200">المبعوث</span>
              <span className="text-[10px] text-aether-300/50">اليوم {ws.dayCount}</span>
            </div>
            <StatBar label="الرسالة" value={ws.message} color="bg-aether-400" />
            <StatBar label="المسؤولية" value={ws.responsibility} color="bg-impact-400" />
            <StatBar label="الانسجام" value={ws.harmony} color="bg-ember-400" />
          </div>

          {/* Right: time + energy */}
          <div className="flex flex-col items-end gap-2">
            <div className="glass rounded-2xl px-3 py-2 flex items-center gap-2 pointer-events-auto">
              {isNight ? <Moon className="h-4 w-4 text-aether-300" /> : <Sun className="h-4 w-4 text-ember-400" />}
              <span className="text-sm font-bold text-aether-100 tabular-nums">{timeStr}</span>
            </div>
            <div className="glass rounded-2xl px-3 py-2 flex items-center gap-2 pointer-events-auto">
              <Zap className="h-4 w-4 text-yellow-300" />
              <div className="h-1.5 w-16 rounded-full bg-aether-900/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-yellow-300"
                  animate={{ width: `${(ws.lightEnergy / ws.maxEnergy) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-yellow-200/70 tabular-nums">{Math.floor(ws.lightEnergy)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compass — bottom right */}
      <div className="fixed bottom-40 right-4 z-20 pointer-events-none">
        <div className="relative h-20 w-20">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <defs>
              <radialGradient id="hudCompassGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.2 + ws.compassAlignment * 0.4} />
                <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#hudCompassGlow)" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(45,212,191,0.15)" strokeWidth="0.5" strokeDasharray="2 4" />
            {[0, 90, 180, 270].map((deg) => (
              <line key={deg} x1="50" y1="10" x2="50" y2="16" stroke="rgba(255,255,255,0.25)" strokeWidth="1" transform={`rotate(${deg} 50 50)`} />
            ))}
            <motion.g
              animate={{ rotate: ws.compassAlignment * 360 }}
              transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              style={{ transformOrigin: '50px 50px' }}
            >
              <polygon points="50,18 47,50 50,47 53,50" fill="#5eead4" opacity={0.4 + ws.compassAlignment * 0.6} />
              <polygon points="50,82 47,50 50,53 53,50" fill="#f59e0b" opacity={0.3 + ws.compassAlignment * 0.4} />
            </motion.g>
            <circle cx="50" cy="50" r="4" fill="#0c4a6e" stroke="#2dd4bf" strokeWidth="1" />
          </svg>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-impact-300/70 whitespace-nowrap">بوصلة اليقين</div>
        </div>
      </div>

      {/* Action buttons — bottom left */}
      <div className="fixed bottom-40 left-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => toggleInsightLens(!state.showInsightLens)}
          className={`h-14 w-14 rounded-2xl glass border flex items-center justify-center transition-all active:scale-95 ${
            state.showInsightLens ? 'border-aether-400/50 bg-aether-500/20' : 'border-white/10'
          }`}
        >
          <Eye className={`h-6 w-6 ${state.showInsightLens ? 'text-aether-300' : 'text-aether-400/70'}`} />
        </button>
        <button
          onClick={plantTree}
          disabled={!state.canPlantTree}
          className={`h-14 w-14 rounded-2xl glass border flex items-center justify-center transition-all active:scale-95 ${
            state.canPlantTree ? 'border-impact-400/30' : 'border-white/5 opacity-40'
          }`}
        >
          <Sprout className={`h-6 w-6 ${state.canPlantTree ? 'text-impact-400' : 'text-aether-400/40'}`} />
        </button>
      </div>

      {/* Echo interaction prompt */}
      <AnimatePresence>
        {state.showEchoPrompt && state.nearbyEcho && !state.nearbyEcho.satisfied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-20"
          >
            <button
              onClick={triggerEchoInteraction}
              className="glass-light rounded-full px-4 py-2 flex items-center gap-2 border border-impact-400/30 active:scale-95 transition-transform"
            >
              <span className="text-lg">{state.nearbyEcho.emoji}</span>
              <span className="text-xs text-aether-100">تفاعل مع {state.nearbyEcho.name}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Echo message toast */}
      <AnimatePresence>
        {state.echoMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-30 max-w-xs w-full px-4"
          >
            <div className="glass rounded-2xl px-4 py-3 border border-impact-400/20 text-center">
              <p className="text-sm text-aether-100 leading-relaxed">{state.echoMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insight lens overlay */}
      <AnimatePresence>
        {state.showInsightLens && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(14,165,233,0.05) 0%, rgba(45,212,191,0.03) 50%, rgba(14,165,233,0.05) 100%)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-aether-300/40 tracking-widest">عدسة الاستشراف</p>
                <p className="text-[10px] text-aether-300/30 mt-1">رؤية ما سيكون بعد عشر سنين</p>
              </div>
            </div>
            {/* Scanlines effect */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(45,212,191,0.1) 2px, rgba(45,212,191,0.1) 3px)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar — bottom center */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="glass rounded-full px-4 py-1.5 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-impact-300">الأرض</span>
            <div className="h-1 w-12 rounded-full bg-aether-900/60 overflow-hidden">
              <motion.div className="h-full bg-impact-400" animate={{ width: `${state.healProgress * 100}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-aether-300">الأصداء</span>
            <div className="h-1 w-12 rounded-full bg-aether-900/60 overflow-hidden">
              <motion.div className="h-full bg-aether-400" animate={{ width: `${state.echoProgress * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
