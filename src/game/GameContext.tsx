import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import { scenarios, seasons, type Scenario, type Choice } from './scenarios';

export type GridCell = {
  id: number;
  state: 'barren' | 'alive';
  type: 'grass' | 'tree' | 'flower' | 'water';
};

export type GameStats = {
  message: number;
  responsibility: number;
  harmony: number;
  energy: number;
  seasonIndex: number;
};

export type GameState = {
  stats: GameStats;
  grid: GridCell[];
  currentScenarioIndex: number;
  activeScenario: Scenario | null;
  showInsight: boolean;
  selectedChoice: Choice | null;
  showFuture: boolean;
  completedScenarios: string[];
  gamePhase: 'intro' | 'playing' | 'ending';
};

type Action =
  | { type: 'START_GAME' }
  | { type: 'OPEN_SCENARIO'; index: number }
  | { type: 'SELECT_CHOICE'; choice: Choice }
  | { type: 'CONFIRM_CHOICE' }
  | { type: 'SHOW_FUTURE' }
  | { type: 'CLOSE_INSIGHT' }
  | { type: 'HEAL_CELL'; id: number }
  | { type: 'RESET' };

const GRID_SIZE = 30;

function createGrid(): GridCell[] {
  return Array.from({ length: GRID_SIZE }, (_, i) => ({
    id: i,
    state: 'barren' as const,
    type: 'grass' as const,
  }));
}

const initialState: GameState = {
  stats: { message: 10, responsibility: 10, harmony: 10, energy: 20, seasonIndex: 0 },
  grid: createGrid(),
  currentScenarioIndex: 0,
  activeScenario: null,
  showInsight: false,
  selectedChoice: null,
  showFuture: false,
  completedScenarios: [],
  gamePhase: 'intro',
};

function getHealType(): GridCell['type'] {
  const r = Math.random();
  if (r < 0.4) return 'grass';
  if (r < 0.7) return 'flower';
  if (r < 0.9) return 'tree';
  return 'water';
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return { ...state, gamePhase: 'playing' };

    case 'OPEN_SCENARIO': {
      const scenario = scenarios[action.index];
      if (!scenario) return state;
      return {
        ...state,
        activeScenario: scenario,
        showInsight: false,
        selectedChoice: null,
        showFuture: false,
      };
    }

    case 'SELECT_CHOICE':
      return {
        ...state,
        selectedChoice: action.choice,
        showInsight: true,
        showFuture: false,
      };

    case 'SHOW_FUTURE':
      return { ...state, showFuture: true };

    case 'CONFIRM_CHOICE': {
      if (!state.selectedChoice) return state;
      const c = state.selectedChoice.consequence;
      const newStats: GameStats = {
        message: Math.min(100, state.stats.message + c.message),
        responsibility: Math.min(100, state.stats.responsibility + c.responsibility),
        harmony: Math.min(100, state.stats.harmony + c.harmony),
        energy: Math.max(0, state.stats.energy - 3),
        seasonIndex: (state.stats.seasonIndex + 1) % seasons.length,
      };
      const completed = [...state.completedScenarios, state.activeScenario?.id ?? ''];
      const nextIndex = state.currentScenarioIndex + 1;
      const allDone = nextIndex >= scenarios.length;
      return {
        ...state,
        stats: newStats,
        activeScenario: null,
        showInsight: false,
        selectedChoice: null,
        showFuture: false,
        currentScenarioIndex: nextIndex,
        completedScenarios: completed,
        gamePhase: allDone ? 'ending' : 'playing',
      };
    }

    case 'CLOSE_INSIGHT':
      return {
        ...state,
        showInsight: false,
        selectedChoice: null,
        showFuture: false,
      };

    case 'HEAL_CELL': {
      const grid = state.grid.map((cell) =>
        cell.id === action.id && cell.state !== 'alive'
          ? { ...cell, state: 'alive' as const, type: getHealType() }
          : cell
      );
      const aliveCount = grid.filter((c) => c.state === 'alive').length;
      const newSeason = aliveCount > 0
        ? Math.floor((aliveCount / grid.length) * seasons.length) % seasons.length
        : state.stats.seasonIndex;
      return {
        ...state,
        grid,
        stats: {
          ...state.stats,
          energy: Math.max(0, state.stats.energy - 1),
          seasonIndex: newSeason,
          harmony: Math.min(100, state.stats.harmony + 1),
        },
      };
    }

    case 'RESET':
      return { ...initialState, grid: createGrid(), gamePhase: 'playing' };

    default:
      return state;
  }
}

type GameContextType = {
  state: GameState;
  startGame: () => void;
  openScenario: (index: number) => void;
  selectChoice: (choice: Choice) => void;
  showFuture: () => void;
  confirmChoice: () => void;
  closeInsight: () => void;
  healCell: (id: number) => void;
  resetGame: () => void;
  healProgress: number;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), []);
  const openScenario = useCallback((index: number) => dispatch({ type: 'OPEN_SCENARIO', index }), []);
  const selectChoice = useCallback((choice: Choice) => dispatch({ type: 'SELECT_CHOICE', choice }), []);
  const showFuture = useCallback(() => dispatch({ type: 'SHOW_FUTURE' }), []);
  const confirmChoice = useCallback(() => dispatch({ type: 'CONFIRM_CHOICE' }), []);
  const closeInsight = useCallback(() => dispatch({ type: 'CLOSE_INSIGHT' }), []);
  const healCell = useCallback((id: number) => dispatch({ type: 'HEAL_CELL', id }), []);
  const resetGame = useCallback(() => dispatch({ type: 'RESET' }), []);

  const healProgress = state.grid.filter((c) => c.state === 'alive').length / state.grid.length;

  return (
    <GameContext.Provider
      value={{
        state, startGame, openScenario, selectChoice, showFuture,
        confirmChoice, closeInsight, healCell, resetGame, healProgress,
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
