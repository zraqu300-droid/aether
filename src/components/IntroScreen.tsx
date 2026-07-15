import { motion } from 'framer-motion';
import { useGame } from '../game/GameContext';
import { Sparkles, Compass, Heart, Eye } from 'lucide-react';

export default function IntroScreen() {
  const { startGame } = useGame();

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: 200 + i * 50,
              height: 200 + i * 50,
              background: i % 2 === 0 ? 'rgba(14,165,233,0.08)' : 'rgba(45,212,191,0.08)',
              top: `${10 + i * 15}%`,
              left: `${5 + i * 20}%`,
            }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full text-center py-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="mx-auto mb-6 relative"
        >
          <div className="relative h-24 w-24 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(45,212,191,0.3)" strokeWidth="1" strokeDasharray="4 6" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(14,165,233,0.2)" strokeWidth="0.5" />
              </svg>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                <Compass className="h-10 w-10 text-impact-400" style={{ filter: 'drop-shadow(0 0 12px rgba(45,212,191,0.6))' }} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-aether-50 glow-text mb-2 text-balance"
        >
          أثير الأثر
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-lg text-impact-300 glow-teal mb-1"
        >
          رحلة المبعوث
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="text-sm text-aether-300/60 leading-relaxed mb-8 text-balance"
        >
          تُسافر في أرض جرداء، تحييها بقراراتك.
          كل قرار يزرع أثراً، وكل أثر يُغيّر ما سيكون بعد عشر سنين.
          تعلّم بالفعل لا بالقول. وانظر كيف ينمو أثرك.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {[
            { icon: Heart, label: 'زرع الحياة' },
            { icon: Eye, label: 'رؤية الأثر' },
            { icon: Compass, label: 'بوصلة البصيرة' },
            { icon: Sparkles, label: 'الأصدقاء الأصداء' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-full glass-light px-3 py-1.5">
              <f.icon className="h-3.5 w-3.5 text-impact-400" />
              <span className="text-xs text-aether-200">{f.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-impact-500 to-aether-500 font-bold text-white text-lg shadow-xl shadow-impact-500/20 hover:shadow-impact-500/40 transition-shadow"
        >
          ابدأ الرحلة
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
          className="mt-4 text-[10px] text-aether-300/40"
        >
          تعلّم ضمني · أظهر ولا تُخبر · أثر بلا عنف
        </motion.p>
      </div>
    </div>
  );
}
