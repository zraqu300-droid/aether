import { AnimatePresence } from 'framer-motion';
import { GameProvider, useGame } from './game/GameContext';
import IntroScreen from './components/IntroScreen';
import EndingScreen from './components/EndingScreen';
import GameCanvas from './components/GameCanvas';

function GameContent() {
  const { state } = useGame();

  return (
    <>
      {state.phase === 'intro' && <IntroScreen />}
      <AnimatePresence>
        {state.phase === 'playing' && <GameCanvas key="game" />}
      </AnimatePresence>
      {state.phase === 'ending' && <EndingScreen />}
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <div className="relative min-h-screen overflow-hidden bg-aether-950">
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
