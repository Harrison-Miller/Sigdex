import type { Ability } from './Ability';
import type { Unit } from './UnitData';

export class Army {
  units: Unit[];
  artifacts: Map<string, Ability[]>;
  heroicTraits: Map<string, Ability[]> = new Map();
  constructor(
    units: Unit[],
    artifacts: Map<string, Ability[]> = new Map(),
    heroicTraits: Map<string, Ability[]> = new Map()
  ) {
    this.units = units;
    this.artifacts = artifacts;
    this.heroicTraits = heroicTraits;
  }
}
