import { motion } from 'framer-motion';
import { useGame } from '../game/GameContext';
import { hapticImpact } from '../game/haptics';
import { Sparkles } from 'lucide-react';

const cellContent: Record<string, string> = {
  barren: '',
  grass: '🌿',
  flower: '🌸',
  tree: '🌳',
  water: '💧',
};

export default function BarrenMap() {
  const { state, healCell, healProgress } = useGame();

  return (
    <div className="relative w-full">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-aether-200">
          <Sparkles className="h-4 w-4 text-impact-400" />
          <span className="text-sm font-medium">
            الأرض المُحيية: {Math.round(healProgress * 100)}%
          </span>
        </div>
        <span className="text-xs text-aether-300/60">المس لزرع الحياة</span>
      </div>

      <div className="relative overflow-hidden rounded-2xl glass p-3">
        <div
          className="absolute inset-0 opacity-30 transition-opacity duration-1000"
          style={{
            background: `linear-gradient(135deg, rgba(13,148,136,${healProgress * 0.4}) 0%, rgba(14,165,233,${healProgress * 0.3}) 100%)`,
          }}
        />
        <div className="relative grid grid-cols-6 gap-1.5">
          {state.grid.map((cell, i) => (
            <motion.button
              key={cell.id}
              onClick={() => { healCell(cell.id); hapticImpact('light'); }}
              disabled={cell.state === 'alive' || state.stats.energy === 0}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01, duration: 0.3 }}
              whileTap={{ scale: 0.9 }}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-lg
                transition-all duration-300 relative overflow-hidden
                ${cell.state === 'alive'
                  ? 'bg-gradient-to-br from-impact-500/30 to-aether-500/20 border border-impact-400/30 cursor-default'
                  : 'bg-aether-900/40 border border-white/5 hover:border-impact-400/30 hover:bg-aether-800/40 cursor-pointer active:scale-95'
                }
              `}
            >
              {cell.state === 'alive' && (
                <>
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    className="relative z-10"
                  >
                    {cellContent[cell.type]}
                  </motion.span>
                  <motion.div
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 rounded-lg bg-impact-400/30"
                  />
                </>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {healProgress === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center text-sm text-impact-300 glow-teal"
        >
          ✦ الأرض كلها اهتزّت حياةً ✦
        </motion.div>
      )}
    </div>
  );
}
