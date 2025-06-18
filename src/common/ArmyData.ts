import type { Ability } from './Ability';
import type { Unit } from './UnitData';

export class Army {
  units: Unit[];
  artifacts: Map<string, Ability[]>;
  heroicTraits: Map<string, Ability[]> = new Map();

  manifestationLores: string[] = [];
  spellLores: string[] = [];
  prayerLores: string[] = [];

  constructor(
    units: Unit[],
    artifacts: Map<string, Ability[]> = new Map(),
    heroicTraits: Map<string, Ability[]> = new Map(),
    manifestationLores: string[] = [],
    spellLores: string[] = [],
    prayerLores: string[] = []
  ) {
    this.units = units;
    this.artifacts = artifacts;
    this.heroicTraits = heroicTraits;
    this.manifestationLores = manifestationLores;
    this.spellLores = spellLores;
    this.prayerLores = prayerLores;
  }

  toJSON() {
    return {
      units: this.units,
      artifacts: Array.from(this.artifacts.entries()),
      heroicTraits: Array.from(this.heroicTraits.entries()),
      manifestationLores: this.manifestationLores,
      spellLores: this.spellLores,
      prayerLores: this.prayerLores,
    };
  }

  static fromJson(obj: any): Army {
    return new Army(
      obj.units,
      obj.artifacts instanceof Map ? obj.artifacts : new Map(obj.artifacts),
      obj.heroicTraits instanceof Map ? obj.heroicTraits : new Map(obj.heroicTraits),
      obj.manifestationLores,
      obj.spellLores,
      obj.prayerLores
    );
  }
}
