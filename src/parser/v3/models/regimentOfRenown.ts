import type { IAbility } from './ability';

export interface IRegimentOfRenown {
  name: string;
  abilities: IAbility[];
  points: number;

  // TODO: I'm not sure if regiments of renown ever take reinforced units
  units: Map<string, number>; // unit name to count

  allowedArmies: string[]; // allowed armies
}
