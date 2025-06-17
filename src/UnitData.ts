// UnitData.ts
// Data classes for units, stats, and weapons
import type { Ability } from './CommonData';

export interface Stats {
  move: string;
  health: number;
  save: string;
  control?: string;
  banishment?: string;
}

export interface Weapon {
  name: string;
  abilities: string[];
  attacks: string;
  hit: string;
  wound: string;
  rend: string;
  damage: string;
}

export const POSSIBLE_CATEGORIES = [
  'Hero',
  'Infantry',
  'Cavalry',
  'Beast',
  'Monster',
  'War Machine',
  'Manifestation',
  'Faction Terrain',
  'Other',
];

export interface Unit {
  name: string;
  stats: Stats;
  melee_weapons: Weapon[];
  ranged_weapons: Weapon[];
  abilities: Ability[];
  keywords: string[];
  category?: string;
  points?: number;
  unit_size?: number;
}

export function determineUnitCategory(unit: Unit): string {
  for (const cat of POSSIBLE_CATEGORIES.slice(0, -1)) {
    if (unit.keywords.some((k) => k.toLowerCase() === cat.toLowerCase())) {
      return cat;
    }
  }
  return 'Other';
}
