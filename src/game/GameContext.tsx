import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export type ScreenName =
  | 'splash'
  | 'menu'
  | 'levelSelect'
  | 'game'
  | 'victory'
  | 'settings';

export type GameStats = {
  message: number;
  responsibility: number;
  insight: number;
};

export type LevelProgress = {
  completed: boolean;
  stars: number;
  stats: GameStats;
};

export type Settings = {
  sound: boolean;
  music: boolean;
  haptics: boolean;
};

type GameContextType = {
  screen: ScreenName;
  navigate: (screen: ScreenName) => void;
  currentLevelId: number;
  startLevel: (id: number) => void;
  completeLevel: (id: number, stats: GameStats, stars: number) => void;
  levelProgress: Record<number, LevelProgress>;
  isLevelUnlocked: (id: number) => boolean;
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  victoryStats: GameStats | null;
  victoryStars: number;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenName>('splash');
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [levelProgress, setLevelProgress] = useState<Record<number, LevelProgress>>({
    1: { completed: false, stars: 0, stats: { message: 0, responsibility: 0, insight: 0 } },
  });
  const [settings, setSettings] = useState<Settings>({
    sound: true,
    music: true,
    haptics: true,
  });
  const [victoryStats, setVictoryStats] = useState<GameStats | null>(null);
  const [victoryStars, setVictoryStars] = useState(0);

  const navigate = useCallback((s: ScreenName) => setScreen(s), []);

  const startLevel = useCallback((id: number) => {
    setCurrentLevelId(id);
    setScreen('game');
  }, []);

  const completeLevel = useCallback((id: number, stats: GameStats, stars: number) => {
    setLevelProgress((prev) => ({
      ...prev,
      [id]: { completed: true, stars, stats },
      // Unlock next level
      ...(id + 1 <= 10 ? { [id + 1]: { completed: false, stars: 0, stats: { message: 0, responsibility: 0, insight: 0 } } } : {}),
    }));
    setVictoryStats(stats);
    setVictoryStars(stars);
    setScreen('victory');
  }, []);

  const isLevelUnlocked = useCallback(
    (id: number) => {
      if (id === 1) return true;
      return levelProgress[id - 1]?.completed ?? false;
    },
    [levelProgress]
  );

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <GameContext.Provider
      value={{
        screen, navigate, currentLevelId, startLevel, completeLevel,
        levelProgress, isLevelUnlocked, settings, updateSettings,
        victoryStats, victoryStars,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
