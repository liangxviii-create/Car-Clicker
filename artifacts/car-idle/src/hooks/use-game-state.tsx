import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useUpsertPlayerSave, useGetPlayerSave, useSubmitScore } from "@workspace/api-client-react";
import { CARS } from "@/lib/cars";
import { playEngineRev, playPurchaseSound } from "@/lib/audio";

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
  ready: boolean;
  refreshSave: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

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
        setState({ ...DEFAULT_STATE, ...parsed });
      } catch (e) {
        setState({ ...DEFAULT_STATE, playerId: uuidv4() });
      }
    } else {
      setState({ ...DEFAULT_STATE, playerId: uuidv4() });
    }
    setReady(true);
  }, []);

  // Sync state to local storage when it changes
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

  // Clicker Loop
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
          totalMilesEver: prev.totalMilesEver + toAdd
        }));
      }
      frameId = requestAnimationFrame(tick);
    };
    
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [ready, milesPerSecond]);

  const setPlayerName = (name: string) => {
    setState((prev) => ({ ...prev, playerName: name }));
  };

  const clickMainCar = () => {
    setState((prev) => ({
      ...prev,
      miles: prev.miles + clickValue,
      totalMilesEver: prev.totalMilesEver + clickValue,
      clickCount: prev.clickCount + 1,
    }));
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
        selectedCar: prev.selectedCar || carId
      }));
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
          ...(prev.garageCustomizations[carId] || { color: "#ff0000", decals: "none", rims: "stock" }),
          ...custom
        }
      }
    }));
  };

  const addBonusMiles = (amount: number) => {
    setState(prev => ({
      ...prev,
      miles: prev.miles + amount,
      totalMilesEver: prev.totalMilesEver + amount
    }));
  };

  const prestige = () => {
    const required = 1000000 * Math.pow(10, state.prestigeLevel);
    if (state.totalMilesEver >= required) {
      playPurchaseSound();
      setState(prev => ({
        ...DEFAULT_STATE,
        playerId: prev.playerId,
        playerName: prev.playerName,
        prestigeLevel: prev.prestigeLevel + 1,
        totalMilesEver: prev.totalMilesEver,
        garageCustomizations: prev.garageCustomizations // Keep customizations
      }));
    }
  };

  // Provide a function to trigger a forced load/save check
  const refreshSave = () => {
    // Only fetch manually if needed, normally automatic.
  };

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
        ready,
        refreshSave
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameProvider");
  }
  return context;
}
