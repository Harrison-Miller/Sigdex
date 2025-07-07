export interface IWeapon {
  name: string;
  // range is only present for ranged weapons
  range: string;
  attacks: string;
  hit: string;
  wound: string;
  rend: string;
  damage: string;

  abilities: string[]; // e.g) "Companion", "Crit (Mortal)"
}

export class Weapon implements IWeapon {
  name: string;
  abilities: string[];
  attacks: string;
  hit: string;
  wound: string;
  rend: string;
  damage: string;
  range: string;

  constructor(data?: Partial<IWeapon>) {
    this.name = data?.name ?? '';
    this.abilities = data?.abilities ?? [];
    this.attacks = data?.attacks ?? '';
    this.hit = data?.hit ?? '';
    this.wound = data?.wound ?? '';
    this.rend = data?.rend ?? '';
    this.damage = data?.damage ?? '';
    this.range = data?.range ?? '';
  }
}
