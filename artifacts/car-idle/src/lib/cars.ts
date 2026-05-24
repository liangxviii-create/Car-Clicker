export type CarCategory = "jdm" | "ferrari" | "muscle" | "exotic";
export type CarRarity = "common" | "rare" | "legendary" | "prestige";

export interface Car {
  id: string;
  name: string;
  brand: string;
  category: CarCategory;
  rarity: CarRarity;
  baseCost: number;
  milesPerSecond: number;
  clickMultiplier: number;
  unlockRequirement?: string;
  imagePath?: string;
}

export const CARS: Car[] = [
  // JDM
  {
    id: "jdm_civic",
    name: "Civic Type R",
    brand: "Honda",
    category: "jdm",
    rarity: "common",
    baseCost: 100,
    milesPerSecond: 1,
    clickMultiplier: 1.1,
  },
  {
    id: "jdm_silvia",
    name: "Silvia S15",
    brand: "Nissan",
    category: "jdm",
    rarity: "common",
    baseCost: 500,
    milesPerSecond: 5,
    clickMultiplier: 1.2,
  },
  {
    id: "jdm_rx7",
    name: "RX-7",
    brand: "Mazda",
    category: "jdm",
    rarity: "rare",
    baseCost: 2500,
    milesPerSecond: 20,
    clickMultiplier: 1.5,
  },
  {
    id: "jdm_supra",
    name: "Supra MK4",
    brand: "Toyota",
    category: "jdm",
    rarity: "rare",
    baseCost: 10000,
    milesPerSecond: 75,
    clickMultiplier: 2.0,
  },
  {
    id: "jdm_skyline",
    name: "Skyline GT-R R34",
    brand: "Nissan",
    category: "jdm",
    rarity: "legendary",
    baseCost: 50000,
    milesPerSecond: 300,
    clickMultiplier: 3.0,
  },
  {
    id: "jdm_nsx",
    name: "NSX",
    brand: "Honda",
    category: "jdm",
    rarity: "legendary",
    baseCost: 150000,
    milesPerSecond: 800,
    clickMultiplier: 4.0,
  },

  // Muscle
  {
    id: "muscle_mustang",
    name: "Mustang GT",
    brand: "Ford",
    category: "muscle",
    rarity: "common",
    baseCost: 800,
    milesPerSecond: 8,
    clickMultiplier: 1.3,
  },
  {
    id: "muscle_camaro",
    name: "Camaro SS",
    brand: "Chevrolet",
    category: "muscle",
    rarity: "common",
    baseCost: 1500,
    milesPerSecond: 12,
    clickMultiplier: 1.4,
  },
  {
    id: "muscle_charger",
    name: "Charger Hellcat",
    brand: "Dodge",
    category: "muscle",
    rarity: "rare",
    baseCost: 8000,
    milesPerSecond: 60,
    clickMultiplier: 1.8,
  },
  {
    id: "muscle_challenger",
    name: "Challenger Demon",
    brand: "Dodge",
    category: "muscle",
    rarity: "legendary",
    baseCost: 40000,
    milesPerSecond: 250,
    clickMultiplier: 2.5,
  },
  {
    id: "muscle_corvette",
    name: "Corvette Z06",
    brand: "Chevrolet",
    category: "muscle",
    rarity: "legendary",
    baseCost: 120000,
    milesPerSecond: 600,
    clickMultiplier: 3.5,
  },

  // Ferrari
  {
    id: "fer_458",
    name: "458 Italia",
    brand: "Ferrari",
    category: "ferrari",
    rarity: "rare",
    baseCost: 500000,
    milesPerSecond: 2000,
    clickMultiplier: 5.0,
  },
  {
    id: "fer_f40",
    name: "F40",
    brand: "Ferrari",
    category: "ferrari",
    rarity: "legendary",
    baseCost: 2000000,
    milesPerSecond: 7500,
    clickMultiplier: 8.0,
  },
  {
    id: "fer_laferrari",
    name: "LaFerrari",
    brand: "Ferrari",
    category: "ferrari",
    rarity: "prestige",
    baseCost: 10000000,
    milesPerSecond: 30000,
    clickMultiplier: 15.0,
    unlockRequirement: "Prestige 1",
  },
  {
    id: "fer_sf90",
    name: "SF90 Stradale",
    brand: "Ferrari",
    category: "ferrari",
    rarity: "prestige",
    baseCost: 50000000,
    milesPerSecond: 100000,
    clickMultiplier: 30.0,
    unlockRequirement: "Prestige 2",
  },

  // Exotic
  {
    id: "exo_huracan",
    name: "Huracán",
    brand: "Lamborghini",
    category: "exotic",
    rarity: "rare",
    baseCost: 800000,
    milesPerSecond: 3000,
    clickMultiplier: 6.0,
  },
  {
    id: "exo_aventador",
    name: "Aventador SVJ",
    brand: "Lamborghini",
    category: "exotic",
    rarity: "legendary",
    baseCost: 3500000,
    milesPerSecond: 12000,
    clickMultiplier: 10.0,
  },
  {
    id: "exo_veyron",
    name: "Veyron",
    brand: "Bugatti",
    category: "exotic",
    rarity: "prestige",
    baseCost: 20000000,
    milesPerSecond: 50000,
    clickMultiplier: 20.0,
    unlockRequirement: "Prestige 1",
  },
  {
    id: "exo_chiron",
    name: "Chiron",
    brand: "Bugatti",
    category: "exotic",
    rarity: "prestige",
    baseCost: 100000000,
    milesPerSecond: 250000,
    clickMultiplier: 50.0,
    unlockRequirement: "Prestige 3",
  },
];
