import type { Army } from '../common/ArmyData';
import type { List } from '../common/ListData';

const STORAGE_KEY = 'sigdex_lists';

export function createList(list: List): void {
  const lists = getAllLists();
  lists.push(list);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function getAllLists(): List[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as List[];
  } catch {
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function deleteList(name: string): void {
  const lists = getAllLists().filter((l) => l.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

/**
 * Calculates the total points for a list by summing the points of all units in all regiments (including leaders),
 * using the provided army data. Units not found in the army data are ignored.
 * @param list The list to calculate points for
 * @param army The loaded Army data (from loadArmy)
 * @param lores The loaded lores data (from loadLores) [currently unused, but included for future lore-based points]
 * @returns The total points for the list
 */
export function calculatePoints(list: List, army: Army, _lores?: Map<string, any>): number {
  if (!list || !army) return 0;
  let total = 0;
  const allUnits = army.units || [];
  // Helper to find a unit's points by name
  const getPoints = (name: string): number => {
    const unit = allUnits.find((u) => u.name === name);
    return unit && typeof unit.points === 'number' ? unit.points : 0;
  };
  for (const regiment of list.regiments) {
    if (regiment.leader) {
      total += getPoints(regiment.leader.name);
    }
    for (const unit of regiment.units) {
      total += getPoints(unit.name);
    }
  }
  // Optionally, add points for auxiallary_units if present
  if (list.auxiallary_units) {
    for (const unit of list.auxiallary_units) {
      total += getPoints(unit.name);
    }
  }
  // TODO: Add points for selected lores if needed in the future
  return total;
}
