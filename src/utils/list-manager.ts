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

export function clearAllLists(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Calculates the total points for a list by summing the points of all units in all regiments (including leaders),
 * using the provided army data. Units not found in the army data are ignored.
 * @param list The list to calculate points for
 * @param army The loaded Army data (from loadArmy)
 * @param lores The loaded lores data (from loadLores) [currently unused, but included for future lore-based points]
 * @returns The total points for the list
 */
export function calculatePoints(
  list: List,
  army: Army,
  lores?: Map<string, import('../common/ManifestationData').Lore>
): number {
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
      let unitPoints = getPoints(unit.name);
      // Check if reinforced (AoS convention: reinforced property true means double points)
      if (unit.reinforced) {
        unitPoints *= 2;
      }
      total += unitPoints;
    }
  }
  // Optionally, add points for auxiallary_units if present
  if (list.auxiallary_units) {
    for (const unit of list.auxiallary_units) {
      let unitPoints = getPoints(unit.name);
      if (unit.reinforced) {
        unitPoints *= 2;
      }
      total += unitPoints;
    }
  }
  // Add points for faction terrain if present
  if (list.faction_terrain) {
    total += getPoints(list.faction_terrain);
  }
  // Add points for spell lore if present
  if (army.spellLores && Array.isArray(army.spellLores)) {
    if (list.spell_lore) {
      const spellLore = army.spellLores.find((l: any) => l.name === list.spell_lore);
      if (spellLore && typeof spellLore.points === 'number') {
        total += spellLore.points;
      }
    }
  }
  // Add points for prayer lore if present
  if (army.prayerLores && Array.isArray(army.prayerLores)) {
    if (list.prayer_lore) {
      const prayerLore = army.prayerLores.find((l: any) => l.name === list.prayer_lore);
      if (prayerLore && typeof prayerLore.points === 'number') {
        total += prayerLore.points;
      }
    }
  }
  // Add points for manifestation lore if present, using lores Map
  if (list.manifestation_lore && lores) {
    const lore = lores.get(list.manifestation_lore);
    if (lore && typeof lore.points === 'number') {
      total += lore.points;
    }
  }
  return total;
}

/**
 * Checks for list-building violations and returns a list of error messages.
 * @param list The list to check
 * @param army The loaded Army data
 * @param lores The loaded lores data
 * @returns Array of violation strings
 */
export function calculateViolations(
  list: List,
  army: Army,
  lores?: Map<string, import('../common/ManifestationData').Lore>
): string[] {
  const violations: string[] = [];
  // 1. Points cap
  const points = calculatePoints(list, army, lores);
  if (points > 2000) {
    violations.push('List exceeds 2000 points.');
  }
  // 2. General selection
  let generalCount = 0;
  for (const regiment of list.regiments) {
    if (regiment.leader && regiment.leader.general) generalCount++;
    for (const unit of regiment.units) {
      if (unit.general) generalCount++;
    }
  }
  if (generalCount === 0) {
    violations.push('No general selected.');
  } else if (generalCount > 1) {
    violations.push('More than one general selected.');
  }
  // 3. Regiment count
  if (list.regiments.length > 5) {
    violations.push('More than 5 regiments in the list.');
  }
  // 4. Warmaster general rule
  // Find all units in the list with the 'Warmaster' keyword
  const warmasterUnits: { name: string; isGeneral: boolean }[] = [];
  for (const regiment of list.regiments) {
    // Check leader
    if (regiment.leader && regiment.leader.name) {
      const armyUnit = army.units.find((u) => u.name === regiment.leader.name);
      if (
        armyUnit &&
        armyUnit.keywords &&
        armyUnit.keywords.some((k) => k.toLowerCase() === 'warmaster')
      ) {
        warmasterUnits.push({ name: regiment.leader.name, isGeneral: !!regiment.leader.general });
      }
    }
    // Check units
    for (const unit of regiment.units) {
      const armyUnit = army.units.find((u) => u.name === unit.name);
      if (
        armyUnit &&
        armyUnit.keywords &&
        armyUnit.keywords.some((k) => k.toLowerCase() === 'warmaster')
      ) {
        warmasterUnits.push({ name: unit.name, isGeneral: !!unit.general });
      }
    }
  }
  if (warmasterUnits.length > 0 && !warmasterUnits.some((u) => u.isGeneral)) {
    violations.push('At least one Warmaster must be marked as general.');
  }
  // 5. No more than 4 units in a regiment if the leader is the general, otherwise max 3
  for (const regiment of list.regiments) {
    const isLeaderGeneral = !!regiment.leader && !!regiment.leader.general;
    const maxUnits = isLeaderGeneral ? 4 : 3;
    if (regiment.units.length > maxUnits) {
      violations.push(
        `No more than ${maxUnits} units in a regiment${isLeaderGeneral ? ' (if the leader is the general)' : ''}.`
      );
    }
  }
  // 6. Regiment leader must have the hero category
  for (const regiment of list.regiments) {
    if (regiment.leader && regiment.leader.name) {
      const armyUnit = army.units.find((u) => u.name === regiment.leader.name);
      if (!armyUnit || !armyUnit.keywords.some((k) => k.toLowerCase() === 'hero')) {
        violations.push('Regiment leader must have the Hero category.');
      }
    }
  }
  // 7. No duplicates of the same unit with the unique keyword in the list
  const uniqueUnits: Record<string, number> = {};
  for (const regiment of list.regiments) {
    // Check leader
    if (regiment.leader && regiment.leader.name) {
      const armyUnit = army.units.find((u) => u.name === regiment.leader.name);
      if (armyUnit && armyUnit.keywords.some((k) => k.toLowerCase() === 'unique')) {
        uniqueUnits[regiment.leader.name] = (uniqueUnits[regiment.leader.name] || 0) + 1;
      }
    }
    // Check units
    for (const unit of regiment.units) {
      const armyUnit = army.units.find((u) => u.name === unit.name);
      if (armyUnit && armyUnit.keywords.some((k) => k.toLowerCase() === 'unique')) {
        uniqueUnits[unit.name] = (uniqueUnits[unit.name] || 0) + 1;
      }
    }
  }
  for (const [name, count] of Object.entries(uniqueUnits)) {
    if (count > 1) {
      violations.push(`Duplicate unique unit: ${name}`);
    }
  }
  // 8. Only units with notReinforcable=false and unit_size > 1 can be reinforced
  for (const regiment of list.regiments) {
    for (const unit of regiment.units) {
      if (unit.reinforced) {
        const armyUnit = army.units.find((u) => u.name === unit.name);
        if (!armyUnit || armyUnit.notReinforcable || (armyUnit.unit_size ?? 1) <= 1) {
          violations.push(`Unit ${unit.name} cannot be reinforced.`);
        }
      }
    }
  }
  return violations;
}
