import type { Ability } from './Ability';

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
  'Legends',
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

export function determineUnitCategory(keywords: string[]): string {
  for (const cat of POSSIBLE_CATEGORIES.slice(0, -1)) {
    if (keywords.some((k) => k.toLowerCase() === cat.toLowerCase())) {
      return cat;
    }
  }
  return 'Other';
}
