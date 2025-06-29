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
  range?: string;
}

export interface RegimentOption {
  name: string;
  max?: number;
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

export interface WeaponOption {
  name: string;
  max?: number;
  replaces?: string[];
  group?: string; // for selectionEntryGroup, this is the group name i.e) 'Wargear Options'
}

export interface ModelGroup {
  name: string;
  count: number;
  weapons: WeaponOption[];
}

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
  models?: ModelGroup[];
  companion_units?: string[];
  notReinforcable?: boolean;
  regiment_options?: RegimentOption[]; // options for the regiment if this is the leader
  regiment_tags?: string[]; // tags that this unit has like: Moonclan Agitator
}

export function determineUnitCategory(keywords: string[]): string {
  for (const cat of POSSIBLE_CATEGORIES.slice(0, -1)) {
    if (keywords.some((k) => k.toLowerCase() === cat.toLowerCase())) {
      return cat;
    }
  }
  return 'Other';
}

export function isDefaultModelGroups(modelGroups: ModelGroup[]): boolean {
  if (!modelGroups) return true;
  if (modelGroups.length > 1) return false;
  if (modelGroups.length === 0) return true;
  const group = modelGroups[0];
  return group.weapons.every(
    (w) => (w.max === 0 || w.max === undefined) && !w.replaces && !w.group
  );
}
