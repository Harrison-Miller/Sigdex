import type { Army } from '../common/ArmyData';
import type { List, ListUnit, ListRegiment } from '../common/ListData';
import type { Lore } from '../common/ManifestationData';
import { calculatePoints } from './points-manager';

/**
 * Checks for list-building violations and returns a list of error messages.
 * @param list The list to check
 * @param army The loaded Army data
 * @param lores The loaded lores data
 * @returns Array of violation strings
 */
export function calculateViolations(list: List, army: Army, lores?: Map<string, Lore>): string[] {
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
  // Check auxillary units for unique
  if (list.auxiallary_units) {
    for (const unit of list.auxiallary_units) {
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
  if (list.auxiallary_units) {
    for (const unit of list.auxiallary_units) {
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
  if (list.auxiallary_units) {
    for (const unit of list.auxiallary_units) {
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
  if (list.auxiallary_units) {
    for (const unit of list.auxiallary_units) {
      if (unit && unit.name) {
        const found = army.units.find((u) => u.name === unit.name);
        if (!found) {
          violations.push(`Auxillary unit '${unit.name}' is not present in ArmyData.`);
        }
      }
    }
  }
  // 12. No duplicate artifacts or heroic traits assigned across all units
  const assignedArtifacts: Record<string, number> = {};
  const assignedHeroicTraits: Record<string, number> = {};
  // Helper to count assignments
  function countEnhancements(unit: ListUnit | undefined) {
    if (!unit) return;
    if (unit.artifact)
      assignedArtifacts[unit.artifact] = (assignedArtifacts[unit.artifact] || 0) + 1;
    if (unit.heroic_trait)
      assignedHeroicTraits[unit.heroic_trait] = (assignedHeroicTraits[unit.heroic_trait] || 0) + 1;
  }
  for (const regiment of list.regiments) {
    countEnhancements(regiment.leader);
    for (const unit of regiment.units) countEnhancements(unit);
  }
  if (list.auxiallary_units) {
    for (const unit of list.auxiallary_units) countEnhancements(unit);
  }
  for (const [name, count] of Object.entries(assignedArtifacts)) {
    if (count > 1) violations.push(`Duplicate artifact assigned: ${name}`);
  }
  for (const [name, count] of Object.entries(assignedHeroicTraits)) {
    if (count > 1) violations.push(`Duplicate heroic trait assigned: ${name}`);
  }
  // 12.b: Only one unique artifact and one unique heroic trait allowed in the list
  if (Object.keys(assignedArtifacts).length > 1) {
    violations.push('You cannot have more than 1 artifact in a list.');
  }
  if (Object.keys(assignedHeroicTraits).length > 1) {
    violations.push('You cannot have more than 1 heroic trait in a list.');
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
  if (list.auxiallary_units) {
    for (const unit of list.auxiallary_units) if (unit && unit.name) allUnits.push(unit.name);
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
