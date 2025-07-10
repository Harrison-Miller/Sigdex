import type { IAbility } from './ability';
import type { GrandAlliance, IArmy } from './army';
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

export class BattleTacticCard implements IBattleTacticCard {
  name: string;
  text: string;
  affray: string;
  strike: string;
  domination: string;

  constructor(data?: Partial<IBattleTacticCard>) {
    this.name = data?.name ?? '';
    this.text = data?.text ?? '';
    this.affray = data?.affray ?? '';
    this.strike = data?.strike ?? '';
    this.domination = data?.domination ?? '';
  }
}

// TODO: we're assuming only 1 game mode ghb 2025-06, later we'll want to support multiple game modes
// General object to store everything related to the game data
export interface IGame {
  battleTacticCards: IBattleTacticCard[];
  // weapon ability to the rule description
  weaponAbilityDescriptions: Map<string, string>;
  // some keywords grant abilities like fly, ward.
  keywordAbility: Map<string, IAbility>;

  units: Map<string, IUnit>;
  universalManifestationLores: Map<string, ILore>;
  armies: Map<string, IArmy>;
  armyList: Map<GrandAlliance, string[]>; // list of army names by grand alliance

  regimentsOfRenown: Map<string, IRegimentOfRenown>;
}

export class Game implements IGame {
  battleTacticCards: IBattleTacticCard[] = [];
  weaponAbilityDescriptions: Map<string, string> = new Map();
  keywordAbility: Map<string, IAbility> = new Map();

  units: Map<string, IUnit> = new Map();
  universalManifestationLores: Map<string, ILore> = new Map();
  armies: Map<string, IArmy> = new Map();
  armyList: Map<GrandAlliance, string[]> = new Map();

  regimentsOfRenown: Map<string, IRegimentOfRenown> = new Map();
}
