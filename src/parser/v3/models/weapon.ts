export interface IWeapon {
  name: string;
  abilities: string[]; // e.g) "Companion", "Crit (Mortal)"
  attacks: string;
  hit: string;
  wound: string;
  rend: string;
  damage: string;
  // range is only present for ranged weapons
  range: string;
}
