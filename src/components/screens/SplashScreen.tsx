import { motion } from 'framer-motion';
import { useGame } from '../../game/GameContext';
import { Compass } from 'lucide-react';

export default function SplashScreen() {
  const { navigate } = useGame();

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: 200 + i * 60, height: 200 + i * 60,
              background: i % 2 === 0 ? 'rgba(14,165,233,0.06)' : 'rgba(45,212,191,0.06)',
              top: `${5 + i * 12}%`, left: `${3 + i * 18}%`,
            }}
            animate={{ x: [0, 40, 0], y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full text-center py-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 14 }}
          className="mx-auto mb-6"
        >
          <div className="relative h-28 w-28 mx-auto">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute inset-0">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(45,212,191,0.25)" strokeWidth="1" strokeDasharray="4 6" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(14,165,233,0.15)" strokeWidth="0.5" />
              </svg>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                <Compass className="h-12 w-12 text-impact-400" style={{ filter: 'drop-shadow(0 0 16px rgba(45,212,191,0.6))' }} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-bold text-aether-50 glow-text mb-2 text-balance">
          أثير الأثر
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-lg text-impact-300 glow-teal mb-3">
          رحلة المبعوث
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-sm text-aether-300/70 leading-relaxed mb-8 text-balance">
          عالم ثلاثي الأبعاد ينتظر إحياءك.
          تحرّك، استكشف، وأحيِ الأرض الجرداء بقراراتك.
          لا أحد يقول لك ماذا تفعل — العالم نفسه يُجيبك.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('menu')}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-impact-500 to-aether-500 font-bold text-white text-lg shadow-xl shadow-impact-500/20 hover:shadow-impact-500/40 transition-shadow"
        >
          ابدأ الرحلة
        </motion.button>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="mt-4 text-[10px] text-aether-300/40">
          تعلّم ضمني · أظهر ولا تُخبر · أثر بلا عنف
        </motion.p>
      </div>
    </div>
  );
}
