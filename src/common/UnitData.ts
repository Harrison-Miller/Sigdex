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
  sub_hero_options?: RegimentOption[];
  sub_hero_tags?: string[]; // tags that this unit has like: Moonclan Agitator
  regiment_options?: RegimentOption[];
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

/**
 * Filters units by regiment options in stages:
 * 1. Filter out Faction Terrain and Manifestations.
 * 2. Filter out all heroes except those where the regiment option is the exact name or the regiment option is the exact name of one of the sub_hero_tags.
 * 3. For all other units, filter by includes name, category, or keywords.
 */
export function filterUnitsByRegimentOptions(units: Unit[], options: RegimentOption[]): Unit[] {
  if (!options || options.length === 0) return units;
  const optionNames = options.map((opt) => opt.name.toLowerCase());
  console.log('Filtering units by regiment options:', optionNames);

  // 1. Filter out Faction Terrain and Manifestations
  let filtered = units.filter((unit) => {
    const category = unit.category?.toLowerCase() || '';
    return category !== 'faction terrain' && category !== 'manifestation';
  });

  // 2. Filter out all heroes except those where the regiment option is the exact name or the regiment option is the exact name of one of the sub_hero_tags
  filtered = filtered.filter((unit) => {
    const category = unit.category?.toLowerCase() || '';
    if (category === 'hero') {
      const name = unit.name?.toLowerCase() || '';
      const tags = (unit.sub_hero_tags || []).map((t) => t.toLowerCase());
      console.log('Filtering hero:', name, tags, optionNames);
      // Only keep hero if regiment option is exact name or exact sub_hero_tag
      return optionNames.some((optName) => name === optName || tags.includes(optName));
    }
    return true;
  });

  // 3. For all other units, filter by includes name, category, or keywords
  filtered = filtered.filter((unit) => {
    const category = unit.category?.toLowerCase() || '';
    if (category === 'hero') return true; // already handled
    const name = unit.name?.toLowerCase() || '';
    const keywords = (unit.keywords || []).map((k) => k.toLowerCase());
    // Compound option support: if option is multiple words, require all to be present in keywords
    return optionNames.some((optName) => {
      if (optName.includes(' ')) {
        const parts = optName.split(/\s+/);
        return parts.every((part) => keywords.includes(part));
      }
      return (
        name.includes(optName) ||
        category.includes(optName) ||
        keywords.some((kw) => kw.includes(optName))
      );
    });
  });

  return filtered;
}
