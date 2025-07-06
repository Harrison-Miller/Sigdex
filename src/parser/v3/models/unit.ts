import type { IAbility } from './ability';
import type { IModel } from './model';
import type { IStats } from './stats';
import type { IWeapon } from './weapon';

export type UnitCategory =
  | 'legends'
  | 'hero'
  | 'infantry'
  | 'cavalry'
  | 'beast'
  | 'monster'
  | 'war machine'
  | 'manifestation'
  | 'faction terrain'
  | 'other';

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

  summoningSpell: IAbility; // duplicate so we don't have to look it up
}
