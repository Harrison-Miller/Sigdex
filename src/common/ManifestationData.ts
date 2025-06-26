import type { Ability } from './Ability';

export const universalManifestationLores: string[] = [
  'Aetherwrought Machineries',
  'Forbidden Power',
  'Krondspine Incarnate',
  'Morbid Conjuration',
  'Primal Energy',
  'Twilit Sorceries',
];

export interface Lore {
  abilities: Ability[];
  points?: number;
}
