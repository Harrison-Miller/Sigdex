import type { Army } from '../common/ArmyData';
import type { List, ListUnit, ListRegiment } from '../common/ListData';
import type { Lore } from '../common/ManifestationData';
import { calculatePoints } from './points-manager';

/**
 * Checks for undersize unit violations in a list.
 * For each unit with an undersize_condition, you may include 1 of that unit for each of the condition unit.
 * @param list The list to check
 * @param army The loaded Army data
 * @returns Array of violation strings
 */
export function calculateUndersizeUnitViolations(list: List, army: Army): string[] {
  // Map: undersize unit name -> { condition: string, count: number }
  const undersizeMap = new Map<string, { condition: string; count: number }>();
  // Map: condition unit name -> count
  const conditionCountMap = new Map<string, number>();

  // builder undersizeMap
  for (const regiment of list.regiments) {
    for (const unit of regiment.units) {
      const unitData = army.units.find((u) => u.name === unit.name);
      if (unitData && unitData.undersize_condition) {
        undersizeMap.set(unit.name, {
          condition: unitData.undersize_condition,
          count: (undersizeMap.get(unit.name)?.count || 0) + 1,
        });
        conditionCountMap.set(unitData.undersize_condition, 0);
      }
    }
  }
  for (const unit of list.auxiliary_units || []) {
    const unitData = army.units.find((u) => u.name === unit.name);
    if (unitData && unitData.undersize_condition) {
      undersizeMap.set(unit.name, {
        condition: unitData.undersize_condition,
        count: (undersizeMap.get(unit.name)?.count || 0) + 1,
      });
      conditionCountMap.set(unitData.undersize_condition, 0);
    }
  }

  // build conditionCountMap
  for (const regiment of list.regiments) {
    for (const unit of regiment.units) {
      if (conditionCountMap.has(unit.name)) {
        // This unit is a condition unit, increment its count
        conditionCountMap.set(unit.name, (conditionCountMap.get(unit.name) || 0) + 1);
      }
    }
    if (regiment.leader && conditionCountMap.has(regiment.leader.name)) {
      // If the leader is a condition unit, increment its count
      conditionCountMap.set(
        regiment.leader.name,
        (conditionCountMap.get(regiment.leader.name) || 0) + 1
      );
    }
  }

  for (const unit of list.auxiliary_units || []) {
    if (conditionCountMap.has(unit.name)) {
      // This unit is a condition unit, increment its count
      conditionCountMap.set(unit.name, (conditionCountMap.get(unit.name) || 0) + 1);
    }
  }

  // Second pass: for each undersize unit, check if count > allowed
  const violations: string[] = [];
  for (const [undersizeName, info] of undersizeMap.entries()) {
    const allowed = conditionCountMap.get(info.condition) || 0;
    const actual = info.count;
    if (actual > allowed) {
      violations.push(
        `Too many '${undersizeName}' units: only ${allowed} allowed (1 per '${info.condition}').`
      );
    }
  }

  return violations;
}

/**
 * Checks for list-building violations and returns a list of error messages.
 * @param list The list to check
 * @param army The loaded Army data
 * @param lores The loaded lores data
 * @returns Array of violation strings
 */
export function calculateViolations(list: List, army: Army, lores?: Map<string, Lore>): string[] {
  const violations: string[] = [];
  // Unique units cannot take heroic traits, artifacts, or enhancements
  for (const regiment of list.regiments) {
    const allUnits = [regiment.leader, ...regiment.units];
    for (const unit of allUnits) {
      if (!unit || !unit.name) continue;
      const armyUnit = army.units.find((u) => u.name === unit.name);
      if (!armyUnit) continue;
      const isUnique =
        armyUnit.keywords && armyUnit.keywords.some((k) => k.toLowerCase() === 'unique');
      if (isUnique) {
        if (unit.heroic_trait) {
          violations.push(`Unique unit '${unit.name}' cannot have a heroic trait.`);
        }
        if (unit.artifact) {
          violations.push(`Unique unit '${unit.name}' cannot have an artifact.`);
        }
        if (unit.enhancements && unit.enhancements.size > 0) {
          violations.push(`Unique unit '${unit.name}' cannot have enhancements.`);
        }
      }
    }
  }
  // Companion unit violations
  for (const [i, regiment] of list.regiments.entries()) {
    if (!regiment.leader || !regiment.leader.name) continue;
    const leaderUnit = army.units.find((u) => u.name === regiment.leader.name);
    if (!leaderUnit) continue;
    // 1. If a leader with points has companion units, the regiment must contain all those companion units.
    if (leaderUnit.companion_units && leaderUnit.companion_units.length > 0) {
      if (leaderUnit.points && leaderUnit.points > 0) {
        for (const companionName of leaderUnit.companion_units) {
          const found = regiment.units.some((u) => u.name === companionName);
          if (!found) {
            violations.push(
              `Regiment ${i + 1}: Leader '${leaderUnit.name}' requires companion unit '${companionName}' in the regiment.`
            );
          }
        }
      } else {
        // 2. If a leader with no points has companion units, error
        violations.push(
          `Regiment ${i + 1}: Unit '${leaderUnit.name}' must not lead a regiment (has companion units but no points).`
        );
      }
    }
    // 3. If any other unit with companion is taken in a regiment not lead by a leader with them as companion, error
    for (const unit of regiment.units) {
      const armyUnit = army.units.find((u) => u.name === unit.name);
      if (!armyUnit) continue;
      if (armyUnit.companion_units && armyUnit.companion_units.length > 0) {
        // Only allowed if this unit is a companion of the leader
        if (!leaderUnit.companion_units || !leaderUnit.companion_units.includes(armyUnit.name)) {
          violations.push(
            `Regiment ${i + 1}: Unit '${armyUnit.name}' cannot be included in regiment led by '${leaderUnit.name}'.`
          );
        }
      }
    }
  }
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
  // Check auxillary units for unique
  if (list.auxiliary_units) {
    for (const unit of list.auxiliary_units) {
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
  // Check auxillary units for reinforce
  if (list.auxiliary_units) {
    for (const unit of list.auxiliary_units) {
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
  // Check auxillary units for weapon violations
  if (list.auxiliary_units) {
    for (const unit of list.auxiliary_units) {
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
  // Check auxillary units for presence in ArmyData
  if (list.auxiliary_units) {
    for (const unit of list.auxiliary_units) {
      if (unit && unit.name) {
        const found = army.units.find((u) => u.name === unit.name);
        if (!found) {
          violations.push(`Auxillary unit '${unit.name}' is not present in ArmyData.`);
        }
      }
    }
  }
  // 12. No duplicate artifacts, heroic traits, or enhancements assigned across all units
  const assignedArtifacts: Record<string, number> = {};
  const assignedHeroicTraits: Record<string, number> = {};
  const assignedEnhancements: Record<string, Record<string, number>> = {};

  // Helper to count assignments
  function countEnhancements(unit: ListUnit | undefined) {
    if (!unit) return;
    if (unit.artifact)
      assignedArtifacts[unit.artifact] = (assignedArtifacts[unit.artifact] || 0) + 1;
    if (unit.heroic_trait)
      assignedHeroicTraits[unit.heroic_trait] = (assignedHeroicTraits[unit.heroic_trait] || 0) + 1;

    // Count misc enhancements
    if (unit.enhancements) {
      for (const [tableName, enhancementName] of unit.enhancements.entries()) {
        if (!assignedEnhancements[tableName]) {
          assignedEnhancements[tableName] = {};
        }
        assignedEnhancements[tableName][enhancementName] =
          (assignedEnhancements[tableName][enhancementName] || 0) + 1;
      }
    }
  }
  for (const regiment of list.regiments) {
    countEnhancements(regiment.leader);
    for (const unit of regiment.units) countEnhancements(unit);
  }
  if (list.auxiliary_units) {
    for (const unit of list.auxiliary_units) countEnhancements(unit);
  }
  for (const [name, count] of Object.entries(assignedArtifacts)) {
    if (count > 1) violations.push(`Duplicate artifact assigned: ${name}`);
  }
  for (const [name, count] of Object.entries(assignedHeroicTraits)) {
    if (count > 1) violations.push(`Duplicate heroic trait assigned: ${name}`);
  }

  // Check for duplicate enhancements within each table
  for (const [tableName, enhancements] of Object.entries(assignedEnhancements)) {
    for (const [enhancementName, count] of Object.entries(enhancements)) {
      if (count > 1) {
        violations.push(`Duplicate enhancement assigned: ${enhancementName} (from ${tableName})`);
      }
    }
  }

  // 12.b: Only one unique artifact, one unique heroic trait, and one unique enhancement per table allowed in the list
  if (Object.keys(assignedArtifacts).length > 1) {
    violations.push('You cannot have more than 1 artifact in a list.');
  }
  if (Object.keys(assignedHeroicTraits).length > 1) {
    violations.push('You cannot have more than 1 heroic trait in a list.');
  }

  // Check that only one enhancement per table is selected across the list
  for (const [tableName, enhancements] of Object.entries(assignedEnhancements)) {
    if (Object.keys(enhancements).length > 1) {
      violations.push(`You cannot have more than 1 enhancement from ${tableName} in a list.`);
    }
  }
  // 13. Regiment option violations
  for (const [i, regiment] of list.regiments.entries()) {
    const regViolations = calculateRegimentOptionViolations(regiment, army);
    for (const v of regViolations) {
      violations.push(`Regiment ${i + 1}: ${v}`);
    }
  }
  // 14. Scourge of Ghyran exclusivity rule
  const allUnits: string[] = [];
  for (const regiment of list.regiments) {
    if (regiment.leader && regiment.leader.name) allUnits.push(regiment.leader.name);
    for (const unit of regiment.units) if (unit && unit.name) allUnits.push(unit.name);
  }
  if (list.auxiliary_units) {
    for (const unit of list.auxiliary_units) if (unit && unit.name) allUnits.push(unit.name);
  }
  const scourgePattern = /(.*) \(Scourge of Ghyran\)$/;
  const scourgeMap = new Map<string, boolean>();
  for (const name of allUnits) {
    const match = name.match(scourgePattern);
    if (match) {
      scourgeMap.set(match[1], true);
    }
  }
  for (const name of allUnits) {
    if (!name.endsWith(' (Scourge of Ghyran)') && scourgeMap.has(name)) {
      violations.push(
        `Cannot include both '${name}' and '${name} (Scourge of Ghyran)' in the same list.`
      );
    }
  }

  violations.push(...calculateUndersizeUnitViolations(list, army));

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
    // 3. For each set of grouped weapons, enforce shared max and total selection
    // Build a map of group name -> { weapons: Weapon[], totalSelected: number, selectedCounts: Record<string, number> }
    const groupInfo: Record<
      string,
      {
        weapons: typeof groupWeapons;
        totalSelected: number;
        selectedCounts: Record<string, number>;
        max: number;
      }
    > = {};

    for (const w of groupWeapons) {
      if (w.group) {
        if (!groupInfo[w.group]) {
          // Calculate shared max for the group
          const baseCount = typeof modelGroup.count === 'number' ? modelGroup.count : 1;
          const max = baseCount * (reinforced ? 2 : 1);
          groupInfo[w.group] = {
            weapons: [],
            totalSelected: 0,
            selectedCounts: {},
            max,
          };
        }
        groupInfo[w.group].weapons.push(w);
      }
    }

    // Count selections for each grouped weapon
    for (const opt of options as { name: string; count?: number }[]) {
      const weapon = groupWeapons.find((w) => w.name === opt.name && w.group);
      if (weapon && weapon.group) {
        const count = typeof opt.count === 'number' ? opt.count : 1;
        groupInfo[weapon.group].selectedCounts[weapon.name] =
          (groupInfo[weapon.group].selectedCounts[weapon.name] || 0) + count;
        groupInfo[weapon.group].totalSelected += count;
      }
    }

    // Validate each group
    for (const [groupKey, info] of Object.entries(groupInfo)) {
      // Each weapon in the group must not exceed the shared max
      for (const [weaponName, count] of Object.entries(info.selectedCounts)) {
        if (count > info.max) {
          violations.push(
            `Weapon option '${weaponName}' in group '${groupKey}' exceeds shared max (${count} > ${info.max}) for unit '${unit.name}'.`
          );
        }
      }
      // The total selected for the group must be exactly equal to the shared max
      if (info.totalSelected !== info.max) {
        violations.push(
          `Total selections for weapon group '${groupKey}' in model group '${groupName}' for unit '${unit.name}' must be exactly ${info.max} (currently ${info.totalSelected}).`
        );
      }
    }
  }
  return violations;
}

// Returns a list of violations for regiment option rules
// Helper: does a unit (from ArmyData) match a regiment option name?
function unitMatchesRegimentOption(armyUnit: any, optName: string): boolean {
  const name = armyUnit.name?.toLowerCase() || '';
  const category = armyUnit.category?.toLowerCase() || '';
  const keywords = (armyUnit.keywords || []).map((k: string) => k.toLowerCase());
  if (optName.includes(' ')) {
    const parts = optName.split(/\s+/);
    if (parts.every((part: string) => keywords.includes(part))) return true;
  }
  return (
    name.includes(optName) ||
    category.includes(optName) ||
    keywords.some((kw: string) => kw.includes(optName))
  );
}

export function calculateRegimentOptionViolations(regiment: ListRegiment, army: Army): string[] {
  const violations: string[] = [];
  if (!regiment.leader || !regiment.leader.name) return violations; // skip if no leader
  const leaderUnit = army.units.find((u) => u.name === regiment.leader.name);
  if (!leaderUnit) return violations;

  // 1. Hero presence: Only allow a hero in a regiment if:
  // - It is the leader, or
  // - Its sub_hero_tags match a sub_hero_option, or
  // - A regular regiment_option has its exact name (case-insensitive)
  for (const regUnit of regiment.units) {
    const armyUnit = army.units.find((u) => u.name === regUnit.name);
    if (!armyUnit) continue;
    const isHero = (armyUnit.category || '').toLowerCase() === 'hero';
    if (isHero) {
      let allowed = false;
      // Check sub_hero_tags vs sub_hero_options
      if (
        leaderUnit.sub_hero_options &&
        leaderUnit.sub_hero_options.length > 0 &&
        armyUnit.sub_hero_tags
      ) {
        for (const tag of armyUnit.sub_hero_tags) {
          if (
            leaderUnit.sub_hero_options.some((opt) => opt.name.toLowerCase() === tag.toLowerCase())
          ) {
            allowed = true;
            break;
          }
        }
      }
      // Check regiment_options for exact name match
      if (!allowed && leaderUnit.regiment_options && leaderUnit.regiment_options.length > 0) {
        if (
          leaderUnit.regiment_options.some(
            (opt) => opt.name.toLowerCase() === armyUnit.name.toLowerCase()
          )
        ) {
          allowed = true;
        }
      }
      if (!allowed) {
        violations.push(
          `Hero '${armyUnit.name}' is not allowed in this regiment led by '${regiment.leader.name}'.`
        );
      }
    }
  }

  // 2. Sub-hero options: enforce max for sub-hero tags
  if (leaderUnit.sub_hero_options && leaderUnit.sub_hero_options.length > 0) {
    for (const option of leaderUnit.sub_hero_options) {
      const optName = option.name.toLowerCase();
      const max = option.max ?? 1;
      let count = 0;
      for (const regUnit of regiment.units) {
        const armyUnit = army.units.find((u) => u.name === regUnit.name);
        if (!armyUnit) continue;
        const tags = (armyUnit.sub_hero_tags || []).map((t: string) => t.toLowerCase());
        if (tags.includes(optName)) {
          count++;
        }
      }
      if (max > 0 && count > max) {
        violations.push(
          `Too many sub-heroes of type '${option.name}' (max ${max}) in regiment led by '${regiment.leader.name}'.`
        );
      }
    }
  }

  // 3. Regiment options: check that all non-hero units match at least one option
  const allOptions = leaderUnit.regiment_options || [];
  if (allOptions.length > 0) {
    for (const regUnit of regiment.units) {
      const armyUnit = army.units.find((u) => u.name === regUnit.name);
      if (!armyUnit) continue;
      const isHero = (armyUnit.category || '').toLowerCase() === 'hero';
      if (isHero) continue; // skip heroes, already validated above
      const matchesAny = allOptions.some((option) =>
        unitMatchesRegimentOption(armyUnit, option.name.toLowerCase())
      );
      if (!matchesAny) {
        violations.push(
          `Unit '${armyUnit.name}' does not match any required regiment option in regiment led by '${regiment.leader.name}'.`
        );
      }
    }
  }

  // 4. Regiment options with max > 0: enforce max for matching units
  if (leaderUnit.regiment_options && leaderUnit.regiment_options.length > 0) {
    for (const option of leaderUnit.regiment_options) {
      const optName = option.name.toLowerCase();
      const max = option.max;
      if (max && max > 0) {
        let count = 0;
        for (const regUnit of regiment.units) {
          const armyUnit = army.units.find((u) => u.name === regUnit.name);
          if (!armyUnit) continue;
          if (unitMatchesRegimentOption(armyUnit, optName)) count++;
        }
        if (count > max) {
          violations.push(
            `Too many units matching regiment option '${option.name}' (max ${max}) in regiment led by '${regiment.leader.name}'.`
          );
        }
      }
    }
  }

  return violations;
}
