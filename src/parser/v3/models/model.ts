import type { IWeaponOption } from './weaponOption';

// each unit is comprised of a number of models that have weapon options
export interface IModel {
  name: string;
  count: number; // number of models in the group
  weapons: Map<string, IWeaponOption>;
}
