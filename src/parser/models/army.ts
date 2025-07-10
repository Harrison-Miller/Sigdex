import type { IAbility } from './ability';
import type { IBattleProfile } from './battleProfile';
import type { ILore } from './lore';
import { UnitCategories, type UnitCategory } from './unit';

export type GrandAlliance = 'Order' | 'Chaos' | 'Death' | 'Destruction';

export interface IEnhancement {
  points: number; // points cost of the enhancement
  ability: IAbility;
}

export interface IEnhancementTable {
  name: string;
  enhancements: IEnhancement[];
}

export interface IUnitListItem {
  name: string;
  points: number;
}

export interface IArmy {
  name: string;
  grandAlliance: GrandAlliance; // probably computed by looking up the keywords of the first unit in battleProfiles

  battleTraits: IAbility[];
  formations: Map<string, IAbility[]>; // a formation may have more than one ability

  artifacts: Map<string, IEnhancementTable>; // there can be multiple artifact tables
  heroicTraits: Map<string, IEnhancementTable>; // there can be multiple heroic trait tables

  // other enhancement tables like "Monstrous Traits"
  enhancements: Map<string, IEnhancementTable>;

  spellLores: Map<string, ILore>;
  prayerLores: Map<string, ILore>;
  manifestationLores: Map<string, ILore>;

  battleProfiles: Map<string, IBattleProfile>;

  regimentsOfRenown: string[]; // names of regiments of renown this army can use

  isArmyOfRenown: boolean; // if this army is an army of renown
  baseArmyName: string; // the name of the base army this army is based on, if applicable
  armiesOfRenown: string[]; // names of armies of renown related to this army

  // convience for UI
  unitList: Map<UnitCategory, IUnitListItem[]>; // list of units in the army with their points by category
}

export class Army implements IArmy {
  name: string;
  grandAlliance: GrandAlliance;

  battleTraits: IAbility[];
  formations: Map<string, IAbility[]>;

  artifacts: Map<string, IEnhancementTable>;
  heroicTraits: Map<string, IEnhancementTable>;

  enhancements: Map<string, IEnhancementTable>;

  spellLores: Map<string, ILore>;
  prayerLores: Map<string, ILore>;
  manifestationLores: Map<string, ILore>;

  battleProfiles: Map<string, IBattleProfile>;

  regimentsOfRenown: string[];

  isArmyOfRenown: boolean;
  baseArmyName: string;
  armiesOfRenown: string[];

  unitList: Map<UnitCategory, IUnitListItem[]> = new Map();

  constructor(data?: Partial<IArmy>) {
    this.name = data?.name || '';
    this.battleProfiles = data?.battleProfiles || new Map();
    this.grandAlliance = data?.grandAlliance || 'Order'; // default to order if not specified

    this.battleTraits = data?.battleTraits || [];
    this.formations = data?.formations || new Map();

    this.artifacts = data?.artifacts || new Map();
    this.heroicTraits = data?.heroicTraits || new Map();

    this.enhancements = data?.enhancements || new Map();

    this.spellLores = data?.spellLores || new Map();
    this.prayerLores = data?.prayerLores || new Map();
    this.manifestationLores = data?.manifestationLores || new Map();

    this.regimentsOfRenown = data?.regimentsOfRenown || [];

    this.armiesOfRenown = data?.armiesOfRenown || []; // this will be computed elsewhere

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
    for (const cat of UnitCategories) {
      this.unitList.set(cat, []);
    }

    for (const [name, profile] of this.battleProfiles.entries()) {
      const unitCategory = profile.category || 'OTHER'; // default to 'OTHER' if no category is specified
      const points = profile.points || 0; // default to 0 if no points are specified

      if (this.unitList.has(unitCategory)) {
        this.unitList.get(unitCategory)?.push({ name, points });
      } else {
        this.unitList.set(unitCategory, [{ name, points }]);
      }
    }
  }
}
