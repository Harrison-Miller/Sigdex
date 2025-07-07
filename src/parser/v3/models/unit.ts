import type { IAbility } from './ability';
import type { IModel } from './model';
import { Stats, type IStats } from './stats';
import type { IWeapon } from './weapon';

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
  stats: IStats;
  meleeWeapons: IWeapon[];
  rangedWeapons: IWeapon[];
  abilities: IAbility[];
  keywords: string[];
  category: UnitCategory; // this is computed from the keywords
  // this is computed from the models in the unit
  unitSize: number;
  // a unit may have multiple model types with different weapon options
  // e.g) Squigherd has 2 model types: Cave squig and Squigherder each with different weapons.
  models: Map<string, IModel>;

  summoningSpell: IAbility | null; // duplicate so we don't have to look it up
}

export class Unit implements IUnit {
  name: string;
  stats: IStats;
  meleeWeapons: IWeapon[];
  rangedWeapons: IWeapon[];
  abilities: IAbility[];
  keywords: string[];
  category: UnitCategory;
  unitSize: number;
  models: Map<string, IModel>;
  summoningSpell: IAbility | null;

  constructor(unit?: Partial<IUnit>) {
    this.name = unit?.name ?? '';
    this.stats = unit?.stats ?? new Stats();
    this.meleeWeapons = unit?.meleeWeapons ?? [];
    this.rangedWeapons = unit?.rangedWeapons ?? [];
    this.abilities = unit?.abilities ?? [];
    this.keywords = unit?.keywords ?? [];
    this.models = unit?.models ?? new Map<string, IModel>();
    this.summoningSpell = unit?.summoningSpell ?? null;

    // set stats.ward based on if keyword "Ward (value)" is present
    const wardKeyword = this.keywords.find((keyword) => keyword.startsWith('Ward ('));
    if (wardKeyword) {
      const wardValue = wardKeyword.match(/Ward \((\d+\+)\)/);
      this.stats.ward = wardValue ? wardValue[0] : '';
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

    // calculate unit size based on models
    this.unitSize = Array.from(this.models.values()).reduce((total, model) => {
      return total + model.count;
    }, 0);
  }
}
