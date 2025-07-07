import type { IWeaponOption } from './weaponOption';

// each unit is comprised of a number of models that have weapon options
export interface IModel {
  name: string;
  count: number; // number of models in the group
  weapons: Map<string, IWeaponOption>;
}

export class Model implements IModel {
  name: string;
  count: number;
  weapons: Map<string, IWeaponOption>;

  constructor(data?: Partial<IModel>) {
    this.name = data?.name ?? '';
    this.count = data?.count ?? 1; // default to 1 model if not specified
    this.weapons = data?.weapons ?? new Map<string, IWeaponOption>();

    // update max of grouped weapons based on count
    this.weapons.forEach((weapon) => {
      if (weapon.type === 'grouped') {
        weapon.max = this.count; // set max to the number of models in the group
      }
    });
  }
}
