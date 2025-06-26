import type { Ability } from './Ability';
import type { Unit } from './UnitData';

export type GrandAlliance = 'Order' | 'Chaos' | 'Death' | 'Destruction';

export interface ArmyDefinition {
  name: string;
  grandAlliance: GrandAlliance;
}

export const orderArmies: ArmyDefinition[] = [
  { name: 'Cities of Sigmar', grandAlliance: 'Order' },
  { name: 'Daughters of Khaine', grandAlliance: 'Order' },
  { name: 'Fyreslayers', grandAlliance: 'Order' },
  { name: 'Idoneth Deepkin', grandAlliance: 'Order' },
  { name: 'Kharadron Overlords', grandAlliance: 'Order' },
  { name: 'Lumineth Realm-Lords', grandAlliance: 'Order' },
  { name: 'Seraphon', grandAlliance: 'Order' },
  { name: 'Stormcast Eternals', grandAlliance: 'Order' },
  { name: 'Sylvaneth', grandAlliance: 'Order' },
];

export const chaosArmies: ArmyDefinition[] = [
  { name: 'Beasts of Chaos', grandAlliance: 'Chaos' },
  { name: 'Blades of Khorne', grandAlliance: 'Chaos' },
  { name: 'Disciples of Tzeentch', grandAlliance: 'Chaos' },
  { name: 'Hedonites of Slaanesh', grandAlliance: 'Chaos' },
  { name: 'Maggotkin of Nurgle', grandAlliance: 'Chaos' },
  { name: 'Skaven', grandAlliance: 'Chaos' },
  { name: 'Slaves to Darkness', grandAlliance: 'Chaos' },
];

export const deathArmies: ArmyDefinition[] = [
  { name: 'Flesh-eater Courts', grandAlliance: 'Death' },
  { name: 'Nighthaunt', grandAlliance: 'Death' },
  { name: 'Ossiarch Bonereapers', grandAlliance: 'Death' },
  { name: 'Soulblight Gravelords', grandAlliance: 'Death' },
];

export const destructionArmies: ArmyDefinition[] = [
  { name: 'Bonesplitterz', grandAlliance: 'Destruction' },
  { name: 'Gloomspite Gitz', grandAlliance: 'Destruction' },
  { name: 'Ironjawz', grandAlliance: 'Destruction' },
  { name: 'Kruleboyz', grandAlliance: 'Destruction' },
  { name: 'Ogor Mawtribes', grandAlliance: 'Destruction' },
  { name: 'Sons of Behemat', grandAlliance: 'Destruction' },
];

export const allArmies: ArmyDefinition[] = [
  ...orderArmies,
  ...chaosArmies,
  ...deathArmies,
  ...destructionArmies,
];

export interface ArmyLore {
  name: string;
  points?: number;
}

export class Army {
  units: Unit[];
  artifacts: Map<string, Ability[]>;
  heroicTraits: Map<string, Ability[]> = new Map();

  manifestationLores: ArmyLore[] = [];
  spellLores: ArmyLore[] = [];
  prayerLores: ArmyLore[] = [];
  battleTraits: Ability[] = [];
  formations: Map<string, Ability[]> = new Map();

  constructor(
    units: Unit[],
    artifacts: Map<string, Ability[]> = new Map(),
    heroicTraits: Map<string, Ability[]> = new Map(),
    manifestationLores: ArmyLore[] = [],
    spellLores: ArmyLore[] = [],
    prayerLores: ArmyLore[] = [],
    battleTraits: Ability[] = [],
    formations: Map<string, Ability[]> = new Map()
  ) {
    this.units = units;
    this.artifacts = artifacts;
    this.heroicTraits = heroicTraits;
    this.manifestationLores = manifestationLores;
    this.spellLores = spellLores;
    this.prayerLores = prayerLores;
    this.battleTraits = battleTraits;
    this.formations = formations;
  }

  toJSON() {
    return {
      units: this.units,
      artifacts: Array.from(this.artifacts.entries()),
      heroicTraits: Array.from(this.heroicTraits.entries()),
      manifestationLores: this.manifestationLores,
      spellLores: this.spellLores,
      prayerLores: this.prayerLores,
      battleTraits: this.battleTraits,
      formations: Array.from(this.formations.entries()),
    };
  }

  static fromJson(obj: any): Army {
    return new Army(
      obj.units,
      obj.artifacts instanceof Map ? obj.artifacts : new Map(obj.artifacts),
      obj.heroicTraits instanceof Map ? obj.heroicTraits : new Map(obj.heroicTraits),
      obj.manifestationLores,
      obj.spellLores,
      obj.prayerLores,
      obj.battleTraits,
      obj.formations instanceof Map ? obj.formations : new Map(obj.formations)
    );
  }
}
