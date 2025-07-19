import { Ability } from './ability';
import type { BattleProfile } from './battleProfile';
import type { Lore } from './lore';
import { UnitCategoriesOrder, type UnitCategory } from './unit';

export type GrandAlliance = 'Order' | 'Chaos' | 'Death' | 'Destruction';

export interface IEnhancement {
  points: number; // points cost of the enhancement
  ability: Ability;
}

export class Enhancement implements IEnhancement {
  points: number;
  ability: Ability;

  constructor(data?: Partial<IEnhancement>) {
    this.points = data?.points ?? 0;
    this.ability = data?.ability ?? new Ability();
  }
}

export interface IEnhancementTable {
  name: string;
  enhancements: Enhancement[];
}

export class EnhancementTable implements IEnhancementTable {
  name: string;
  enhancements: Enhancement[];

  constructor(data?: Partial<IEnhancementTable>) {
    this.name = data?.name ?? '';
    this.enhancements = data?.enhancements ?? [];
  }
}

export interface IUnitListItem {
  name: string;
  points: number;
}

export interface IArmy {
  revision: string;
  name: string;
  grandAlliance: GrandAlliance; // probably computed by looking up the keywords of the first unit in battleProfiles

  battleTraitNotes: string[]; // notes for battle traits, if any
  battleTraits: Ability[];
  formations: Map<string, Ability[]>; // a formation may have more than one ability

  artifacts: Map<string, EnhancementTable>; // there can be multiple artifact tables
  heroicTraits: Map<string, EnhancementTable>; // there can be multiple heroic trait tables

  // other enhancement tables like "Monstrous Traits"
  enhancements: Map<string, EnhancementTable>;

  spellLores: Map<string, Lore>;
  prayerLores: Map<string, Lore>;
  manifestationLores: Map<string, Lore>;

  battleProfiles: Map<string, BattleProfile>;

  regimentsOfRenown: string[]; // names of regiments of renown this army can use

  isArmyOfRenown: boolean; // if this army is an army of renown
  baseArmyName: string; // the name of the base army this army is based on, if applicable
  armiesOfRenown: string[]; // names of armies of renown related to this army
  armyKeyword: string; // the aor army keyword, may use it for all armies in the future

  // convience for UI
  unitList: Map<UnitCategory, IUnitListItem[]>; // list of units in the army with their points by category

  // aor restrictions
  requiredGeneral: string[]; // names of units, one of which must be the general
  mustBeGeneralIfIncluded: string[]; // names of units that must be the general if included in the army
}

export class Army implements IArmy {
  revision: string;
  name: string;
  grandAlliance: GrandAlliance;

  battleTraitNotes: string[];
  battleTraits: Ability[];
  formations: Map<string, Ability[]>;

  artifacts: Map<string, EnhancementTable>;
  heroicTraits: Map<string, EnhancementTable>;

  enhancements: Map<string, EnhancementTable>;

  spellLores: Map<string, Lore>;
  prayerLores: Map<string, Lore>;
  manifestationLores: Map<string, Lore>;

  battleProfiles: Map<string, BattleProfile>;

  regimentsOfRenown: string[];

  isArmyOfRenown: boolean;
  baseArmyName: string;
  armiesOfRenown: string[];
  armyKeyword: string;

  unitList: Map<UnitCategory, IUnitListItem[]> = new Map();

  requiredGeneral: string[];
  mustBeGeneralIfIncluded: string[];

  constructor(data?: Partial<IArmy>) {
    this.revision = data?.revision ?? '';
    this.name = data?.name ?? '';
    this.battleProfiles = data?.battleProfiles ?? new Map();
    this.grandAlliance = data?.grandAlliance ?? 'Order'; // default to order if not specified

    this.battleTraitNotes = data?.battleTraitNotes ?? [];
    this.battleTraits = data?.battleTraits ?? [];
    this.formations = data?.formations ?? new Map();

    this.artifacts = data?.artifacts ?? new Map();
    this.heroicTraits = data?.heroicTraits ?? new Map();

    this.enhancements = data?.enhancements ?? new Map();

    this.spellLores = data?.spellLores ?? new Map();
    this.prayerLores = data?.prayerLores ?? new Map();
    this.manifestationLores = data?.manifestationLores ?? new Map();

    this.regimentsOfRenown = data?.regimentsOfRenown ?? [];

    this.armiesOfRenown = data?.armiesOfRenown ?? []; // this will be computed elsewhere

    this.requiredGeneral = data?.requiredGeneral ?? [];
    this.mustBeGeneralIfIncluded = data?.mustBeGeneralIfIncluded ?? [];

    this.armyKeyword = data?.armyKeyword ?? '';

    // determine if this is an army of renown
    const armyParts = this.name.split(' - ');
    if (armyParts.length > 1) {
      this.isArmyOfRenown = true;
      this.baseArmyName = armyParts[0].trim(); // the first part is the base army name
    } else {
      this.isArmyOfRenown = false;
      this.baseArmyName = this.name; // if not an army of renown, the base army is the same as the army name
    }

    // compute the unit list by category
    for (const cat of UnitCategoriesOrder) {
      this.unitList.set(cat, []);
    }

    for (const [name, profile] of this.battleProfiles.entries()) {
      const unitCategory = profile.category || 'OTHER'; // default to 'OTHER' if no category is specified
      const points = profile.points || 0; // default to 0 if no points are specified

      if (profile.isUndersize) continue; // don't want to show undersize units in the unit list

      if (this.unitList.has(unitCategory)) {
        this.unitList.get(unitCategory)?.push({ name, points });
      } else {
        this.unitList.set(unitCategory, [{ name, points }]);
      }
    }
  }

  hasDetails(): boolean {
    return this.battleTraitNotes.length > 0 || this.armyKeyword !== '' ||
      this.requiredGeneral.length > 0 || this.mustBeGeneralIfIncluded.length > 0;
  }
}
