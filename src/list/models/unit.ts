import type { IUnit } from '../../parser/models/unit';
import type { IWeaponOption } from '../../parser/models/weaponOption';

export interface IListUnit {
  name: string;
  general: boolean;

  heroicTrait: string;
  artifact: string;

  reinforced: boolean;

  weaponOptions: Map<string, IListUnitWeaponOption[]>;

  // enhancement table name to enhancement name (only 1 per table)
  enhancements: Map<string, string>;
}

export interface IListUnitWeaponOption {
  name: string;
  count: number;
}

export class ListUnit implements IListUnit {
  name: string;
  general: boolean;

  heroicTrait: string;
  artifact: string;

  reinforced: boolean;

  weaponOptions: Map<string, IListUnitWeaponOption[]>;

  enhancements: Map<string, string>;

  constructor(data?: Partial<IListUnit>) {
    this.name = data?.name ?? '';
    this.general = data?.general ?? false;
    this.heroicTrait = data?.heroicTrait ?? '';
    this.artifact = data?.artifact ?? '';
    this.reinforced = data?.reinforced ?? false;
    this.weaponOptions = data?.weaponOptions ?? new Map();
    this.enhancements = data?.enhancements ?? new Map();
  }

  getEnhancementCount(): number {
    let count = 0;
    if (this.heroicTrait) count += 1;
    if (this.artifact) count += 1;
    count += this.enhancements.size;
    return count;
  }
}

export function getDefaultWeaponOptions(unit: IUnit): Map<string, IListUnitWeaponOption[]> {
  const result = new Map<string, IListUnitWeaponOption[]>();
  for (const [modelName, model] of unit.models) {
    const arr: IListUnitWeaponOption[] = [];
    // Optional weapons (with max)
    for (const [_, w] of model.weapons || []) {
      if (w.type === 'optional' && w.max > 0) {
        arr.push({ name: w.name, count: w.max });
      }
    }
    // Grouped weapons: select first in each group
    const groupMap: Record<string, IWeaponOption[]> = {};
    for (const [_, w] of model.weapons || []) {
      if (w.type === 'grouped' && w.group) {
        if (!groupMap[w.group]) groupMap[w.group] = [];
        groupMap[w.group].push(w);
      }
    }
    for (const groupKey in groupMap) {
      if (groupMap[groupKey].length > 0) {
        arr.push({ name: groupMap[groupKey][0].name, count: model.count });
      }
    }
    if (arr.length > 0) result.set(modelName, arr);
  }
  return result;
}
