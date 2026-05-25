export type ChallengeType = "buy_cars" | "clicks" | "drift_score" | "race_wins" | "earn_miles" | "buy_category";

export interface ChallengeTemplate {
  type: ChallengeType;
  descriptions: string[];
  targets: number[];
  rewardMultiplier: number;
  category?: string;
}

const TEMPLATES: ChallengeTemplate[] = [
  {
    type: "clicks",
    descriptions: ["Click the car {n} times", "Tap it {n} times to feel alive"],
    targets: [50, 100, 200, 500, 1000],
    rewardMultiplier: 100,
  },
  {
    type: "drift_score",
    descriptions: ["Score {n} points in Drift Mode", "Pull off {n} drift points"],
    targets: [500, 1000, 2500, 5000, 10000],
    rewardMultiplier: 500,
  },
  {
    type: "race_wins",
    descriptions: ["Win {n} Street Race(s)", "Beat the CPU {n} time(s)"],
    targets: [1, 2, 3, 5],
    rewardMultiplier: 5000,
  },
  {
    type: "earn_miles",
    descriptions: ["Earn {n} miles today", "Accumulate {n} total miles"],
    targets: [10000, 50000, 200000, 1000000, 5000000],
    rewardMultiplier: 0.5,
  },
  {
    type: "buy_cars",
    descriptions: ["Buy {n} car(s) from the dealership", "Add {n} new car(s) to your fleet"],
    targets: [1, 2, 3, 5],
    rewardMultiplier: 2000,
  },
];

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
  description: string;
  target: number;
  reward: number;
  progress: number;
  completed: boolean;
  dateKey: string;
}

export function getDailyDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function generateDailyChallenges(dateKey: string): Omit<DailyChallenge, "progress" | "completed">[] {
  const seed = dateKey.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) * 31337;
  const rng = seededRng(seed);

  const result: Omit<DailyChallenge, "progress" | "completed">[] = [];
  const usedTemplates = new Set<number>();

  while (result.length < 3) {
    const ti = Math.floor(rng() * TEMPLATES.length);
    if (usedTemplates.has(ti)) continue;
    usedTemplates.add(ti);

    const tmpl = TEMPLATES[ti];
    const targetIdx = Math.floor(rng() * tmpl.targets.length);
    const target = tmpl.targets[targetIdx];
    const descIdx = Math.floor(rng() * tmpl.descriptions.length);
    const description = tmpl.descriptions[descIdx].replace("{n}", target.toLocaleString());
    const reward = Math.floor(target * tmpl.rewardMultiplier);

    result.push({
      id: `${dateKey}_${ti}_${targetIdx}`,
      type: tmpl.type,
      description,
      target,
      reward,
      dateKey,
    });
  }

  return result;
}
