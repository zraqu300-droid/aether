import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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

const STORAGE_KEYS = {
  unlockedLevels: 'aether_unlockedLevels',
  currentLevel: 'aether_currentLevel',
  levelProgress: 'aether_levelProgress',
  settings: 'aether_settings',
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function initUnlockedLevels(): number[] {
  const raw = localStorage.getItem(STORAGE_KEYS.unlockedLevels);
  const parsed = safeParse<number[]>(raw, []);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    const defaultValue = [1];
    localStorage.setItem(STORAGE_KEYS.unlockedLevels, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return parsed;
}

function initCurrentLevel(): number {
  const raw = localStorage.getItem(STORAGE_KEYS.currentLevel);
  const parsed = safeParse<number>(raw, 0);
  if (!parsed || parsed < 1) {
    localStorage.setItem(STORAGE_KEYS.currentLevel, '1');
    return 1;
  }
  return parsed;
}

function initLevelProgress(): Record<number, LevelProgress> {
  const raw = localStorage.getItem(STORAGE_KEYS.levelProgress);
  const parsed = safeParse<Record<number, LevelProgress>>(raw, {});
  return parsed && typeof parsed === 'object' ? parsed : {};
}

function initSettings(): Settings {
  const raw = localStorage.getItem(STORAGE_KEYS.settings);
  return safeParse<Settings>(raw, { sound: true, music: true, haptics: true });
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenName>('splash');
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => initCurrentLevel());
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(() => initUnlockedLevels());
  const [levelProgress, setLevelProgress] = useState<Record<number, LevelProgress>>(() => initLevelProgress());
  const [settings, setSettings] = useState<Settings>(() => initSettings());
  const [victoryStats, setVictoryStats] = useState<GameStats | null>(null);
  const [victoryStars, setVictoryStars] = useState(0);

  // Persist unlocked levels
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.unlockedLevels, JSON.stringify(unlockedLevels));
  }, [unlockedLevels]);

  // Persist current level
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.currentLevel, JSON.stringify(currentLevelId));
  }, [currentLevelId]);

  // Persist level progress
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.levelProgress, JSON.stringify(levelProgress));
  }, [levelProgress]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }, [settings]);

  const navigate = useCallback((s: ScreenName) => setScreen(s), []);

  const startLevel = useCallback((id: number) => {
    setCurrentLevelId(id);
    localStorage.setItem(STORAGE_KEYS.currentLevel, JSON.stringify(id));
    setScreen('game');
  }, []);

  const completeLevel = useCallback((id: number, stats: GameStats, stars: number) => {
    setLevelProgress((prev) => ({
      ...prev,
      [id]: { completed: true, stars, stats },
    }));
    // Unlock next level
    setUnlockedLevels((prev) => {
      if (prev.includes(id + 1)) return prev;
      return [...prev, id + 1];
    });
    setVictoryStats(stats);
    setVictoryStars(stars);
    setScreen('victory');
  }, []);

  const isLevelUnlocked = useCallback(
    (id: number) => {
      if (id === 1) return true;
      return unlockedLevels.includes(id);
    },
    [unlockedLevels]
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
