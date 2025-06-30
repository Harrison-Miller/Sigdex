import type { Army } from '../common/ArmyData';
import type { List } from '../common/ListData';
import { serializeListUnit, deserializeListUnit } from '../common/ArrayData';
import type { ListUnitWeaponOption } from '../common/ListData';
import type { WeaponOption } from '../common/UnitData';
import type { ListUnit } from '../common/ListData';

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
  // eslint-disable-next-line no-console
  console.log('createList: saving lists', JSON.stringify(serializedLists, null, 2));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedLists));
}

export function getAllLists(): List[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  // eslint-disable-next-line no-console
  console.log('getAllLists: raw from storage', raw);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as any[];
    // Debug: log what is being loaded
    // eslint-disable-next-line no-console
    console.log('getAllLists: parsed array', arr);
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
    // eslint-disable-next-line no-console
    console.error('getAllLists: failed to parse', e);
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
  // 9. Weapon option violations
  for (const regiment of list.regiments) {
    if (regiment.leader) {
      const leaderViolations = calculateWeaponOptionViolations(regiment.leader, army);
      violations.push(...leaderViolations);
    }
    for (const unit of regiment.units) {
      const unitViolations = calculateWeaponOptionViolations(unit, army);
      violations.push(...unitViolations);
    }
  }
  // 10. Every regiment must have a leader assigned
  for (const [i, regiment] of list.regiments.entries()) {
    if (!regiment.leader || !regiment.leader.name) {
      violations.push(`Regiment ${i + 1} does not have a leader assigned.`);
    }
  }
  // 11. All units must be present in ArmyData
  for (const [i, regiment] of list.regiments.entries()) {
    if (regiment.leader && regiment.leader.name) {
      const found = army.units.find((u) => u.name === regiment.leader.name);
      if (!found) {
        violations.push(
          `Regiment ${i + 1} leader '${regiment.leader.name}' is not present in ArmyData.`
        );
      }
    }
    for (const unit of regiment.units) {
      if (unit && unit.name) {
        const found = army.units.find((u) => u.name === unit.name);
        if (!found) {
          violations.push(`Unit '${unit.name}' in regiment ${i + 1} is not present in ArmyData.`);
        }
      }
    }
  }
  return violations;
}

/**
 * Checks for weapon option violations for a ListUnit.
 * 1. If there is a weapon option that doesn't exist for the given model group
 * 2. If the weapon option has a count higher than the max (the max is doubled when reinforced).
 * 3. If there are multiple selections for a grouped weapon option.
 */
export function calculateWeaponOptionViolations(unit: ListUnit, army: Army): string[] {
  const violations: string[] = [];
  if (!unit.weapon_options || !(unit.weapon_options instanceof Map)) return violations;
  const armyUnit = army.units.find((u) => u.name === unit.name);
  if (!armyUnit || !armyUnit.models) return violations;
  const reinforced = !!unit.reinforced;
  for (const [groupName, options] of unit.weapon_options.entries()) {
    const modelGroup = (armyUnit.models || []).find((g) => g.name === groupName);
    if (!modelGroup) {
      violations.push(`Model group '${groupName}' does not exist for unit '${unit.name}'.`);
      continue;
    }
    const groupWeapons = modelGroup.weapons || [];
    // 1. Check for non-existent weapon options
    for (const opt of options as { name: string; count?: number }[]) {
      const weapon = groupWeapons.find((w) => w.name === opt.name);
      if (!weapon) {
        violations.push(
          `Weapon option '${opt.name}' does not exist in model group '${groupName}' for unit '${unit.name}'.`
        );
        continue;
      }
      // 2. Check for count > max (for optional weapons)
      if (weapon.max && !weapon.group && typeof opt.count === 'number') {
        const effectiveMax = reinforced ? weapon.max * 2 : weapon.max;
        if (opt.count > effectiveMax) {
          violations.push(
            `Weapon option '${opt.name}' in group '${groupName}' exceeds max (${opt.count} > ${effectiveMax}) for unit '${unit.name}'.`
          );
        }
      }
    }
    // 3. Check for multiple selections in grouped weapons
    // For each group, only one selection allowed, and at least one must be selected
    const groupMap: Record<string, string[]> = {};
    for (const w of groupWeapons) {
      if (w.group) {
        if (!groupMap[w.group]) groupMap[w.group] = [];
        // Find if this weapon is selected in options
        if (options.some((opt) => opt.name === w.name && typeof opt.count !== 'number')) {
          groupMap[w.group].push(w.name);
        }
      }
    }
    for (const groupKey in groupMap) {
      if (groupMap[groupKey].length > 1) {
        violations.push(
          `Multiple selections (${groupMap[groupKey].join(', ')}) for weapon group '${groupKey}' in model group '${groupName}' for unit '${unit.name}'.`
        );
      }
      // New rule: must have at least one selection for grouped weapon options
      if (groupMap[groupKey].length === 0) {
        violations.push(
          `No selection for weapon group '${groupKey}' in model group '${groupName}' for unit '${unit.name}'.`
        );
      }
    }
  }
  return violations;
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
