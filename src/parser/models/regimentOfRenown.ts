import type { IAbility } from './ability';

export interface IRegimentOfRenown {
  name: string;
  abilities: IAbility[];
  points: number;

  units: Map<string, number>; // unit name to count

  allowedArmies: string[]; // allowed armies
}
