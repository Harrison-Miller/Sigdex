import type { IAbility } from './ability';

export interface ILore {
  name: string;
  abilities: IAbility[]; // spells, prayers or summoning spells
  points: number;
}

export class Lore implements ILore {
  name: string;
  abilities: IAbility[];
  points: number;

  constructor(lore?: Partial<ILore>) {
    this.name = lore?.name ?? '';
    this.abilities = lore?.abilities ?? [];
    this.points = lore?.points ?? 0;
  }
}
