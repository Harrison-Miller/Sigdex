import type { Ability } from './ability';
import type { Model } from './model';
import { Stats } from './stats';
import type { Weapon } from './weapon';

export const UnitCategories: UnitCategory[] = [
  'LEGENDS',
  'HERO',
  'INFANTRY',
  'CAVALRY',
  'BEAST',
  'MONSTER',
  'WAR MACHINE',
  'MANIFESTATION',
  'FACTION TERRAIN',
  'OTHER',
];

export type UnitCategory =
  | 'LEGENDS'
  | 'HERO'
  | 'INFANTRY'
  | 'CAVALRY'
  | 'BEAST'
  | 'MONSTER'
  | 'WAR MACHINE'
  | 'MANIFESTATION'
  | 'FACTION TERRAIN'
  | 'OTHER';

// A unit describes a units warscroll.
export interface IUnit {
  name: string;
  stats: Stats;
  meleeWeapons: Weapon[];
  rangedWeapons: Weapon[];
  abilities: Ability[];
  keywords: string[];
  category: UnitCategory; // this is computed from the keywords
  // this is computed from the models in the unit
  unitSize: number;
  // a unit may have multiple model types with different weapon options
  // e.g) Squigherd has 2 model types: Cave squig and Squigherder each with different weapons.
  models: Map<string, Model>;

  summoningSpell: Ability | null; // duplicate so we don't have to look it up
}

export class Unit implements IUnit {
  name: string;
  stats: Stats;
  meleeWeapons: Weapon[];
  rangedWeapons: Weapon[];
  abilities: Ability[];
  keywords: string[];
  category: UnitCategory;
  unitSize: number;
  models: Map<string, Model>;
  summoningSpell: Ability | null;

  constructor(unit?: Partial<IUnit>) {
    this.name = unit?.name ?? '';
    this.stats = unit?.stats ?? new Stats();
    this.meleeWeapons = unit?.meleeWeapons ?? [];
    this.rangedWeapons = unit?.rangedWeapons ?? [];
    this.abilities = unit?.abilities ?? [];
    this.keywords = unit?.keywords ?? [];
    this.unitSize = unit?.unitSize ?? 1; // default to 1 if not specified
    this.models = unit?.models ?? new Map<string, Model>();
    this.summoningSpell = unit?.summoningSpell ?? null;

    // set stats.ward based on if keyword "Ward (value)" is present
    const wardKeyword = this.keywords.find((keyword) => keyword.toUpperCase().startsWith('WARD'));
    if (wardKeyword) {
      const wardValue = wardKeyword.match(/WARD \((\d+\+)\)/i);
      this.stats.ward = wardValue ? wardValue[1] : '';
    }

    // ignore set category and calculate it
    this.category =
      UnitCategories.find((category) => {
        if (this.keywords.includes(category)) {
          this.category = category;
          return true; // stop searching once we find a match
        }
        return false; // continue searching
      }) || 'OTHER'; // default to 'OTHER' if no match found
  }

  hasKeyword(keyword: string): boolean {
    if (!keyword) return false;
    return this.keywords.some((k) => k.toLowerCase() === keyword.toLowerCase());
  }

  totalWounds(reinforced: boolean = false): number {
    let total = Number(this.stats.health) * this.unitSize;
    if (reinforced) {
      total *= 2;
    }
    return total;
  }

  hasWeaponOptions(): boolean {
    for (const model of this.models.values()) {
      for (const weapon of model.weapons.values()) {
        if (weapon.type === 'optional' || weapon.type === 'grouped') {
          return true;
        }
      }
    }
    return false;
  }
}
