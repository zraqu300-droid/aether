import { motion } from 'framer-motion';
import { useGame } from '../../game/GameContext';
import { ArrowRight, Volume2, VolumeX, Music, Music2, Smartphone, Vibrate } from 'lucide-react';

export default function SettingsScreen() {
  const { navigate, settings, updateSettings } = useGame();

  const toggles = [
    {
      key: 'sound' as const,
      label: 'المؤثرات الصوتية',
      icon: settings.sound ? Volume2 : VolumeX,
      value: settings.sound,
    },
    {
      key: 'music' as const,
      label: 'الموسيقى',
      icon: settings.music ? Music : Music2,
      value: settings.music,
    },
    {
      key: 'haptics' as const,
      label: 'الاهتزاز',
      icon: settings.haptics ? Smartphone : Vibrate,
      value: settings.haptics,
    },
  ];

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
        <h2 className="text-lg font-bold text-aether-100 glow-text">الإعدادات</h2>
        <div className="w-16" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-sm mx-auto space-y-3">
          {toggles.map((toggle, i) => (
            <motion.div
              key={toggle.key}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-4 border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${toggle.value ? 'bg-impact-500/20' : 'bg-aether-900/40'}`}>
                  <toggle.icon className={`h-5 w-5 ${toggle.value ? 'text-impact-400' : 'text-aether-400/50'}`} />
                </div>
                <span className="text-sm font-medium text-aether-100">{toggle.label}</span>
              </div>

              <button
                onClick={() => updateSettings({ [toggle.key]: !toggle.value })}
                className={`relative w-12 h-7 rounded-full transition-colors ${toggle.value ? 'bg-impact-500' : 'bg-aether-800'}`}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md ${toggle.value ? 'left-1' : 'left-6'}`}
                />
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-sm mx-auto mt-6 glass-light rounded-2xl p-4 border border-white/5"
        >
          <h3 className="text-sm font-semibold text-aether-200 mb-2">عن اللعبة</h3>
          <p className="text-xs text-aether-300/60 leading-relaxed">
            أثير الأثر: رحلة المبعوث — لعبة تعليمية سلمية ثلاثية الأبعاد.
            تعلّم بالفعل والسببية، لا بالوعظ. أحيِ الأرض الجرداء،
            استكشف الأصداء، وازرع أثراً يبقى بعد عشر سنين.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
