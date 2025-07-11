import type { Ability } from './ability';

export interface IRegimentOfRenown {
  name: string;
  abilities: Ability[];
  points: number;

  units: Map<string, number>; // unit name to count

  allowedArmies: string[]; // allowed armies
}

export class RegimentOfRenown implements IRegimentOfRenown {
  name: string;
  abilities: Ability[];
  points: number;

  units: Map<string, number>;

  allowedArmies: string[];

  constructor(data?: Partial<IRegimentOfRenown>) {
    this.name = data?.name ?? '';
    this.abilities = data?.abilities ?? [];
    this.points = data?.points ?? 0;
    this.units = data?.units ?? new Map();
    this.allowedArmies = data?.allowedArmies ?? [];
  }
}
