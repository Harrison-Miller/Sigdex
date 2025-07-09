import type { IArmy, IUnitListItem } from '../parser/v3/models/army';
import type { ILore } from '../parser/v3/models/lore';
import type { List, ListRegiment } from '../common/ListData';
import { serializeListUnit, deserializeListUnit } from '../common/ArrayData';
import type { ListUnitWeaponOption } from '../common/ListData';
import type { WeaponOption } from '../common/UnitData';
import type { IUnit } from '../parser/v3/models/unit';

const STORAGE_PREFIX = 'sigdex_list:';

export function createList(list: List): string {
  // always generate a new id
  list.id = Math.random().toString(36).slice(2, 10);
  localStorage.setItem(STORAGE_PREFIX + list.id, JSON.stringify(serializeList(list)));
  return list.id;
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

/**
 * Creates a new List with default options for the given army.
 * Picks the first available formation, first free (0 pts) faction terrain, and first free spell/prayer/manifestation lore.
 * @param army The IArmy to use for defaults
 * @param unitList Optional: Map<string, IUnit[]> (category to units) for terrain selection
 */
export function setListDefaultOptions(list: List, army: IArmy): void {
  if (list.regiments.length === 0) {
    list.regiments = [
      {
        leader: { name: '' },
        units: [],
      },
    ];
  }

  if (list.battle_tactics.length === 0) {
    list.battle_tactics = ['', ''];
  }
  if (!list.auxiliary_units) {
    list.auxiliary_units = [];
  }

  // Formation
  if (list.formation === '' && army.formations.size > 0) {
    list.formation = Array.from(army.formations.keys())[0];
  }

  // Faction Terrain (first free/0pt terrain)
  if (
    (!list.faction_terrain || list.faction_terrain === '') &&
    army.unitList.has('FACTION TERRAIN')
  ) {
    let terrains: IUnitListItem[] = [];
    terrains = army.unitList.get('FACTION TERRAIN') || [];
    const freeTerrain = terrains.find((u) => u.points === 0);
    if (freeTerrain) {
      list.faction_terrain = freeTerrain.name;
    }
  }

  // Spell Lore
  if ((!list.spell_lore || list.spell_lore === '') && army.spellLores && army.spellLores.size > 0) {
    const freeSpellLore = Array.from(army.spellLores.values()).find((l: ILore) => l.points === 0);
    if (freeSpellLore) {
      list.spell_lore = freeSpellLore.name;
    }
  }

  // Prayer Lore
  if (
    (!list.prayer_lore || list.prayer_lore === '') &&
    army.prayerLores &&
    army.prayerLores.size > 0
  ) {
    const freePrayerLore = Array.from(army.prayerLores.values()).find((l: ILore) => l.points === 0);
    if (freePrayerLore) {
      list.prayer_lore = freePrayerLore.name;
    }
  }

  // Manifestation Lore
  if (
    (!list.manifestation_lore || list.manifestation_lore === '') &&
    army.manifestationLores &&
    army.manifestationLores.size > 0
  ) {
    const freeManifestationLore = Array.from(army.manifestationLores.values()).find(
      (l: ILore) => l.points === 0
    );
    if (freeManifestationLore) {
      list.manifestation_lore = freeManifestationLore.name;
    }
  }

  list.setup = true;
}

export function setupDefaultWeaponOptions(unit: IUnit): Map<string, ListUnitWeaponOption[]> {
  const result = new Map<string, ListUnitWeaponOption[]>();
  for (const [modelName, model] of unit.models) {
    const arr: ListUnitWeaponOption[] = [];
    // Optional weapons (with max)
    for (const [_, w] of model.weapons || []) {
      if (w.type === 'optional' && w.max > 0) {
        arr.push({ name: w.name, count: w.max });
      }
    }
    // Grouped weapons: select first in each group
    const groupMap: Record<string, WeaponOption[]> = {};
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
