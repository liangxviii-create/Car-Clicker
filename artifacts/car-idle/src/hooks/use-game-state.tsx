import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useUpsertPlayerSave, useSubmitScore } from "@workspace/api-client-react";
import { CARS } from "@/lib/cars";
import { playEngineRev, playPurchaseSound } from "@/lib/audio";
import { checkAchievements, ACHIEVEMENTS } from "@/lib/achievements";
import {
  generateDailyChallenges,
  getDailyDateKey,
  type DailyChallenge,
} from "@/lib/challenges";

export interface GarageCustomization {
  color: string;
  decals: string;
  rims: string;
}

export interface CustomVehicle {
  id: string;
  name: string;
  brand: string;
  horsepower: number;
  topSpeed: number;
  engine: string;
  description: string;
  rarity: "common" | "rare" | "legendary" | "prestige";
  unlockCost: number;
  imagePath?: string;
  createdAt: number;
}

export const CUSTOM_VEHICLE_COST = 10_000_000_000_000;

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
  dailyChallenges: DailyChallenge[];
  dailyChallengeDate: string;
  customVehicles: CustomVehicle[];
  ownedCustomVehicles: string[];
  lastOnlineTime: number;
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
  dailyChallenges: [],
  dailyChallengeDate: "",
  customVehicles: [],
  ownedCustomVehicles: [],
  lastOnlineTime: Date.now(),
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
  updateChallengeProgress: (type: string, amount: number) => void;
  addCustomVehicle: (v: Omit<CustomVehicle, "id" | "createdAt">) => void;
  deleteCustomVehicle: (id: string) => void;
  buyCustomVehicle: (id: string) => void;
  ready: boolean;
  refreshSave: () => void;
  offlineEarnings: number | null;
  dismissOfflineEarnings: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

let toastFn: ((title: string, description: string) => void) | null = null;
export function setAchievementToastFn(fn: typeof toastFn) {
  toastFn = fn;
}

function freshDailyChallenges(dateKey: string): DailyChallenge[] {
  return generateDailyChallenges(dateKey).map(c => ({
    ...c,
    progress: 0,
    completed: false,
  }));
}

function calcMilesPerSecond(ownedCars: string[], customVehicles: CustomVehicle[], ownedCustomVehicles: string[], prestigeMultiplier: number) {
  const carMps = ownedCars.reduce((acc, carId) => {
    const car = CARS.find(c => c.id === carId);
    return acc + (car ? car.milesPerSecond * prestigeMultiplier : 0);
  }, 0);
  const customMps = ownedCustomVehicles.reduce((acc, id) => {
    const v = customVehicles.find(cv => cv.id === id);
    return acc + (v ? v.horsepower * 10 * prestigeMultiplier : 0);
  }, 0);
  return carMps + customMps;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const upsertSave = useUpsertPlayerSave();
  const submitScore = useSubmitScore();

  const prestigeMultiplier = 1 + state.prestigeLevel * 0.5;

  const milesPerSecond = calcMilesPerSecond(
    state.ownedCars,
    state.customVehicles,
    state.ownedCustomVehicles,
    prestigeMultiplier
  );

  const clickValue = state.ownedCars.reduce((acc, carId) => {
    const car = CARS.find(c => c.id === carId);
    return acc + (car ? car.clickMultiplier : 0);
  }, 1) * prestigeMultiplier;

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("revmaster_save");
    const todayKey = getDailyDateKey();
    const now = Date.now();

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.playerId) parsed.playerId = uuidv4();
        if (!parsed.unlockedAchievements) parsed.unlockedAchievements = [];
        if (!parsed.raceWins) parsed.raceWins = 0;
        if (!parsed.customVehicles) parsed.customVehicles = [];
        if (!parsed.ownedCustomVehicles) parsed.ownedCustomVehicles = [];

        // Offline earnings calculation
        if (parsed.lastOnlineTime && parsed.lastOnlineTime > 0) {
          const elapsedSec = (now - parsed.lastOnlineTime) / 1000;
          if (elapsedSec > 30) {
            const pm = 1 + (parsed.prestigeLevel || 0) * 0.5;
            const mps = calcMilesPerSecond(
              parsed.ownedCars || [],
              parsed.customVehicles || [],
              parsed.ownedCustomVehicles || [],
              pm
            );
            const earned = Math.floor(mps * elapsedSec * 0.70);
            if (earned > 0) {
              parsed.miles = (parsed.miles || 0) + earned;
              parsed.totalMilesEver = (parsed.totalMilesEver || 0) + earned;
              setOfflineEarnings(earned);
            }
          }
        }

        // Refresh daily challenges if it's a new day
        if (parsed.dailyChallengeDate !== todayKey) {
          parsed.dailyChallenges = freshDailyChallenges(todayKey);
          parsed.dailyChallengeDate = todayKey;
        }

        parsed.lastOnlineTime = now;
        setState({ ...DEFAULT_STATE, ...parsed });
      } catch {
        const s: GameState = {
          ...DEFAULT_STATE,
          playerId: uuidv4(),
          dailyChallenges: freshDailyChallenges(todayKey),
          dailyChallengeDate: todayKey,
          lastOnlineTime: now,
        };
        setState(s);
      }
    } else {
      const s: GameState = {
        ...DEFAULT_STATE,
        playerId: uuidv4(),
        dailyChallenges: freshDailyChallenges(todayKey),
        dailyChallengeDate: todayKey,
        lastOnlineTime: now,
      };
      setState(s);
    }
    setReady(true);
  }, []);

  // Sync to localStorage + update lastOnlineTime
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("revmaster_save", JSON.stringify({ ...state, lastOnlineTime: Date.now() }));
  }, [state, ready]);

  // Challenge progress updater
  const updateChallengeProgress = useCallback((type: string, amount: number) => {
    setState(prev => {
      const updated = prev.dailyChallenges.map(c => {
        if (c.completed || c.type !== type) return c;
        const newProgress = Math.min(c.progress + amount, c.target);
        const justCompleted = !c.completed && newProgress >= c.target;
        if (justCompleted && toastFn) {
          toastFn(`🏁 Challenge Complete!`, `${c.description} — +${c.reward.toLocaleString()} miles`);
        }
        return { ...c, progress: newProgress, completed: justCompleted || c.completed };
      });

      const rewardSum = updated.reduce((acc, c, i) => {
        const was = prev.dailyChallenges[i];
        return acc + (!was.completed && c.completed ? c.reward : 0);
      }, 0);

      return {
        ...prev,
        dailyChallenges: updated,
        miles: prev.miles + rewardSum,
        totalMilesEver: prev.totalMilesEver + rewardSum,
      };
    });
  }, []);

  // Achievement checker
  const triggerAchievementCheck = useCallback(
    (flags?: Parameters<typeof checkAchievements>[2]): string[] => {
      const s = stateRef.current;
      const pm = 1 + s.prestigeLevel * 0.5;
      const mps = calcMilesPerSecond(s.ownedCars, s.customVehicles, s.ownedCustomVehicles, pm);
      const newOnes = checkAchievements(
        { ...s, unlockedAchievements: s.unlockedAchievements },
        mps,
        flags
      );
      if (newOnes.length > 0) {
        setState(prev => ({
          ...prev,
          unlockedAchievements: [...new Set([...prev.unlockedAchievements, ...newOnes])],
        }));
        newOnes.forEach(id => {
          const ach = ACHIEVEMENTS.find(a => a.id === id);
          if (ach && toastFn) toastFn(`${ach.icon} Achievement Unlocked!`, ach.name);
        });
      }
      return newOnes;
    },
    [milesPerSecond]
  );

  // Auto-save to server
  useEffect(() => {
    if (!ready || !state.playerId || !state.playerName) return;
    const interval = setInterval(() => {
      upsertSave.mutate({ playerId: state.playerId, data: { saveData: JSON.stringify(stateRef.current) } });
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

  // Periodic achievement check
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => triggerAchievementCheck(), 5000);
    return () => clearInterval(interval);
  }, [ready, triggerAchievementCheck]);

  // Daily challenge: track earn_miles passively
  useEffect(() => {
    if (!ready || milesPerSecond === 0) return;
    const interval = setInterval(() => {
      updateChallengeProgress("earn_miles", milesPerSecond * 10);
    }, 10000);
    return () => clearInterval(interval);
  }, [ready, milesPerSecond, updateChallengeProgress]);

  const setPlayerName = (name: string) => setState(prev => ({ ...prev, playerName: name }));

  const clickMainCar = () => {
    setState(prev => ({
      ...prev,
      miles: prev.miles + clickValue,
      totalMilesEver: prev.totalMilesEver + clickValue,
      clickCount: prev.clickCount + 1,
    }));
    updateChallengeProgress("clicks", 1);
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
      updateChallengeProgress("buy_cars", 1);
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
      setState(prev => ({
        ...DEFAULT_STATE,
        playerId: prev.playerId,
        playerName: prev.playerName,
        prestigeLevel: prev.prestigeLevel + 1,
        totalMilesEver: prev.totalMilesEver,
        garageCustomizations: prev.garageCustomizations,
        unlockedAchievements: prev.unlockedAchievements,
        raceWins: prev.raceWins,
        dailyChallenges: prev.dailyChallenges,
        dailyChallengeDate: prev.dailyChallengeDate,
        customVehicles: prev.customVehicles,
        ownedCustomVehicles: [],
        lastOnlineTime: Date.now(),
      }));
      triggerAchievementCheck();
    }
  };

  const addCustomVehicle = (v: Omit<CustomVehicle, "id" | "createdAt">) => {
    const newVehicle: CustomVehicle = {
      ...v,
      unlockCost: CUSTOM_VEHICLE_COST,
      id: uuidv4(),
      createdAt: Date.now(),
    };
    setState(prev => ({
      ...prev,
      customVehicles: [...(prev.customVehicles ?? []), newVehicle],
    }));
    if (toastFn) toastFn("🔧 Custom Vehicle Created!", `${v.name} added to your custom garage.`);
  };

  const deleteCustomVehicle = (id: string) => {
    setState(prev => ({
      ...prev,
      customVehicles: prev.customVehicles.filter(v => v.id !== id),
      ownedCustomVehicles: prev.ownedCustomVehicles.filter(vid => vid !== id),
    }));
  };

  const buyCustomVehicle = (id: string) => {
    const vehicle = state.customVehicles.find(v => v.id === id);
    if (!vehicle) return;
    const count = state.ownedCustomVehicles.filter(vid => vid === id).length;
    const cost = CUSTOM_VEHICLE_COST;
    if (state.miles >= cost) {
      playPurchaseSound();
      setState(prev => ({
        ...prev,
        miles: prev.miles - cost,
        ownedCustomVehicles: [...(prev.ownedCustomVehicles ?? []), id],
      }));
    }
  };

  const dismissOfflineEarnings = () => setOfflineEarnings(null);

  const refreshSave = () => {};

  return (
    <GameContext.Provider value={{
      state, milesPerSecond, clickValue, prestigeMultiplier,
      setPlayerName, clickMainCar, buyCar, selectCar, prestige,
      updateCustomization, addBonusMiles, triggerAchievementCheck,
      updateChallengeProgress, addCustomVehicle, deleteCustomVehicle,
      buyCustomVehicle, ready, refreshSave,
      offlineEarnings, dismissOfflineEarnings,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGameState must be used within a GameProvider");
  return context;
}
