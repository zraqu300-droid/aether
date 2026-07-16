import { motion } from 'framer-motion';
import { useGame } from '../../game/GameContext';
import { Play, Map, Settings, Info, Compass } from 'lucide-react';

export default function MainMenuScreen() {
  const { navigate } = useGame();

  const menuItems = [
    { icon: Play, label: 'ابدأ اللعب', action: () => navigate('levelSelect'), color: 'from-impact-500 to-aether-500' },
    { icon: Map, label: 'اختيار المراحل', action: () => navigate('levelSelect'), color: 'from-aether-500 to-impact-500' },
    { icon: Settings, label: 'الإعدادات', action: () => navigate('settings'), color: 'from-aether-600 to-aether-400' },
    { icon: Info, label: 'عن اللعبة', action: () => navigate('settings'), color: 'from-ember-500 to-ember-400' },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: 250, height: 250,
              background: i % 2 === 0 ? 'rgba(14,165,233,0.05)' : 'rgba(45,212,191,0.05)',
              top: `${10 + i * 20}%`, left: `${5 + i * 25}%`,
            }}
            animate={{ x: [0, 30, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-sm w-full py-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-impact-500/20 to-aether-500/10 border border-impact-400/20 mb-3">
            <Compass className="h-8 w-8 text-impact-400" style={{ filter: 'drop-shadow(0 0 10px rgba(45,212,191,0.5))' }} />
          </div>
          <h1 className="text-2xl font-bold text-aether-50 glow-text">أثير الأثر</h1>
          <p className="text-sm text-impact-300/70 mt-1">رحلة المبعوث</p>
        </motion.div>

        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 100, damping: 15 }}
              whileTap={{ scale: 0.97 }}
              onClick={item.action}
              className="w-full flex items-center gap-4 glass rounded-2xl p-4 border border-white/10 hover:border-impact-400/30 hover:bg-white/5 transition-all group"
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-semibold text-aether-100">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
