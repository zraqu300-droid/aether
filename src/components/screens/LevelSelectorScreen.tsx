import { motion } from 'framer-motion';
import { useGame } from '../../game/GameContext';
import { LEVELS } from '../../data/levelsData';
import { ArrowRight, Lock, Star, Check } from 'lucide-react';

export default function LevelSelectorScreen() {
  const { navigate, startLevel, isLevelUnlocked, levelProgress } = useGame();

  return (
    <div className="fixed inset-0 flex flex-col p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4 pt-2">
        <button
          onClick={() => navigate('menu')}
          className="flex items-center gap-2 glass-light rounded-full px-4 py-2 text-sm text-aether-200 hover:bg-white/10 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          رجوع
        </button>
        <h2 className="text-lg font-bold text-aether-100 glow-text">اختيار المراحل</h2>
        <div className="w-16" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {LEVELS.map((level, i) => {
            const unlocked = isLevelUnlocked(level.id);
            const progress = levelProgress[level.id];
            const completed = progress?.completed ?? false;
            const stars = progress?.stars ?? 0;

            return (
              <motion.button
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 100, damping: 15 }}
                whileTap={unlocked ? { scale: 0.97 } : {}}
                onClick={() => unlocked && startLevel(level.id)}
                disabled={!unlocked}
                className={`
                  relative glass rounded-2xl p-4 border text-right overflow-hidden
                  ${unlocked ? 'border-impact-400/20 hover:border-impact-400/40 cursor-pointer' : 'border-white/5 opacity-50'}
                `}
              >
                {unlocked && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-impact-500/10 to-transparent rounded-bl-full" />
                )}

                <div className="relative flex items-start justify-between mb-2">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl
                    ${unlocked ? 'bg-gradient-to-br from-impact-500/20 to-aether-500/10 border border-white/10' : 'bg-aether-900/40 border border-white/5'}`}>
                    {unlocked ? level.icon : <Lock className="h-5 w-5 text-aether-400/40" />}
                  </div>
                  <span className="text-[10px] text-aether-300/50 font-mono">#{level.id}</span>
                </div>

                <h3 className={`text-sm font-bold mb-1 ${unlocked ? 'text-aether-100' : 'text-aether-400/50'}`}>
                  {level.name}
                </h3>
                <p className={`text-[10px] leading-relaxed mb-2 ${unlocked ? 'text-aether-300/60' : 'text-aether-400/30'}`}>
                  {level.subtitle}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-2.5 w-2.5 ${s <= level.difficulty ? 'text-ember-400' : 'text-aether-700'}`}
                        fill={s <= level.difficulty ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  {completed && (
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= stars ? 'text-ember-400' : 'text-aether-700'}`} fill={s <= stars ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <Check className="h-3 w-3 text-impact-400" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
