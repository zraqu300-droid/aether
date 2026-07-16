import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { GameWorldState, EchoSpirit } from './types';

export type UIState = {
  phase: 'intro' | 'playing' | 'ending';
  worldState: GameWorldState | null;
  nearbyEcho: EchoSpirit | null;
  showEchoPrompt: boolean;
  echoMessage: string | null;
  healProgress: number;
  echoProgress: number;
  showInsightLens: boolean;
  insightResult: string | null;
  canPlantTree: boolean;
  treePlanted: boolean;
};

type GameContextType = {
  state: UIState;
  startGame: () => void;
  resetGame: () => void;
  setWorldState: (ws: GameWorldState) => void;
  setNearbyEcho: (echo: EchoSpirit | null) => void;
  triggerEchoInteraction: () => void;
  toggleInsightLens: (active: boolean) => void;
  setInsightResult: (result: string | null) => void;
  plantTree: () => void;
  setProgress: (heal: number, echo: number) => void;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIState>({
    phase: 'intro',
    worldState: null,
    nearbyEcho: null,
    showEchoPrompt: false,
    echoMessage: null,
    healProgress: 0,
    echoProgress: 0,
    showInsightLens: false,
    insightResult: null,
    canPlantTree: false,
    treePlanted: false,
  });

  const echoMessageTimer = useRef<number | null>(null);

  const startGame = useCallback(() => setState((s) => ({ ...s, phase: 'playing' })), []);
  const resetGame = useCallback(() =>
    setState({
      phase: 'playing',
      worldState: null,
      nearbyEcho: null,
      showEchoPrompt: false,
      echoMessage: null,
      healProgress: 0,
      echoProgress: 0,
      showInsightLens: false,
      insightResult: null,
      canPlantTree: false,
      treePlanted: false,
    }), []);

  const setWorldState = useCallback((ws: GameWorldState) =>
    setState((s) => ({
      ...s,
      worldState: ws,
      canPlantTree: ws.lightEnergy >= 10,
    })), []);

  const setNearbyEcho = useCallback((echo: EchoSpirit | null) =>
    setState((s) => ({
      ...s,
      nearbyEcho: echo,
      showEchoPrompt: echo !== null && !echo.satisfied,
    })), []);

  const triggerEchoInteraction = useCallback(() => {
    setState((s) => {
      if (!s.nearbyEcho || s.nearbyEcho.satisfied) return s;
      const msg = s.nearbyEcho.satisfied
        ? `${s.nearbyEcho.name} شاكر ومُطمئن`
        : `${s.nearbyEcho.emoji} ${s.nearbyEcho.name}: ${s.nearbyEcho.questText}`;
      if (echoMessageTimer.current) clearTimeout(echoMessageTimer.current);
      echoMessageTimer.current = window.setTimeout(() => {
        setState((prev) => ({ ...prev, echoMessage: null }));
      }, 4000);
      return { ...s, echoMessage: msg };
    });
  }, []);

  const toggleInsightLens = useCallback((active: boolean) =>
    setState((s) => ({ ...s, showInsightLens: active })), []);

  const setInsightResult = useCallback((result: string | null) =>
    setState((s) => ({ ...s, insightResult: result })), []);

  const plantTree = useCallback(() =>
    setState((s) => ({ ...s, treePlanted: true })), []);

  const setProgress = useCallback((heal: number, echo: number) =>
    setState((s) => ({ ...s, healProgress: heal, echoProgress: echo })), []);

  return (
    <GameContext.Provider
      value={{
        state, startGame, resetGame, setWorldState, setNearbyEcho,
        triggerEchoInteraction, toggleInsightLens, setInsightResult,
        plantTree, setProgress,
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
