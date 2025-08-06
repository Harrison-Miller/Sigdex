import type { UnitCategory } from './unit';

export interface IRegimentOption {
  min: number; // the minimum number of this option that must be taken in the regiment (0 means none required)
  max: number; // the maximum number of this option that can be taken in the regiment (-1 means any)
  keywords: string[];
  nonKeywords: string[];
  subheroCategories: string[]; // categories that this option can be used as a sub-hero for.
  unitNames: string[]; // the names of the units that this option can be used for.
}

export class RegimentOption implements IRegimentOption {
  min: number;
  max: number;
  keywords: string[];
  nonKeywords: string[];
  subheroCategories: string[];
  unitNames: string[];

  constructor(data?: Partial<IRegimentOption>) {
    this.min = data?.min ?? 0;
    this.max = data?.max ?? 0;
    this.keywords = data?.keywords ?? [];
    this.nonKeywords = data?.nonKeywords ?? [];
    this.subheroCategories = data?.subheroCategories ?? [];
    this.unitNames = data?.unitNames ?? [];
  }

  toString(htmlFormatting: boolean = false): string {
    let amount = '';
    if (this.max === -1) {
      amount = 'Any'
    } else if (this.min === this.max) {
      amount = `${this.min}`;
    } else {
      amount = `${this.min}-${this.max}`;
    }

    const descriptions = [];

    const smallCapsFormatter = (text: string) => {
      if (!htmlFormatting) return text;
      return `<b><span style="font-variant: small-caps;">${text}</span></b>`;
    };

    const boldFormatter = (text: string) => {
      if (!htmlFormatting) return text;
      return `<b>${text}</b>`;
    };

    const keywordDescriptions: string[] = [];
    this.nonKeywords.forEach((kw) => {
      keywordDescriptions.push(`non-${smallCapsFormatter(kw)}`);
    });
    this.keywords.forEach((kw) => {
      keywordDescriptions.push(smallCapsFormatter(kw));
    });

    if (keywordDescriptions.length > 0) {
      descriptions.push(`${keywordDescriptions.join(' ')}`);
    }

    this.subheroCategories.forEach((cat) => {
      descriptions.push(boldFormatter(cat));
    });

    this.unitNames.forEach((name) => {
      descriptions.push(boldFormatter(name));
    });

    if (htmlFormatting) {
      return `<i>${amount} ${descriptions.join(' or ')}</i>`;
    }

    return `${amount} ${descriptions.join(' or ')}`;
  }

  equals(other: RegimentOption) {
    if (!other) return false;
    const arraysEqual = (a: string[], b: string[]) =>
      a.length === b.length && a.every((v) => b.includes(v));
    return (
      this.min === other.min &&
      this.max === other.max &&
      arraysEqual(this.keywords, other.keywords) &&
      arraysEqual(this.nonKeywords, other.nonKeywords) &&
      arraysEqual(this.subheroCategories, other.subheroCategories) &&
      arraysEqual(this.unitNames, other.unitNames)
    );
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

  matchesRegimentOption(opts: RegimentOption): boolean {
    if (!opts) return false;
    const hasAllKeywords = opts.keywords.every((kw) => this.hasKeyword(kw)) && opts.keywords.length > 0;
    const hasSomeNonKeywords = opts.nonKeywords.some((kw) => this.hasKeyword(kw));
    const hasSomeSubheroCategory = opts.subheroCategories.some((cat) =>
      this.regimentTags.includes(cat)
    );
    const hasSomeUnitName = opts.unitNames.includes(this.name);
    return (hasAllKeywords || hasSomeSubheroCategory || hasSomeUnitName) && !hasSomeNonKeywords;
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
