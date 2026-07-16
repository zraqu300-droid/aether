import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Shield, Eye, Zap, Pause, Sun, Moon, Sparkles } from 'lucide-react';

type HUDProps = {
  stats: { message: number; responsibility: number; insight: number };
  energy: number;
  maxEnergy: number;
  timeOfDay: number;
  dayCount: number;
  healProgress: number;
  echoProgress: number;
  objective: string;
  insightEnabled: boolean;
  insightActive: boolean;
  onToggleInsight: () => void;
  onPlantTree: () => void;
  canPlantTree: boolean;
  echoPrompt: string | null;
  onEchoInteract: () => void;
  onPause: () => void;
};

function StatBar({ icon: Icon, value, color, glow }: {
  icon: typeof MessageSquare; label: string; value: number; color: string; glow: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-3.5 w-3.5 ${color} ${glow}`} />
      <div className="h-1.5 w-16 rounded-full bg-aether-900/60 overflow-hidden">
        <motion.div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} animate={{ width: `${Math.max(0, Math.min(100, value))}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      </div>
      <span className="text-[10px] text-aether-300/60 w-8">{Math.floor(value)}</span>
    </div>
  );
}

export default function GameHUD({
  stats, energy, maxEnergy, timeOfDay, dayCount, healProgress, echoProgress,
  objective, insightEnabled, insightActive, onToggleInsight, onPlantTree, canPlantTree,
  echoPrompt, onEchoInteract, onPause,
}: HUDProps) {
  const isNight = timeOfDay < 0.25 || timeOfDay > 0.75;
  const hours = Math.floor(timeOfDay * 24);
  const mins = Math.floor((timeOfDay * 24 - hours) * 60);
  const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

  return (
    <>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-start justify-between p-3">
          {/* Stats */}
          <div className="glass rounded-2xl px-3 py-2 space-y-1.5 pointer-events-auto">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-impact-400" />
              <span className="text-xs font-semibold text-aether-200">المبعوث</span>
              <span className="text-[10px] text-aether-300/50">اليوم {dayCount}</span>
            </div>
            <StatBar icon={MessageSquare} label="الرسالة" value={stats.message} color="text-aether-400" glow="glow-text" />
            <StatBar icon={Shield} label="المسؤولية" value={stats.responsibility} color="text-impact-400" glow="glow-teal" />
            <StatBar icon={Eye} label="البصيرة" value={stats.insight} color="text-ember-400" glow="glow-amber" />
          </div>

          {/* Time + Energy + Pause */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div className="glass rounded-2xl px-3 py-2 flex items-center gap-2 pointer-events-auto">
                {isNight ? <Moon className="h-4 w-4 text-aether-300" /> : <Sun className="h-4 w-4 text-ember-400" />}
                <span className="text-sm font-bold text-aether-100 tabular-nums">{timeStr}</span>
              </div>
              <button onClick={onPause} className="glass rounded-2xl p-2 pointer-events-auto active:scale-95 transition-transform">
                <Pause className="h-5 w-5 text-aether-200" />
              </button>
            </div>
            <div className="glass rounded-2xl px-3 py-2 flex items-center gap-2 pointer-events-auto">
              <Zap className="h-4 w-4 text-yellow-300" />
              <div className="h-1.5 w-14 rounded-full bg-aether-900/60 overflow-hidden">
                <motion.div className="h-full rounded-full bg-yellow-300" animate={{ width: `${(energy / maxEnergy) * 100}%` }} />
              </div>
              <span className="text-[10px] text-yellow-200/70 tabular-nums">{Math.floor(energy)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Objective text */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-light rounded-full px-4 py-1.5">
          <p className="text-xs text-aether-200/80">{objective}</p>
        </motion.div>
      </div>

      {/* Compass */}
      <div className="fixed bottom-44 right-4 z-20 pointer-events-none">
        <div className="relative h-16 w-16">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <defs>
              <radialGradient id="hudCompassGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.2 + (stats.message + stats.responsibility + stats.insight) / 300 * 0.4} />
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
              animate={{ rotate: ((stats.message + stats.responsibility + stats.insight) / 3) * 3.6 }}
              transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              style={{ transformOrigin: '50px 50px' }}
            >
              <polygon points="50,18 47,50 50,47 53,50" fill="#5eead4" opacity={0.4 + (stats.message + stats.responsibility + stats.insight) / 300 * 0.6} />
              <polygon points="50,82 47,50 50,53 53,50" fill="#f59e0b" opacity={0.3 + (stats.message + stats.responsibility + stats.insight) / 300 * 0.4} />
            </motion.g>
            <circle cx="50" cy="50" r="4" fill="#0c4a6e" stroke="#2dd4bf" strokeWidth="1" />
          </svg>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-impact-300/70 whitespace-nowrap">بوصلة اليقين</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="fixed bottom-44 left-4 z-20 flex flex-col gap-2">
        {insightEnabled && (
          <button
            onClick={onToggleInsight}
            className={`h-12 w-12 rounded-2xl glass border flex items-center justify-center transition-all active:scale-95 ${insightActive ? 'border-aether-400/50 bg-aether-500/20' : 'border-white/10'}`}
          >
            <Eye className={`h-5 w-5 ${insightActive ? 'text-aether-300' : 'text-aether-400/70'}`} />
          </button>
        )}
        <button
          onClick={onPlantTree}
          disabled={!canPlantTree}
          className={`h-12 w-12 rounded-2xl glass border flex items-center justify-center transition-all active:scale-95 ${canPlantTree ? 'border-impact-400/30' : 'border-white/5 opacity-40'}`}
        >
          <Sparkles className={`h-5 w-5 ${canPlantTree ? 'text-impact-400' : 'text-aether-400/40'}`} />
        </button>
      </div>

      {/* Echo prompt */}
      <AnimatePresence>
        {echoPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-36 left-1/2 -translate-x-1/2 z-20"
          >
            <button
              onClick={onEchoInteract}
              className="glass-light rounded-full px-4 py-2 flex items-center gap-2 border border-impact-400/30 active:scale-95 transition-transform"
            >
              <span className="text-sm text-aether-100">{echoPrompt}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insight lens overlay */}
      <AnimatePresence>
        {insightActive && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(14,165,233,0.05) 0%, rgba(45,212,191,0.03) 50%, rgba(14,165,233,0.05) 100%)' }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-aether-300/40 tracking-widest">عدسة الاستشراف</p>
                <p className="text-[10px] text-aether-300/30 mt-1">رؤية ما سيكون بعد عشر سنين</p>
              </div>
            </div>
            <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(45,212,191,0.1) 2px, rgba(45,212,191,0.1) 3px)' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="glass rounded-full px-4 py-1.5 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-impact-300">الأرض</span>
            <div className="h-1 w-12 rounded-full bg-aether-900/60 overflow-hidden">
              <motion.div className="h-full bg-impact-400" animate={{ width: `${healProgress * 100}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-aether-300">الأصداء</span>
            <div className="h-1 w-12 rounded-full bg-aether-900/60 overflow-hidden">
              <motion.div className="h-full bg-aether-400" animate={{ width: `${echoProgress * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
