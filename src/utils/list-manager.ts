import type { Army } from '../common/ArmyData';
import type { List, ListRegiment } from '../common/ListData';
import { serializeListUnit, deserializeListUnit } from '../common/ArrayData';
import type { ListUnitWeaponOption } from '../common/ListData';
import type { WeaponOption } from '../common/UnitData';

const OLD_STORAGE_KEY = 'sigdex_list';
const STORAGE_PREFIX = 'sigdex_list:';

export function createList(list: List): void {
  // always generate a new id
  list.id = Math.random().toString(36).slice(2, 10);
  localStorage.setItem(STORAGE_PREFIX + list.id, JSON.stringify(serializeList(list)));
}

export function getAllLists(): List[] {
  const lists: List[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const list = JSON.parse(raw);
        lists.push({
          ...list,
          regiments: list.regiments.map((reg: any) => ({
            leader: deserializeListUnit(reg.leader),
            units: reg.units.map(deserializeListUnit),
          })),
          auxiliary_units: list.auxiliary_units?.map(deserializeListUnit),
        });
      } catch (e) {
        // skip corrupted
      }
    }
  }
  return lists;
}

export function getList(id: string): List | undefined {
  const raw = localStorage.getItem(STORAGE_PREFIX + id);
  if (!raw) return undefined;
  try {
    const list = JSON.parse(raw);
    return {
      ...list,
      regiments: list.regiments.map((reg: any) => ({
        leader: deserializeListUnit(reg.leader),
        units: reg.units.map(deserializeListUnit),
      })),
      auxiliary_units: list.auxiliary_units?.map(deserializeListUnit),
    };
  } catch (e) {
    return undefined;
  }
}

export function renameList(id: string, newName: string): void {
  const list = getList(id);
  if (!list) return;
  list.name = newName;
  saveList(list);
}

export function saveList(list: List): void {
  if (!list.id) throw new Error('List must have an id');
  localStorage.setItem(STORAGE_PREFIX + list.id, JSON.stringify(serializeList(list)));
}

export function deleteList(id: string): void {
  localStorage.removeItem(STORAGE_PREFIX + id);
}

export function clearAllLists(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }

  // also clear old storage key
  localStorage.removeItem(OLD_STORAGE_KEY);
}

function serializeRegiment(regiment: ListRegiment): any {
  return {
    leader: serializeListUnit(regiment.leader),
    units: regiment.units.map(serializeListUnit),
  };
}

function serializeList(list: List): any {
  return {
    ...list,
    regiments: list.regiments.map(serializeRegiment),
    auxiliary_units: list.auxiliary_units?.map(serializeListUnit),
  };
}

export function setupDefaultWeaponOptions(
  unitName: string,
  army: Army
): Map<string, ListUnitWeaponOption[]> {
  const result = new Map<string, ListUnitWeaponOption[]>();
  const armyUnit = army.units.find((u) => u.name === unitName);
  if (!armyUnit || !armyUnit.models) return result;
  for (const group of armyUnit.models) {
    const arr: ListUnitWeaponOption[] = [];
    // Optional weapons (with max)
    for (const w of group.weapons || []) {
      if (w.max && !w.group) {
        arr.push({ name: w.name, count: w.max });
      }
    }
    // Grouped weapons: select first in each group
    const groupMap: Record<string, WeaponOption[]> = {};
    for (const w of group.weapons || []) {
      if (w.group) {
        if (!groupMap[w.group]) groupMap[w.group] = [];
        groupMap[w.group].push(w);
      }
    }
    for (const groupKey in groupMap) {
      if (groupMap[groupKey].length > 0) {
        arr.push({ name: groupMap[groupKey][0].name, count: group.count });
      }
    }
    if (arr.length > 0) result.set(group.name, arr);
  }
  return result;
}

export function setupDefaultEnhancements(unitName: string, army: Army): Map<string, string> {
  const result = new Map<string, string>();
  const armyUnit = army.units.find((u) => u.name === unitName);
  if (!armyUnit || !armyUnit.enhancement_tables) return result;

  // Initialize empty map - user will select enhancements manually
  // We don't pre-select any enhancements as they are optional choices
  return result;
}
