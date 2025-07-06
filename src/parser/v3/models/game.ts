import type { IAbility } from './ability';
import type { IArmy } from './army';
import type { ILore } from './lore';
import type { IRegimentOfRenown } from './regimentOfRenown';
import type { IUnit } from './unit';

export interface IBattleTacticCard {
  name: string;
  text: string;
  affray: string;
  strike: string;
  domination: string;
}

// TODO: we're assuming only 1 game mode ghb 2025-06, later we'll wan to support multiple game modes
// General object to store everything related to the game data
export interface IGame {
  battleTacticCards: IBattleTacticCard[];
  // weapon ability to the rule description
  weaponAbilityDescriptions: Map<string, string>;
  // some keywords grant abilities like fly, ward.
  keywordAbility: Map<string, IAbility>;

  units: Map<string, IUnit>;
  universalManifestationsLores: Map<string, ILore>;
  armies: Map<string, IArmy>;

  regimentsOfRenown: Map<string, IRegimentOfRenown>;
}
