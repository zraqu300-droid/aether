import { motion } from 'framer-motion';
import { useGame } from '../game/GameContext';
import { Compass } from 'lucide-react';

export default function InsightCompass() {
  const { state } = useGame();
  const { stats } = state;

  const alignment = (stats.message + stats.responsibility + stats.harmony) / 3;
  const rotation = alignment * 3.6;
  const intensity = alignment / 100;

  const statusText =
    alignment < 30 ? 'تائه في الظلام' :
    alignment < 60 ? 'يبحث عن الاتجاه' :
    alignment < 85 ? 'على الطريق الصحيح' :
    'الطريق منير';

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative h-28 w-28">
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: `0 0 ${20 + intensity * 40}px ${5 + intensity * 15}px rgba(45,212,191,${0.15 + intensity * 0.35})`,
          }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
        />

        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="compassGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.3 + intensity * 0.4} />
              <stop offset="70%" stopColor="#0ea5e9" stopOpacity={0.1 + intensity * 0.2} />
              <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="needleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="48" fill="url(#compassGlow)" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(45,212,191,0.2)" strokeWidth="0.5" strokeDasharray="2 4" />

          {[0, 90, 180, 270].map((deg) => (
            <line key={deg} x1="50" y1="8" x2="50" y2="14" stroke="rgba(255,255,255,0.3)" strokeWidth="1" transform={`rotate(${deg} 50 50)`} />
          ))}

          <motion.g
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            style={{ transformOrigin: '50px 50px' }}
          >
            <polygon points="50,16 46,50 50,46 54,50" fill="url(#needleGrad)" opacity={0.4 + intensity * 0.6} />
            <polygon points="50,84 46,50 50,54 54,50" fill="#f59e0b" opacity={0.3 + intensity * 0.4} />
          </motion.g>

          <circle cx="50" cy="50" r="5" fill="#0c4a6e" stroke="#2dd4bf" strokeWidth="1" />
          <circle cx="50" cy="50" r="2" fill="#5eead4" />
        </svg>

        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-impact-300"
            style={{ top: '50%', left: '50%' }}
            animate={{
              x: [0, Math.cos((i * 120 * Math.PI) / 180) * 45],
              y: [0, Math.sin((i * 120 * Math.PI) / 180) * 45],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>

      <div className="mt-1 flex items-center gap-1.5">
        <Compass className="h-3 w-3 text-impact-400" />
        <span className="text-xs font-medium text-impact-300">بوصلة البصيرة</span>
      </div>
      <span className="text-[10px] text-aether-300/50">{statusText}</span>
    </div>
  );
}
