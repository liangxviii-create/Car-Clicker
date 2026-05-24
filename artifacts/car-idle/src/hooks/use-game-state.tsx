import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useUpsertPlayerSave, useSubmitScore } from "@workspace/api-client-react";
import { CARS } from "@/lib/cars";
import { playEngineRev, playPurchaseSound } from "@/lib/audio";
import { checkAchievements, ACHIEVEMENTS } from "@/lib/achievements";

export interface GarageCustomization {
  color: string;
  decals: string;
  rims: string;
}

export interface GameState {
  playerId: string;
  playerName: string | null;
  miles: number;
  totalMilesEver: number;
  prestigeLevel: number;
  ownedCars: string[];
  selectedCar: string | null;
  garageCustomizations: Record<string, GarageCustomization>;
  clickCount: number;
  unlockedAchievements: string[];
  raceWins: number;
}

const DEFAULT_STATE: GameState = {
  playerId: "",
  playerName: null,
  miles: 0,
  totalMilesEver: 0,
  prestigeLevel: 0,
  ownedCars: [],
  selectedCar: null,
  garageCustomizations: {},
  clickCount: 0,
  unlockedAchievements: [],
  raceWins: 0,
};

interface GameContextType {
  state: GameState;
  milesPerSecond: number;
  clickValue: number;
  prestigeMultiplier: number;
  setPlayerName: (name: string) => void;
  clickMainCar: () => void;
  buyCar: (carId: string) => void;
  selectCar: (carId: string) => void;
  prestige: () => void;
  updateCustomization: (carId: string, custom: Partial<GarageCustomization>) => void;
  addBonusMiles: (amount: number) => void;
  triggerAchievementCheck: (flags?: Parameters<typeof checkAchievements>[2]) => string[];
  ready: boolean;
  refreshSave: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

let toastFn: ((title: string, description: string) => void) | null = null;
export function setAchievementToastFn(fn: typeof toastFn) {
  toastFn = fn;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const upsertSave = useUpsertPlayerSave();
  const submitScore = useSubmitScore();

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("revmaster_save");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.playerId) parsed.playerId = uuidv4();
        if (!parsed.unlockedAchievements) parsed.unlockedAchievements = [];
        if (!parsed.raceWins) parsed.raceWins = 0;
        setState({ ...DEFAULT_STATE, ...parsed });
      } catch {
        setState({ ...DEFAULT_STATE, playerId: uuidv4() });
      }
    } else {
      setState({ ...DEFAULT_STATE, playerId: uuidv4() });
    }
    setReady(true);
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("revmaster_save", JSON.stringify(state));
  }, [state, ready]);

  // Derived values
  const prestigeMultiplier = 1 + state.prestigeLevel * 0.5;

  const milesPerSecond = state.ownedCars.reduce((acc, carId) => {
    const car = CARS.find((c) => c.id === carId);
    return acc + (car ? car.milesPerSecond * prestigeMultiplier : 0);
  }, 0);

  const clickValue = state.ownedCars.reduce((acc, carId) => {
    const car = CARS.find((c) => c.id === carId);
    return acc + (car ? car.clickMultiplier : 0);
  }, 1) * prestigeMultiplier;

  // Check achievements helper
  const triggerAchievementCheck = useCallback(
    (flags?: Parameters<typeof checkAchievements>[2]): string[] => {
      const s = stateRef.current;
      const newOnes = checkAchievements(
        { ...s, unlockedAchievements: s.unlockedAchievements },
        milesPerSecond,
        flags
      );
      if (newOnes.length > 0) {
        setState(prev => ({
          ...prev,
          unlockedAchievements: [...new Set([...prev.unlockedAchievements, ...newOnes])],
        }));
        // Show toast for each new achievement
        newOnes.forEach(id => {
          const ach = ACHIEVEMENTS.find(a => a.id === id);
          if (ach && toastFn) {
            toastFn(`${ach.icon} Achievement Unlocked!`, ach.name);
          }
        });
      }
      return newOnes;
    },
    [milesPerSecond]
  );

  // Auto save to server loop
  useEffect(() => {
    if (!ready || !state.playerId || !state.playerName) return;
    const interval = setInterval(() => {
      upsertSave.mutate({
        playerId: state.playerId,
        data: { saveData: JSON.stringify(stateRef.current) },
      });
      submitScore.mutate({
        data: {
          playerId: state.playerId,
          playerName: state.playerName || "Unknown Racer",
          totalMiles: stateRef.current.totalMilesEver,
          prestigeLevel: stateRef.current.prestigeLevel,
          carsOwned: stateRef.current.ownedCars.length,
        },
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [ready, state.playerId, state.playerName]);

  // Passive income loop
  useEffect(() => {
    if (!ready || milesPerSecond === 0) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      if (delta > 0 && delta < 1) {
        const toAdd = milesPerSecond * delta;
        setState(prev => ({
          ...prev,
          miles: prev.miles + toAdd,
          totalMilesEver: prev.totalMilesEver + toAdd,
        }));
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [ready, milesPerSecond]);

  // Periodic achievement check (non-event based)
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => triggerAchievementCheck(), 5000);
    return () => clearInterval(interval);
  }, [ready, triggerAchievementCheck]);

  const setPlayerName = (name: string) => {
    setState(prev => ({ ...prev, playerName: name }));
  };

  const clickMainCar = () => {
    setState(prev => ({
      ...prev,
      miles: prev.miles + clickValue,
      totalMilesEver: prev.totalMilesEver + clickValue,
      clickCount: prev.clickCount + 1,
    }));
    triggerAchievementCheck();
  };

  const buyCar = (carId: string) => {
    const car = CARS.find(c => c.id === carId);
    if (!car) return;
    const count = state.ownedCars.filter(id => id === carId).length;
    const cost = Math.floor(car.baseCost * Math.pow(1.15, count));
    if (state.miles >= cost) {
      playPurchaseSound();
      setState(prev => ({
        ...prev,
        miles: prev.miles - cost,
        ownedCars: [...prev.ownedCars, carId],
        selectedCar: prev.selectedCar || carId,
      }));
      triggerAchievementCheck();
    }
  };

  const selectCar = (carId: string) => {
    if (state.ownedCars.includes(carId)) {
      playEngineRev();
      setState(prev => ({ ...prev, selectedCar: carId }));
    }
  };

  const updateCustomization = (carId: string, custom: Partial<GarageCustomization>) => {
    setState(prev => ({
      ...prev,
      garageCustomizations: {
        ...prev.garageCustomizations,
        [carId]: {
          ...(prev.garageCustomizations[carId] || { color: "#cc2200", decals: "None", rims: "Stock" }),
          ...custom,
        },
      },
    }));
    triggerAchievementCheck({ customized: true });
  };

  const addBonusMiles = (amount: number) => {
    setState(prev => ({
      ...prev,
      miles: prev.miles + amount,
      totalMilesEver: prev.totalMilesEver + amount,
    }));
    triggerAchievementCheck();
  };

  const prestige = () => {
    const required = 1000000 * Math.pow(10, state.prestigeLevel);
    if (state.totalMilesEver >= required) {
      playPurchaseSound();
      const newPrestigeLevel = state.prestigeLevel + 1;
      setState(prev => ({
        ...DEFAULT_STATE,
        playerId: prev.playerId,
        playerName: prev.playerName,
        prestigeLevel: newPrestigeLevel,
        totalMilesEver: prev.totalMilesEver,
        garageCustomizations: prev.garageCustomizations,
        unlockedAchievements: prev.unlockedAchievements,
        raceWins: prev.raceWins,
      }));
      triggerAchievementCheck();
    }
  };

  const refreshSave = () => {};

  return (
    <GameContext.Provider
      value={{
        state,
        milesPerSecond,
        clickValue,
        prestigeMultiplier,
        setPlayerName,
        clickMainCar,
        buyCar,
        selectCar,
        prestige,
        updateCustomization,
        addBonusMiles,
        triggerAchievementCheck,
        ready,
        refreshSave,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGameState must be used within a GameProvider");
  return context;
}
