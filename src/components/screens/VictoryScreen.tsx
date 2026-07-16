import { motion } from 'framer-motion';
import { useGame } from '../../game/GameContext';
import { RotateCcw, ArrowLeft, Star, Sparkles, MessageSquare, Shield, Eye } from 'lucide-react';

export default function VictoryScreen() {
  const { navigate, startLevel, currentLevelId, victoryStats, victoryStars } = useGame();

  const stats = victoryStats || { message: 0, responsibility: 0, insight: 0 };

  const statItems = [
    { icon: MessageSquare, label: 'الرسالة', value: Math.floor(stats.message), color: 'text-aether-400', glow: 'glow-text' },
    { icon: Shield, label: 'المسؤولية', value: Math.floor(stats.responsibility), color: 'text-impact-400', glow: 'glow-teal' },
    { icon: Eye, label: 'البصيرة', value: Math.floor(stats.insight), color: 'text-ember-400', glow: 'glow-amber' },
  ];

  const hasNext = currentLevelId < 10;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 overflow-y-auto z-40">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{ width: 120, height: 120, background: 'rgba(45,212,191,0.08)', top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            animate={{ y: [0, -40, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 8 + Math.random() * 4, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        className="relative z-10 max-w-md w-full text-center glass rounded-3xl p-8 border border-impact-400/20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
          className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-impact-500/30 to-aether-500/20 flex items-center justify-center border border-impact-400/30"
        >
          <Sparkles className="h-8 w-8 text-impact-400" style={{ filter: 'drop-shadow(0 0 12px rgba(45,212,191,0.5))' }} />
        </motion.div>

        <h2 className="text-2xl font-bold text-aether-50 glow-text mb-1">الارتقاء</h2>
        <p className="text-xs text-aether-300/60 mb-4">اكتمل إحياء المرحلة</p>

        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4 + s * 0.15, type: 'spring', stiffness: 200, damping: 10 }}
            >
              <Star
                className={`h-8 w-8 ${s <= victoryStars ? 'text-ember-400' : 'text-aether-700'}`}
                fill={s <= victoryStars ? 'currentColor' : 'none'}
                style={s <= victoryStars ? { filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.4))' } : {}}
              />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {statItems.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="glass-light rounded-xl p-3"
            >
              <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
              <p className={`text-xl font-bold tabular-nums ${stat.color} ${stat.glow}`}>{stat.value}</p>
              <p className="text-[10px] text-aether-300/60">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-2">
          {hasNext && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startLevel(currentLevelId + 1)}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-impact-500 to-aether-500 py-3 font-semibold text-white text-sm shadow-lg shadow-impact-500/20"
            >
              <ArrowLeft className="h-4 w-4" />
              المرحلة التالية
            </motion.button>
          )}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => startLevel(currentLevelId)}
            className="flex items-center justify-center gap-2 w-full rounded-xl glass-light border border-white/10 py-3 font-medium text-aether-200 text-sm hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة المرحلة
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('levelSelect')}
            className="w-full py-2 text-xs text-aether-300/50 hover:text-aether-200 transition-colors"
          >
            اختيار مرحلة أخرى
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
