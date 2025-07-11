import type { UnitCategory } from './unit';

export interface IRegimentOption {
  name: string; // the keyword, category or name of a thing that can be taken in the regiment
  max: number; // the maximum number of this option that can be taken in the regiment (0 means any)
  min: number; // the minimum number of this option that must be taken in the regiment (0 means none required)
}

// A battle profile describes a unit's configuration in a specific army.
export interface IBattleProfile {
  name: string; // the name of unit, this will be the same as the unit.

  // this is duplicate info but will be useful so we don't have to look up the unit for sorting
  // and filtering.
  category: UnitCategory;
  keywords: string[]; // also duplicate info, but useful for sorting and filtering.

  points: number;
  reinforceable: boolean;

  // the names of enhancement tables that this unit can use.
  enhancementTables: string[];

  // if this unit is a companion unit, this will be the name of the leader that must lead the regiment this unit is in.
  companionLeader: string;
  // if this unit is the leader of companion units, this will be the names of the companion units that must be taken with this leader.
  companionUnits: string[];

  regimentTags: string[]; // tags that this unit has like: "Moonclan Agitator" or compound keywords like "Moonclan Infantry"
  regimentOptions: IRegimentOption[]; // other regiment options. It may be important to double check what ends up here to see if a unit is a Hero and should be moved to subHeroOptions and set to max: 1.

  isUndersize: boolean; // true if this is an undersize unit, false otherwise
  // the condition to take this undersize unit, e.g For each Knight-Draconis you may take 1 Stormdrake Guard (1 model)
  undersizeCondition: string;

  // TODO: probably have boolean flags for: must be in list, must be general, may not be general.
}

export class BattleProfile implements IBattleProfile {
  name: string;
  category: UnitCategory;
  keywords: string[];
  points: number;
  reinforceable: boolean;

  enhancementTables: string[];
  companionLeader: string;
  companionUnits: string[];

  regimentTags: string[];
  regimentOptions: IRegimentOption[];

  isUndersize: boolean;
  undersizeCondition: string;

  constructor(profile?: Partial<IBattleProfile>) {
    this.name = profile?.name ?? '';
    this.category = profile?.category ?? 'OTHER';
    this.keywords = profile?.keywords ?? [];
    this.points = profile?.points ?? 0;
    this.reinforceable = profile?.reinforceable ?? false;

    this.enhancementTables = profile?.enhancementTables ?? [];
    this.companionLeader = profile?.companionLeader ?? '';
    this.companionUnits = profile?.companionUnits ?? [];

    this.regimentTags = profile?.regimentTags ?? [];
    this.regimentOptions = profile?.regimentOptions ?? [];

    this.isUndersize = profile?.isUndersize ?? false;
    this.undersizeCondition = profile?.undersizeCondition ?? '';
  }

  hasKeyword(keyword: string): boolean {
    if (!keyword) return false;
    return this.keywords.some((k) => k.toLowerCase() === keyword.toLowerCase());
  }

  matchesRegimentOption(optName: string): boolean {
    const lOptName = optName.toLowerCase();
    const name = this.name.toLowerCase();
    const category = this.category.toLowerCase();
    const keywords = (this.keywords || []).map((k) => k.toLowerCase());
    const tags = (this.regimentTags || []).map((t) => t.toLowerCase());

    // special case where optName is a multi keyword
    if (lOptName.includes(' ')) {
      const parts = lOptName.split(/\s+/);
      if (parts.every((part: string) => keywords.includes(part))) return true;
    }
    return (
      name === lOptName ||
      category === lOptName ||
      keywords.some((kw) => kw === lOptName) ||
      tags.some((tag) => tag === lOptName)
    );
  }
}
