import { motion } from 'framer-motion';
import { useGame } from '../game/GameContext';
import { RotateCcw, Sparkles } from 'lucide-react';

export default function EndingScreen() {
  const { state, resetGame, healProgress } = useGame();
  const { stats } = state;

  const totalScore = (stats.message + stats.responsibility + stats.harmony) / 3;
  const aliveCount = state.grid.filter((c) => c.state === 'alive').length;

  const getEpilogue = () => {
    if (totalScore >= 80)
      return 'حملتَ الرسالة بقلبٍ يقظ، وزرعتَ أثراً لا يمحوه الزمن. الأرض التي تركتَها خلفك صارت تدلّ عليك، وإن لم يذكروا اسمك. هذا هو الأثر الذي يبقى.';
    if (totalScore >= 60)
      return 'مشيتَ على الطريق، وتركتَ بصمة. بعض ما زرعتَه نما، وبعضه يحتاج من يأتي بعدك. وهذا أيضاً أثر: أن تُورّث الهمّة لمن خلفك.';
    if (totalScore >= 40)
      return 'بذلتَ ما استطعتَ. ربما كان بعض القرارات متعجّلاً، لكنك لم تتوقّف عن المحاولة. والأثر لا يُقاس بالكمال، بل بالاستمرار.';
    return 'الرحلة كانت صعبة. لكن كل من يمشي على الطريق يتعلّم. ربما في المرة القادمة تختار ما ينفع أكثر، وتزرع أثراً أعمق.';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{ width: 150, height: 150, background: 'rgba(45,212,191,0.1)', top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="relative z-10 max-w-md w-full text-center glass rounded-3xl p-8 border border-white/10"
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
          className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-impact-500/30 to-aether-500/20 flex items-center justify-center border border-impact-400/30"
        >
          <Sparkles className="h-8 w-8 text-impact-400" style={{ filter: 'drop-shadow(0 0 12px rgba(45,212,191,0.5))' }} />
        </motion.div>

        <h2 className="text-2xl font-bold text-aether-50 glow-text mb-2">انتهت الرحلة</h2>
        <p className="text-xs text-aether-300/60 mb-6">إليك ما تركتَه خلفك</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-light rounded-xl p-3">
            <p className="text-2xl font-bold text-aether-400 glow-text">{stats.message}</p>
            <p className="text-[10px] text-aether-300/60">الرسالة</p>
          </div>
          <div className="glass-light rounded-xl p-3">
            <p className="text-2xl font-bold text-impact-400 glow-teal">{stats.responsibility}</p>
            <p className="text-[10px] text-aether-300/60">المسؤولية</p>
          </div>
          <div className="glass-light rounded-xl p-3">
            <p className="text-2xl font-bold text-ember-400 glow-amber">{stats.harmony}</p>
            <p className="text-[10px] text-aether-300/60">الانسجام</p>
          </div>
          <div className="glass-light rounded-xl p-3">
            <p className="text-2xl font-bold text-impact-300">{aliveCount}</p>
            <p className="text-[10px] text-aether-300/60">بذور الحياة</p>
          </div>
        </div>

        <div className="rounded-xl bg-aether-900/40 border border-impact-400/20 p-4 mb-6">
          <p className="text-sm text-aether-100 leading-relaxed text-balance">{getEpilogue()}</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-impact-500 to-aether-500 py-3 font-semibold text-white text-sm shadow-lg shadow-impact-500/20"
        >
          <RotateCcw className="h-4 w-4" />
          ابدأ رحلة جديدة
        </motion.button>

        <p className="mt-4 text-[10px] text-aether-300/40">
          {healProgress === 1 ? '✦ الأرض اهتزّت كلها حياةً ✦' : `${Math.round(healProgress * 100)}% من الأرض أحياها قرارك`}
        </p>
      </motion.div>
    </div>
  );
}
