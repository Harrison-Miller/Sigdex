import type { UnitCategory } from './unit';

export interface IRegimentOption {
  name: string; // the keyword, category or name of a thing that can be taken in the regiment
  max: number; // the maximum number of this option that can be taken in the regiment (0 means any)
}

// A battle profile describes a unit's configuration in a specific army.
export interface IBattleProfile {
  name: string; // the name of unit, this will be the same as the unit.

  // this is duplicate info but will be useful so we don't have to look up the unit for sorting
  // and filtering.
  category: UnitCategory;

  points: number;
  reinforceable: boolean;

  // the names of enhancement tables that this unit can use.
  enhancementTables: string[];

  // the leader of the companion units (This is the unit in companionUnits list that is a hero and has points).
  companionLeader: string;
  // units that must be taken with this unit
  companionUnits: string[];

  regimentTags: string[]; // tags that this unit has like: "Moonclan Agitator" or compound keywords like "Moonclan Infantry"
  regimentOptions: IRegimentOption[]; // other regiment options. It may be important to double check what ends up here to see if a unit is a Hero and should be moved to subHeroOptions and set to max: 1.

  // the condition to take this undersize unit, e.g For each Knight-Draconis you may take 1 Stormdrake Guard (1 model)
  undersizeCondition: string;

  // TODO: probably have boolean flags for: must be in list, must be general, may not be general.
}

export class BattleProfile implements IBattleProfile {
  name: string;
  category: UnitCategory;
  points: number;
  reinforceable: boolean;

  enhancementTables: string[];
  companionLeader: string;
  companionUnits: string[];

  regimentTags: string[];
  regimentOptions: IRegimentOption[];

  undersizeCondition: string;

  constructor(profile?: Partial<IBattleProfile>) {
    this.name = profile?.name ?? '';
    this.category = profile?.category ?? 'OTHER';
    this.points = profile?.points ?? 0;
    this.reinforceable = profile?.reinforceable ?? false;

    this.enhancementTables = profile?.enhancementTables ?? [];
    this.companionLeader = profile?.companionLeader ?? '';
    this.companionUnits = profile?.companionUnits ?? [];

    this.regimentTags = profile?.regimentTags ?? [];
    this.regimentOptions = profile?.regimentOptions ?? [];

    this.undersizeCondition = profile?.undersizeCondition ?? '';
  }
}
