import { AnimatePresence } from 'framer-motion';
import { GameProvider, useGame } from './game/GameContext';
import { hapticNotify } from './game/haptics';
import { useEffect } from 'react';
import StatsBar from './components/StatsBar';
import InsightCompass from './components/InsightCompass';
import BarrenMap from './components/BarrenMap';
import EchoesPanel from './components/EchoesPanel';
import DecisionCard from './components/DecisionCard';
import IntroScreen from './components/IntroScreen';
import EndingScreen from './components/EndingScreen';

function GameScreen() {
  const { state } = useGame();

  useEffect(() => {
    if (state.gamePhase === 'ending') hapticNotify('success');
  }, [state.gamePhase]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-30 pt-3 px-4 pb-2 bg-gradient-to-b from-aether-950 via-aether-950/90 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <StatsBar />
          </div>
          <div className="flex-shrink-0">
            <InsightCompass />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto scrollbar-hide">
        <BarrenMap />
        <div className="glass rounded-2xl p-4">
          <EchoesPanel />
        </div>
      </div>

      <AnimatePresence>
        {state.activeScenario && <DecisionCard key={state.activeScenario.id} />}
      </AnimatePresence>
    </div>
  );
}

function GameContent() {
  const { state } = useGame();

  return (
    <>
      {state.gamePhase === 'intro' && <IntroScreen />}
      {state.gamePhase === 'playing' && <GameScreen />}
      {state.gamePhase === 'ending' && <EndingScreen />}
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <div className="relative min-h-screen overflow-hidden">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-aether-950 via-aether-900 to-aether-950" />
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-aether-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-impact-500/10 blur-3xl" />
        </div>
        <GameContent />
      </div>
    </GameProvider>
  );
}
