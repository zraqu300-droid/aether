import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../game/GameContext';
import { hapticImpact, hapticNotify } from '../game/haptics';
import { Eye, Clock, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import type { Choice } from '../game/scenarios';

function ChoiceButton({
  choice,
  index,
  selected,
  onSelect,
}: {
  choice: Choice;
  index: number;
  selected: boolean;
  onSelect: (c: Choice) => void;
}) {
  const c = choice.consequence;
  const netPositive = c.message + c.responsibility + c.harmony;

  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(choice)}
      className={`
        w-full text-right rounded-xl p-3 border transition-all duration-200
        ${selected
          ? 'glass-light border-impact-400/50 bg-impact-500/10'
          : 'glass border-white/5 hover:border-impact-400/20 hover:bg-white/5'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-aether-100 mb-1">{choice.label}</h4>
          <p className="text-xs text-aether-300/70 leading-relaxed">{choice.description}</p>
        </div>
        {selected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0 mt-1">
            <div className="h-5 w-5 rounded-full bg-impact-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          </motion.div>
        )}
      </div>
      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 flex gap-3 text-[10px]"
        >
          <span className={c.message >= 0 ? 'text-aether-400' : 'text-red-400'}>
            الرسالة {c.message >= 0 ? '+' : ''}{c.message}
          </span>
          <span className={c.responsibility >= 0 ? 'text-impact-400' : 'text-red-400'}>
            المسؤولية {c.responsibility >= 0 ? '+' : ''}{c.responsibility}
          </span>
          <span className={c.harmony >= 0 ? 'text-ember-400' : 'text-red-400'}>
            الانسجام {c.harmony >= 0 ? '+' : ''}{c.harmony}
          </span>
          {netPositive >= 7 && (
            <span className="text-impact-300 flex items-center gap-0.5">
              <Sparkles className="h-2.5 w-2.5" /> أثر عميق
            </span>
          )}
        </motion.div>
      )}
    </motion.button>
  );
}

export default function DecisionCard() {
  const { state, selectChoice, confirmChoice, showFuture, closeInsight } = useGame();
  const scenario = state.activeScenario;
  if (!scenario) return null;

  const handleSelect = (c: Choice) => {
    selectChoice(c);
    hapticImpact('medium');
  };

  const handleConfirm = () => {
    confirmChoice();
    hapticNotify('success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeInsight}
        className="absolute inset-0 bg-aether-950/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-hide glass rounded-3xl p-5 border border-white/10"
      >
        <button
          onClick={closeInsight}
          className="absolute top-4 left-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4 text-aether-300" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
            className="h-12 w-12 rounded-2xl bg-gradient-to-br from-aether-500/30 to-impact-500/20 flex items-center justify-center text-2xl border border-white/10"
          >
            {scenario.echoEmoji}
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-aether-100">{scenario.title}</h3>
            <p className="text-xs text-impact-300/70">{scenario.echoName}</p>
          </div>
        </div>

        <p className="text-sm text-aether-200/80 leading-relaxed mb-1 text-balance">{scenario.context}</p>
        <p className="text-sm font-semibold text-aether-100 mb-4">{scenario.prompt}</p>

        <div className="space-y-2 mb-4">
          {scenario.choices.map((choice, i) => (
            <ChoiceButton
              key={choice.id}
              choice={choice}
              index={i}
              selected={state.selectedChoice?.id === choice.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <AnimatePresence>
          {state.selectedChoice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl bg-aether-900/40 border border-aether-400/20 p-3 mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Eye className="h-4 w-4 text-aether-400" />
                  <span className="text-xs font-semibold text-aether-300">عدسة البصيرة: الأثر المتوقع</span>
                </div>
                <p className="text-xs text-aether-200/80 leading-relaxed">
                  {state.selectedChoice.consequence.insight}
                </p>

                <div className="mt-3 border-t border-white/5 pt-2">
                  {!state.showFuture ? (
                    <button
                      onClick={showFuture}
                      className="flex items-center gap-1.5 text-xs text-ember-400 hover:text-ember-300 transition-colors"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      انظر بعد عشر سنين...
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-ember-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-ember-200/80 leading-relaxed italic">
                        {state.selectedChoice.consequence.future}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirm}
                className="w-full rounded-xl bg-gradient-to-r from-impact-500 to-aether-500 py-3 font-semibold text-white text-sm shadow-lg shadow-impact-500/20 hover:shadow-impact-500/30 transition-shadow"
              >
                أُقرّ هذا القرار
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {!state.selectedChoice && (
          <div className="flex items-center gap-1.5 text-[10px] text-aether-300/40 justify-center">
            <AlertCircle className="h-3 w-3" />
            اختر أحد البدائل الثلاثة لرؤية أثره قبل الإقرار
          </div>
        )}
      </motion.div>
    </div>
  );
}
