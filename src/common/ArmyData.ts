import type { Ability } from './Ability';
import type { Unit } from './UnitData';

export class Army {
  units: Unit[];
  artifacts: Map<string, Ability[]>;
  heroicTraits: Map<string, Ability[]> = new Map();

  manifestationLores: string[] = [];
  spellLores: string[] = [];
  prayerLores: string[] = [];
  battleTraits: Ability[] = [];
  formations: Map<string, Ability[]> = new Map();

  constructor(
    units: Unit[],
    artifacts: Map<string, Ability[]> = new Map(),
    heroicTraits: Map<string, Ability[]> = new Map(),
    manifestationLores: string[] = [],
    spellLores: string[] = [],
    prayerLores: string[] = [],
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
