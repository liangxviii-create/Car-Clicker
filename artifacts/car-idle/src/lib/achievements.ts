export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "collection" | "driving" | "racing" | "prestige" | "social" | "milestone";
  secret?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ─── COLLECTION ──────────────────────────────────────────────
  {
    id: "first_car",
    name: "First Ride",
    description: "Buy your very first car",
    icon: "🚗",
    category: "collection",
  },
  {
    id: "five_cars",
    name: "Small Fleet",
    description: "Own 5 unique cars",
    icon: "🏎️",
    category: "collection",
  },
  {
    id: "ten_cars",
    name: "Collector",
    description: "Own 10 unique cars",
    icon: "🚘",
    category: "collection",
  },
  {
    id: "twenty_cars",
    name: "Car Hoarder",
    description: "Own 20 unique cars",
    icon: "🏁",
    category: "collection",
  },
  {
    id: "all_jdm_common",
    name: "JDM Life",
    description: "Own all JDM common cars",
    icon: "🇯🇵",
    category: "collection",
  },
  {
    id: "first_ferrari",
    name: "Ferrari Dreams",
    description: "Buy your first Ferrari",
    icon: "🐎",
    category: "collection",
  },
  {
    id: "first_exotic",
    name: "Exotic Taste",
    description: "Own your first Exotic car",
    icon: "🦁",
    category: "collection",
  },
  {
    id: "first_hypercar",
    name: "Hypercar Club",
    description: "Own your first Hypercar",
    icon: "⚡",
    category: "collection",
  },
  {
    id: "koenigsegg_owner",
    name: "One:1 Mentality",
    description: "Own any Koenigsegg",
    icon: "🇸🇪",
    category: "collection",
  },
  {
    id: "full_lambo",
    name: "Raging Bull",
    description: "Own 5 different Lamborghinis",
    icon: "🐂",
    category: "collection",
  },
  {
    id: "fifty_cars_total",
    name: "Fleet Owner",
    description: "Own 50 cars (duplicates count)",
    icon: "🅿️",
    category: "collection",
  },

  // ─── DRIVING ─────────────────────────────────────────────────
  {
    id: "first_click",
    name: "Foot Down",
    description: "Click the car for the first time",
    icon: "👟",
    category: "driving",
  },
  {
    id: "hundred_clicks",
    name: "Road Warrior",
    description: "Click 100 times",
    icon: "✊",
    category: "driving",
  },
  {
    id: "thousand_clicks",
    name: "Click King",
    description: "Click 1,000 times",
    icon: "👑",
    category: "driving",
  },
  {
    id: "ten_thousand_clicks",
    name: "Tap Master",
    description: "Click 10,000 times",
    icon: "🖱️",
    category: "driving",
  },
  {
    id: "speed_100",
    name: "Speed Bump",
    description: "Reach 100 M/s passive speed",
    icon: "💨",
    category: "driving",
  },
  {
    id: "speed_10k",
    name: "Speed Addict",
    description: "Reach 10,000 M/s passive speed",
    icon: "🌪️",
    category: "driving",
  },
  {
    id: "speed_1m",
    name: "Sonic Boom",
    description: "Reach 1,000,000 M/s passive speed",
    icon: "💥",
    category: "driving",
  },
  {
    id: "customize_car",
    name: "Grease Monkey",
    description: "Customize a car in the garage",
    icon: "🔧",
    category: "driving",
  },

  // ─── MILESTONES ───────────────────────────────────────────────
  {
    id: "earn_1m",
    name: "Millionaire",
    description: "Earn 1,000,000 total miles",
    icon: "💰",
    category: "milestone",
  },
  {
    id: "earn_1b",
    name: "Billionaire",
    description: "Earn 1,000,000,000 total miles",
    icon: "💎",
    category: "milestone",
  },
  {
    id: "earn_1t",
    name: "Trillionaire",
    description: "Earn 1,000,000,000,000 total miles",
    icon: "🌌",
    category: "milestone",
  },

  // ─── RACING ──────────────────────────────────────────────────
  {
    id: "first_drift",
    name: "Sideways",
    description: "Complete your first drift run",
    icon: "🌀",
    category: "racing",
  },
  {
    id: "drift_5000",
    name: "Drift King",
    description: "Score 5,000 in a single drift session",
    icon: "👌",
    category: "racing",
  },
  {
    id: "drift_20000",
    name: "Drift Legend",
    description: "Score 20,000 in a single drift session",
    icon: "🔥",
    category: "racing",
  },
  {
    id: "first_race_win",
    name: "Quarter Mile",
    description: "Win your first street race",
    icon: "🏆",
    category: "racing",
  },
  {
    id: "perfect_shift",
    name: "Perfect Shift",
    description: "Land a perfect gear shift in a race",
    icon: "⚙️",
    category: "racing",
  },
  {
    id: "five_race_wins",
    name: "Race Veteran",
    description: "Win 5 street races",
    icon: "🥇",
    category: "racing",
  },

  // ─── PRESTIGE ─────────────────────────────────────────────────
  {
    id: "first_prestige",
    name: "Born Again",
    description: "Prestige for the first time",
    icon: "♻️",
    category: "prestige",
  },
  {
    id: "prestige_3",
    name: "Underground King",
    description: "Reach Prestige 3",
    icon: "👑",
    category: "prestige",
  },
  {
    id: "prestige_5",
    name: "Street Legend",
    description: "Reach Prestige 5",
    icon: "🌟",
    category: "prestige",
  },
  {
    id: "prestige_10",
    name: "RevMaster",
    description: "Reach the legendary Prestige 10",
    icon: "🎖️",
    category: "prestige",
    secret: true,
  },

  // ─── SOCIAL ───────────────────────────────────────────────────
  {
    id: "submit_score",
    name: "On the Board",
    description: "Submit your score to the leaderboard",
    icon: "📋",
    category: "social",
  },
  {
    id: "post_trade",
    name: "Market Maker",
    description: "Post your first trade offer",
    icon: "🤝",
    category: "social",
  },
  {
    id: "accept_trade",
    name: "Deal Closed",
    description: "Accept a trade from another player",
    icon: "✅",
    category: "social",
  },
];

export function checkAchievements(
  state: {
    ownedCars: string[];
    clickCount: number;
    totalMilesEver: number;
    prestigeLevel: number;
    garageCustomizations: Record<string, unknown>;
    unlockedAchievements: string[];
  },
  milesPerSecond: number,
  extraFlags?: {
    driftScore?: number;
    raceWin?: boolean;
    perfectShift?: boolean;
    postTrade?: boolean;
    acceptTrade?: boolean;
    submitScore?: boolean;
    customized?: boolean;
  }
): string[] {
  const already = new Set(state.unlockedAchievements);
  const newOnes: string[] = [];

  const unlock = (id: string) => {
    if (!already.has(id)) {
      already.add(id);
      newOnes.push(id);
    }
  };

  const uniqueCars = [...new Set(state.ownedCars)];
  const brandCounts = state.ownedCars.reduce<Record<string, number>>((acc, id) => {
    const brand = id.split("_")[0];
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {});

  // Collection
  if (state.ownedCars.length >= 1) unlock("first_car");
  if (uniqueCars.length >= 5) unlock("five_cars");
  if (uniqueCars.length >= 10) unlock("ten_cars");
  if (uniqueCars.length >= 20) unlock("twenty_cars");
  if (state.ownedCars.length >= 50) unlock("fifty_cars_total");

  const JDM_COMMON_IDS = ["jdm_golf", "jdm_corolla", "jdm_accord", "jdm_focus", "jdm_fusion", "jdm_civic", "jdm_silvia"];
  if (JDM_COMMON_IDS.every(id => state.ownedCars.includes(id))) unlock("all_jdm_common");

  if (state.ownedCars.some(id => id.startsWith("fer_"))) unlock("first_ferrari");
  if (state.ownedCars.some(id => id.startsWith("exo_"))) unlock("first_exotic");
  if (state.ownedCars.some(id => id.startsWith("hyper_"))) unlock("first_hypercar");
  if (state.ownedCars.some(id => id.includes("jesko") || id.includes("absolut") || id.includes("attack"))) unlock("koenigsegg_owner");

  const lamboIds = state.ownedCars.filter(id => {
    const car_brands = ["exo_huracan", "exo_aventador", "exo_diablo", "exo_gallardo", "exo_murcielago", "exo_temerario", "exo_revuelto",
      "hyper_gallardo_spyder", "hyper_huracan_sto", "hyper_reventon", "hyper_aventador_ultimae", "hyper_sian"];
    return car_brands.includes(id);
  });
  if ([...new Set(lamboIds)].length >= 5) unlock("full_lambo");

  // Driving
  if (state.clickCount >= 1) unlock("first_click");
  if (state.clickCount >= 100) unlock("hundred_clicks");
  if (state.clickCount >= 1000) unlock("thousand_clicks");
  if (state.clickCount >= 10000) unlock("ten_thousand_clicks");
  if (milesPerSecond >= 100) unlock("speed_100");
  if (milesPerSecond >= 10000) unlock("speed_10k");
  if (milesPerSecond >= 1000000) unlock("speed_1m");
  if (extraFlags?.customized || Object.keys(state.garageCustomizations).length > 0) unlock("customize_car");

  // Milestones
  if (state.totalMilesEver >= 1_000_000) unlock("earn_1m");
  if (state.totalMilesEver >= 1_000_000_000) unlock("earn_1b");
  if (state.totalMilesEver >= 1_000_000_000_000) unlock("earn_1t");

  // Prestige
  if (state.prestigeLevel >= 1) unlock("first_prestige");
  if (state.prestigeLevel >= 3) unlock("prestige_3");
  if (state.prestigeLevel >= 5) unlock("prestige_5");
  if (state.prestigeLevel >= 10) unlock("prestige_10");

  // Racing (event-based)
  if (extraFlags?.driftScore !== undefined && extraFlags.driftScore > 0) unlock("first_drift");
  if (extraFlags?.driftScore !== undefined && extraFlags.driftScore >= 5000) unlock("drift_5000");
  if (extraFlags?.driftScore !== undefined && extraFlags.driftScore >= 20000) unlock("drift_20000");
  if (extraFlags?.raceWin) unlock("first_race_win");
  if (extraFlags?.perfectShift) unlock("perfect_shift");

  // Social (event-based)
  if (extraFlags?.submitScore) unlock("submit_score");
  if (extraFlags?.postTrade) unlock("post_trade");
  if (extraFlags?.acceptTrade) unlock("accept_trade");

  return newOnes;
}
