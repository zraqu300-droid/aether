import { AnimatePresence } from 'framer-motion';
import { GameProvider, useGame } from './game/GameContext';
import SplashScreen from './components/screens/SplashScreen';
import MainMenuScreen from './components/screens/MainMenuScreen';
import LevelSelectorScreen from './components/screens/LevelSelectorScreen';
import GameScreen from './components/screens/GameScreen';
import VictoryScreen from './components/screens/VictoryScreen';
import SettingsScreen from './components/screens/SettingsScreen';

function ScreenRouter() {
  const { screen } = useGame();

  return (
    <AnimatePresence mode="wait">
      {screen === 'splash' && <SplashScreen key="splash" />}
      {screen === 'menu' && <MainMenuScreen key="menu" />}
      {screen === 'levelSelect' && <LevelSelectorScreen key="levelSelect" />}
      {screen === 'game' && <GameScreen key="game" />}
      {screen === 'victory' && <VictoryScreen key="victory" />}
      {screen === 'settings' && <SettingsScreen key="settings" />}
    </AnimatePresence>
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
        <ScreenRouter />
      </div>
    </GameProvider>
  );
}
