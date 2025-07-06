import type { IAbility } from './ability';
import type { IBattleProfile } from './battleProfile';
import type { ILore } from './lore';

export type GrandAlliance = 'order' | 'chaos' | 'death' | 'destruction';

export interface IEnhancementTable {
  name: string;
  abilities: IAbility[];
}

export interface IArmy {
  name: string;
  grandAlliance: GrandAlliance; // probably computed by looking up the keywords of the first unit in battleProfiles
  battleProfiles: Map<string, IBattleProfile>;

  battleTraits: IAbility[];
  formations: Map<string, IAbility[]>; // a formation may have more than one ability

  artifacts: Map<string, IEnhancementTable>; // there can be multiple artifact tables
  heroicTraits: Map<string, IEnhancementTable>; // there can be multiple heroic trait tables

  // other enhancement tables like "Monstrous Traits"
  enhancements: Map<string, IEnhancementTable>;

  spellLore: Map<string, ILore>;
  prayerLore: Map<string, ILore>;
  manifestationLore: Map<string, ILore>;

  regimentsOfRenown: string[]; // names of regiments of renown this army can use

  isArmyOfRenown: boolean; // if this army is an army of renown
  armiesOfRenown: string[]; // names of armies of renown related to this army
}
