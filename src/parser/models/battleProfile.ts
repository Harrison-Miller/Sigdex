import type { UnitCategory } from './unit';

export interface IRegimentOption {
  // the keywords, categories or names of a thing that can be taken in the regiment
  // if multiple are present they mutually exclusive of each other
  names: string[];
  max: number; // the maximum number of this option that can be taken in the regiment (0 means any)
  min: number; // the minimum number of this option that must be taken in the regiment (0 means none required)
}

export class RegimentOption implements IRegimentOption {
  names: string[];
  max: number;
  min: number;

  constructor(data?: Partial<IRegimentOption>) {
    this.names = data?.names?.sort() ?? [];
    this.max = data?.max ?? 0;
    this.min = data?.min ?? 0;
  }

  optNames(): string {
    return this.names.join(', ');
  }
}

// A battle profile describes a unit's configuration in a specific army.
export interface IBattleProfile {
  name: string; // the name of unit, this will be the same as the unit.

  // this is duplicate info but will be useful so we don't have to look up the unit for sorting
  // and filtering.
  category: UnitCategory;
  keywords: string[]; // also duplicate info, but useful for sorting and filtering.
  legends: boolean;

  points: number;
  reinforceable: boolean;

  // the names of enhancement tables that this unit can use.
  enhancementTables: string[];

  // if this unit is a companion unit, this will be the name of the leader that must lead the regiment this unit is in.
  companionLeader: string;
  // if this unit is the leader of companion units, this will be the names of the companion units that must be taken with this leader.
  companionUnits: string[];

  regimentTags: string[]; // tags that this unit has like: "Moonclan Agitator" or compound keywords like "Moonclan Infantry"
  regimentOptions: RegimentOption[]; // other regiment options. It may be important to double check what ends up here to see if a unit is a Hero and should be moved to subHeroOptions and set to max: 1.

  isUndersize: boolean; // true if this is an undersize unit, false otherwise
  // the condition to take this undersize unit, e.g For each Knight-Draconis you may take 1 Stormdrake Guard (1 model)
  undersizeCondition: string;
}

export class BattleProfile implements IBattleProfile {
  name: string;
  category: UnitCategory;
  keywords: string[];
  legends: boolean;
  points: number;
  reinforceable: boolean;

  enhancementTables: string[];
  companionLeader: string;
  companionUnits: string[];

  regimentTags: string[];
  regimentOptions: RegimentOption[];

  isUndersize: boolean;
  undersizeCondition: string;

  constructor(profile?: Partial<IBattleProfile>) {
    this.name = profile?.name ?? '';
    this.category = profile?.category ?? 'OTHER';
    this.keywords = profile?.keywords ?? [];
    this.legends = profile?.legends ?? false;
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

  matchesRegimentOption(optNames: string[]): boolean {
    const lOptNames = optNames.map((n) => n.toLowerCase());
    const name = this.name.toLowerCase();
    const category = this.category.toLowerCase();
    const keywords = (this.keywords || []).map((k) => k.toLowerCase());
    const tags = (this.regimentTags || []).map((t) => t.toLowerCase());

    for (const lOptName of lOptNames) {
      // special case where optName is a multi keyword
      if (lOptName.includes(' ')) {
        const parts = lOptName.split(/\s+/);
        if (parts.every((part: string) => keywords.includes(part))) return true;
      }
      if (
        name === lOptName ||
        category === lOptName ||
        keywords.some((kw) => kw === lOptName) ||
        tags.some((tag) => tag === lOptName)
      ) {
        return true;
      }
    }
    return false;
  }

  // Many things by default aren't reinforceable, we want to differentiate those from things that are explicitly not reinforceable.
  // technically unit size 1 should be part of the condition, but we don't have that info in the battle profile.
  // these keywords usually mean unit size 1 or not reinforceable.
  defaultNotReinforceable(): boolean {
    return (
      this.keywords.includes('HERO') ||
      this.keywords.includes('MONSTER') ||
      this.keywords.includes('UNIQUE') ||
      this.keywords.includes('WAR MACHINE') ||
      this.keywords.includes('FACTION TERRAIN') ||
      this.category === 'MANIFESTATION'
    );
  }
}
