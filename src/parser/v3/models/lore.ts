import type { IAbility } from './ability';

export interface ILore {
  name: string;
  abilities: IAbility[]; // spells, prayers or summoning spells
  points: number;
}
