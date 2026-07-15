import { motion } from 'framer-motion';
import { useGame } from '../game/GameContext';
import { seasons } from '../game/scenarios';
import { MessageSquare, Shield, Heart, Zap } from 'lucide-react';

function StatPill({
  icon: Icon,
  label,
  value,
  colorClass,
  barClass,
  glowClass,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: number;
  colorClass: string;
  barClass: string;
  glowClass: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex items-center gap-1.5 ${glowClass}`}>
        <Icon className={`h-4 w-4 ${colorClass}`} />
        <span className="text-lg font-bold tabular-nums">{value}</span>
      </div>
      <span className="text-[10px] text-aether-300/70 font-medium">{label}</span>
      <div className="h-1.5 w-16 rounded-full bg-aether-900/60 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

export default function StatsBar() {
  const { state } = useGame();
  const { stats } = state;
  const season = seasons[stats.seasonIndex];

  return (
    <div className="w-full">
      <div className="glass rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <StatPill icon={MessageSquare} label="الرسالة" value={stats.message} colorClass="text-aether-400" barClass="bg-aether-400" glowClass="glow-text" />
          <div className="h-8 w-px bg-white/10" />
          <StatPill icon={Shield} label="المسؤولية" value={stats.responsibility} colorClass="text-impact-400" barClass="bg-impact-400" glowClass="glow-teal" />
          <div className="h-8 w-px bg-white/10" />
          <StatPill icon={Heart} label="الانسجام" value={stats.harmony} colorClass="text-ember-400" barClass="bg-ember-400" glowClass="glow-amber" />
          <div className="h-8 w-px bg-white/10" />
          <StatPill icon={Zap} label="الطاقة" value={stats.energy} colorClass="text-yellow-300" barClass="bg-yellow-300" glowClass="" />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2">
        <motion.span
          key={season.name}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-aether-200/80 font-medium"
        >
          <span className="ml-1">{season.icon}</span>
          {season.name}
        </motion.span>
      </div>
    </div>
  );
}
