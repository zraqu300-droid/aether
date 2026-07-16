import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../../game/GameContext';
import { getLevel } from '../../data/levelsData';
import { hapticImpact, hapticNotify } from '../../game/haptics';
import GameTerrain from '../game/GameTerrain';
import GameAvatar from '../game/GameAvatar';
import GameEchoes from '../game/GameEchoes';
import GameHealNodes from '../game/GameHealNodes';
import GameEnvironment from '../game/GameEnvironment';
import CameraRig from '../game/CameraRig';
import Joystick from '../ui/Joystick';
import GameHUD from '../ui/GameHUD';

export default function GameScreen() {
  const { currentLevelId, completeLevel, settings, navigate } = useGame();
  const level = getLevel(currentLevelId);

  // Refs shared between R3F and UI
  const avatarPos = useRef(new THREE.Vector3(0, 0, 0));
  const inputRef = useRef({ x: 0, y: 0, running: false });
  const timeOfDayRef = useRef(level?.timeOfDay ?? 0.35);
  const healedRef = useRef<number[]>(new Array(level?.healNodes.length ?? 0).fill(0));
  const satisfiedEchoes = useRef(new Set<string>());
  const healNodesRef = useRef(
    (level?.healNodes ?? []).map((n) => ({
      position: new THREE.Vector3(n.x, 0, n.z),
      radius: n.radius,
      healed: 0,
    }))
  );

  // UI state
  const [stats, setStats] = useState({ message: 10, responsibility: 10, insight: 10 });
  const [energy, setEnergy] = useState(50);
  const [dayCount, setDayCount] = useState(1);
  const [healProgress, setHealProgress] = useState(0);
  const [echoProgress, setEchoProgress] = useState(0);
  const [insightActive, setInsightActive] = useState(false);
  const [echoPrompt, setEchoPrompt] = useState<string | null>(null);
  const [treeCount, setTreeCount] = useState(0);
  const [paused, setPaused] = useState(false);

  // Track energy and stats
  useEffect(() => {
    const interval = setInterval(() => {
      if (paused) return;
      const input = inputRef.current;
      const mag = Math.sqrt(input.x * input.x + input.y * input.y);
      if (mag > 0.01) {
        setEnergy((e) => Math.max(0, e - (input.running ? 0.3 : 0.1)));
      }
      // Time of day
      timeOfDayRef.current += 0.008;
      if (timeOfDayRef.current >= 1) {
        timeOfDayRef.current -= 1;
        setDayCount((d) => d + 1);
        setEnergy((e) => Math.min(50, e + 20));
      }
    }, 50);
    return () => clearInterval(interval);
  }, [paused]);

  // Track heal progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (paused) return;
      const healed = healedRef.current;
      const fullyHealed = healed.filter((h) => h >= 0.99).length;
      const progress = fullyHealed / (level?.healNodes.length ?? 1);
      setHealProgress(progress);

      // Update stats based on healing
      if (progress > 0) {
        setStats(() => ({
          message: Math.min(100, 10 + progress * 40),
          responsibility: Math.min(100, 10 + progress * 35),
          insight: Math.min(100, 10 + progress * 25 + (insightActive ? 10 : 0)),
        }));
      }

      // Check victory
      if (progress >= 1 && echoProgress >= 0.8) {
        const finalStats = {
          message: Math.floor(10 + 40),
          responsibility: Math.floor(10 + 35),
          insight: Math.floor(10 + 25 + (insightActive ? 10 : 0)),
        };
        const stars = finalStats.message + finalStats.responsibility + finalStats.insight > 200 ? 3 : 2;
        if (settings.haptics) hapticNotify('success');
        completeLevel(currentLevelId, finalStats, stars);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [level, echoProgress, insightActive, currentLevelId, completeLevel, paused, settings.haptics]);

  // Echo proximity check
  useEffect(() => {
    if (!level || level.echoes.length === 0) return;
    const interval = setInterval(() => {
      if (paused) return;
      const pos = avatarPos.current;
      let prompt: string | null = null;
      for (const echo of level.echoes) {
        if (satisfiedEchoes.current.has(echo.id)) continue;
        const dist = pos.distanceTo(new THREE.Vector3(echo.x, 0, echo.z));
        if (dist < 5) {
          prompt = `${echo.emoji} ${echo.name}: ${echo.questText}`;
          break;
        }
      }
      setEchoPrompt(prompt);
    }, 300);
    return () => clearInterval(interval);
  }, [level, paused]);

  const handleNodeHealed = useCallback((_index: number) => {
    if (settings.haptics) hapticImpact('light');
    setStats((s) => ({
      ...s,
      responsibility: Math.min(100, s.responsibility + 3),
      insight: Math.min(100, s.insight + 2),
    }));
  }, [settings.haptics]);

  const handleEchoInteract = useCallback(() => {
    if (!level) return;
    const pos = avatarPos.current;
    for (const echo of level.echoes) {
      if (satisfiedEchoes.current.has(echo.id)) continue;
      const dist = pos.distanceTo(new THREE.Vector3(echo.x, 0, echo.z));
      if (dist < 5) {
        if (echo.questType === 'meet' && echo.partnerId) {
          const partner = level.echoes.find((e) => e.id === echo.partnerId);
          if (partner) {
            const midpoint = new THREE.Vector3((echo.x + partner.x) / 2, 0, (echo.z + partner.z) / 2);
            const distToMid = pos.distanceTo(midpoint);
            if (distToMid < 8) {
              satisfiedEchoes.current.add(echo.id);
              satisfiedEchoes.current.add(partner.id);
              setStats((s) => ({ ...s, message: Math.min(100, s.message + 5), insight: Math.min(100, s.insight + 3) }));
              if (settings.haptics) hapticNotify('success');
            }
          }
        } else if (echo.questType === 'heal') {
          const nearbyNode = level.healNodes.findIndex((n) => Math.abs(n.x - echo.x) < 10 && Math.abs(n.z - echo.z) < 10);
          if (nearbyNode >= 0 && (healedRef.current[nearbyNode] ?? 0) > 0.8) {
            satisfiedEchoes.current.add(echo.id);
            setStats((s) => ({ ...s, message: Math.min(100, s.message + 4), insight: Math.min(100, s.insight + 2) }));
            if (settings.haptics) hapticNotify('success');
          }
        } else if (echo.questType === 'protect') {
          if (treeCount > 0) {
            satisfiedEchoes.current.add(echo.id);
            setStats((s) => ({ ...s, responsibility: Math.min(100, s.responsibility + 3), insight: Math.min(100, s.insight + 2) }));
            if (settings.haptics) hapticNotify('success');
          }
        }
        break;
      }
    }
    // Update echo progress
    const satisfied = level.echoes.filter((e) => satisfiedEchoes.current.has(e.id)).length;
    setEchoProgress(level.echoes.length > 0 ? satisfied / level.echoes.length : 1);
  }, [level, treeCount, settings.haptics]);

  const handlePlantTree = useCallback(() => {
    if (energy < 10) return;
    setEnergy((e) => e - 10);
    setTreeCount((c) => c + 1);
    setStats((s) => ({ ...s, responsibility: Math.min(100, s.responsibility + 3) }));
    if (settings.haptics) hapticImpact('medium');
  }, [energy, settings.haptics]);

  if (!level) return null;

  return (
    <div className="fixed inset-0">
      <Canvas
        shadows
        camera={{ position: [0, 15, 20], fov: 60, near: 0.1, far: 200 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        style={{ background: '#0c1a2a' }}
      >
        <GameEnvironment timeOfDayRef={timeOfDayRef} />
        <GameTerrain
          size={level.mapSize}
          biome={level.biome}
          avatarPosRef={avatarPos}
          healNodesRef={healNodesRef}
          timeOfDayRef={timeOfDayRef}
        />
        <GameAvatar positionRef={avatarPos} inputRef={inputRef} bounds={level.mapSize / 2 - 5} />
        <GameEchoes echoes={level.echoes} satisfiedRef={satisfiedEchoes} />
        <GameHealNodes
          nodes={level.healNodes}
          avatarPosRef={avatarPos}
          healedRef={healedRef}
          onNodeHealed={handleNodeHealed}
        />
        <CameraRig targetRef={avatarPos} />
      </Canvas>

      <GameHUD
        stats={stats}
        energy={energy}
        maxEnergy={50}
        timeOfDay={timeOfDayRef.current}
        dayCount={dayCount}
        healProgress={healProgress}
        echoProgress={echoProgress}
        objective={level.objective}
        insightEnabled={level.insightEnabled}
        insightActive={insightActive}
        onToggleInsight={() => setInsightActive((v) => !v)}
        onPlantTree={handlePlantTree}
        canPlantTree={energy >= 10}
        echoPrompt={echoPrompt}
        onEchoInteract={handleEchoInteract}
        onPause={() => setPaused((p) => !p)}
      />

      {/* Joystick */}
      <div className="fixed bottom-4 right-4 z-20">
        <Joystick
          onMove={(x, y) => { inputRef.current.x = x; inputRef.current.y = y; }}
          onEnd={() => { inputRef.current.x = 0; inputRef.current.y = 0; }}
        />
      </div>

      {/* Run button */}
      <div className="fixed bottom-8 left-4 z-20">
        <button
          onPointerDown={() => { inputRef.current.running = true; }}
          onPointerUp={() => { inputRef.current.running = false; }}
          onPointerLeave={() => { inputRef.current.running = false; }}
          className="h-16 w-16 rounded-full glass border-2 border-ember-400/30 flex items-center justify-center active:scale-95 active:bg-ember-500/20 transition-all touch-none"
          style={{ touchAction: 'none' }}
        >
          <span className="text-xs font-bold text-ember-300">ركض</span>
        </button>
      </div>

      {/* Pause overlay */}
      {paused && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-aether-950/80 backdrop-blur-md">
          <div className="glass rounded-3xl p-8 max-w-xs w-full mx-6 text-center border border-white/10">
            <h2 className="text-xl font-bold text-aether-100 mb-6">إيقاف مؤقت</h2>
            <div className="space-y-2">
              <button onClick={() => setPaused(false)} className="w-full rounded-xl bg-gradient-to-r from-impact-500 to-aether-500 py-3 font-semibold text-white text-sm">
                متابعة
              </button>
              <button onClick={() => navigate('levelSelect')} className="w-full rounded-xl glass-light border border-white/10 py-3 font-medium text-aether-200 text-sm">
                اختيار مرحلة
              </button>
              <button onClick={() => navigate('menu')} className="w-full py-2 text-xs text-aether-300/50 hover:text-aether-200 transition-colors">
                القائمة الرئيسية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
