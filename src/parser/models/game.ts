import type { Ability } from './ability';
import type { GrandAlliance, Army } from './army';
import type { Lore } from './lore';
import type { RegimentOfRenown } from './regimentOfRenown';
import type { Unit } from './unit';

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

export interface IArmyOfRenownListItem {
  name: string,
  legends: boolean,
}

export class ArmyOfRenownListItem {
  name: string;
  legends: boolean;

  constructor(data?: Partial<IArmyOfRenownListItem>) {
    this.name = data?.name ?? '';
    this.legends = data?.legends ?? false;
  }
}

export interface IArmyListItem {
  name: string;
  armiesOfRenown: ArmyOfRenownListItem[];
  legends: boolean;
}

export class ArmyListItem {
  name: string;
  armiesOfRenown: ArmyOfRenownListItem[];
  legends: boolean;

  constructor(data?: Partial<IArmyListItem>) {
    this.name = data?.name ?? '';
    this.armiesOfRenown = data?.armiesOfRenown ?? [];
    this.legends = data?.legends ?? false;
  }
}

// TODO: we're assuming only 1 game mode ghb 2025-06, later we'll want to support multiple game modes
// General object to store everything related to the game data
export interface IGame {
  battleTacticCards: BattleTacticCard[];
  // weapon ability to the rule description
  weaponAbilityDescriptions: Map<string, string>;
  // some keywords grant abilities like fly, ward.
  keywordAbilities: Map<string, Ability>;

  units: Map<string, Unit>;
  universalManifestationLores: Map<string, Lore>;

  armies: Map<string, Army>;
  armyList: Map<GrandAlliance, IArmyListItem[]>; // list of army names by grand alliance

  regimentsOfRenown: Map<string, RegimentOfRenown>;
}

export class Game implements IGame {
  battleTacticCards: BattleTacticCard[] = [];
  weaponAbilityDescriptions: Map<string, string> = new Map();
  keywordAbilities: Map<string, Ability> = new Map();

  units: Map<string, Unit> = new Map();
  universalManifestationLores: Map<string, Lore> = new Map();
  armies: Map<string, Army> = new Map();
  armyList: Map<GrandAlliance, IArmyListItem[]> = new Map();

  regimentsOfRenown: Map<string, RegimentOfRenown> = new Map();
}
