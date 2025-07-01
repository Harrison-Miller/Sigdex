import type { Army } from '../common/ArmyData';
import type { List } from '../common/ListData';
import { serializeListUnit, deserializeListUnit } from '../common/ArrayData';
import type { ListUnitWeaponOption } from '../common/ListData';
import type { WeaponOption } from '../common/UnitData';

const STORAGE_KEY = 'sigdex_lists';

export function createList(list: List): void {
  const lists = getAllLists();
  lists.push(list);
  // Always serialize all lists before saving
  const serializeRegiment = (reg: any) => ({
    leader: serializeListUnit(reg.leader),
    units: reg.units.map(serializeListUnit),
  });
  const serializeList = (l: List) => ({
    ...l,
    regiments: l.regiments.map(serializeRegiment),
    auxiallary_units: l.auxiallary_units?.map(serializeListUnit),
  });
  const serializedLists = lists.map(serializeList);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedLists));
}

export function getAllLists(): List[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as any[];
    // Deserialize weapon_options for each unit
    return arr.map((list) => ({
      ...list,
      regiments: list.regiments.map((reg: any) => ({
        leader: deserializeListUnit(reg.leader),
        units: reg.units.map(deserializeListUnit),
      })),
      auxiallary_units: list.auxiallary_units?.map(deserializeListUnit),
    }));
  } catch (e) {
    return [];
  }
}

export function saveList(list: List): void {
  const lists = getAllLists();
  const idx = lists.findIndex((l) => l.name === list.name);
  if (idx !== -1) {
    lists[idx] = list;
  } else {
    lists.push(list);
  }
  // Always serialize all lists before saving
  const serializeRegiment = (reg: any) => ({
    leader: serializeListUnit(reg.leader),
    units: reg.units.map(serializeListUnit),
  });
  const serializeList = (l: List) => ({
    ...l,
    regiments: l.regiments.map(serializeRegiment),
    auxiallary_units: l.auxiallary_units?.map(serializeListUnit),
  });
  const serializedLists = lists.map(serializeList);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedLists));
}

export function deleteList(name: string): void {
  const lists = getAllLists().filter((l) => l.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function clearAllLists(): void {
  localStorage.removeItem(STORAGE_KEY);
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
        arr.push({ name: groupMap[groupKey][0].name });
      }
    }
    if (arr.length > 0) result.set(group.name, arr);
  }
  return result;
}
