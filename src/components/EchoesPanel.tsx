import { motion } from 'framer-motion';
import { useGame } from '../game/GameContext';
import { scenarios } from '../game/scenarios';
import { MessageCircle, Lock, Check } from 'lucide-react';

export default function EchoesPanel() {
  const { state, openScenario } = useGame();

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2 px-1">
        <MessageCircle className="h-4 w-4 text-aether-400" />
        <h3 className="text-sm font-semibold text-aether-200">نداءات الأصدقاء</h3>
      </div>

      <div className="space-y-2">
        {scenarios.map((scenario, i) => {
          const completed = state.completedScenarios.includes(scenario.id);
          const isCurrent = i === state.currentScenarioIndex && !completed;
          const isLocked = i > state.currentScenarioIndex;

          return (
            <motion.button
              key={scenario.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: isLocked ? 1 : 0.98 }}
              onClick={() => !isLocked && !completed && openScenario(i)}
              disabled={isLocked || completed}
              className={`
                w-full text-right flex items-center gap-3 rounded-xl p-2.5 border transition-all
                ${completed
                  ? 'glass border-impact-400/20 opacity-60'
                  : isLocked
                    ? 'glass border-white/5 opacity-30'
                    : 'glass border-aether-400/30 hover:border-aether-400/50 hover:bg-aether-500/5'
                }
              `}
            >
              <div className={`
                h-10 w-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0
                ${completed ? 'bg-impact-500/20' : isLocked ? 'bg-aether-900/40' : 'bg-gradient-to-br from-aether-500/30 to-impact-500/20 border border-white/10'}
              `}>
                {completed ? <Check className="h-5 w-5 text-impact-400" />
                  : isLocked ? <Lock className="h-4 w-4 text-aether-400/50" />
                  : scenario.echoEmoji}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium truncate ${completed ? 'text-impact-300' : isLocked ? 'text-aether-400/50' : 'text-aether-100'}`}>
                  {scenario.title}
                </h4>
                <p className={`text-[10px] truncate ${isLocked ? 'text-aether-400/30' : 'text-aether-300/60'}`}>
                  {completed ? 'تمّ بحمد الله' : isLocked ? 'يُفتح بعد إكمال السابق' : scenario.echoName}
                </p>
              </div>

              {isCurrent && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-aether-400 flex-shrink-0"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
