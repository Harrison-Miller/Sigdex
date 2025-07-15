import type { List } from '../../list/models/list';
import type { BattleProfile } from '../../parser/models/battleProfile';
import type { Game } from '../../parser/models/game';
import type { ListValidator } from '../validator';

export const unitConfigurationChecks: ListValidator[] = [
  uniqueUnitsCannotTakeEnhancements,
  checkReinforcedUnitsAreValid,
  checkEnhancementSelectionsAreValid,
  checkWeaponOptionsAreValid,
];

function uniqueUnitsCannotTakeEnhancements(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return []; // error handled elsewhere

  const errors: string[] = [];
  const uniqueUnits = list.allUnits().filter((unit) => {
    const battleProfile = army.battleProfiles.get(unit.name) as BattleProfile;
    return battleProfile && battleProfile.hasKeyword('unique');
  });

  for (const unit of uniqueUnits) {
    if (unit.getEnhancementCount() > 0) {
      errors.push(`Unique unit "${unit.name}" cannot take enhancements.`);
    }
  }

  return errors;
}

function checkReinforcedUnitsAreValid(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return []; // error handled elsewhere

  const errors: string[] = [];
  const reinforcedUnits = list.allUnits().filter((unit) => unit.reinforced);

  for (const unit of reinforcedUnits) {
    const bp = army.battleProfiles.get(unit.name) as BattleProfile;
    if (!bp) continue;

    // unique can't reinforce
    if (bp.hasKeyword('unique')) {
      errors.push(`Unique unit "${unit.name}" cannot be reinforced.`);
      continue;
    }

    // hero can't reinforce
    if (bp.category === 'HERO') {
      errors.push(`Hero unit "${unit.name}" cannot be reinforced.`);
      continue;
    }

    if (!bp.reinforceable) {
      errors.push(`Unit "${unit.name}" cannot be reinforced.`);
      continue;
    }
  }

  return errors;
}

function checkEnhancementSelectionsAreValid(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return []; // error handled elsewhere

  const errors: string[] = [];
  const units = list.allUnits().filter((unit) => {
    const count = unit.getEnhancementCount();
    return count > 0;
  });

  let artifactCount = 0;
  let heroicTraitCount = 0;
  const enhancementCount: Map<string, number> = new Map();

  for (const unit of units) {
    const bp = army.battleProfiles.get(unit.name) as BattleProfile;
    if (!bp) continue; // error handled elsewhere

    if (unit.artifact) {
      artifactCount++;
      if (bp.category !== 'HERO') {
        errors.push(`Unit "${unit.name}" can only take an artifact if it is a hero.`);
      } else if (bp.hasKeyword('unique')) {
        errors.push(`Unit "${unit.name}" is unique and cannot take an artifact.`);
      }
    }

    if (unit.heroicTrait) {
      heroicTraitCount++;
      if (bp.category !== 'HERO') {
        errors.push(`Unit "${unit.name}" can only take a heroic trait if it is a hero.`);
      } else if (bp.hasKeyword('unique')) {
        errors.push(`Unit "${unit.name}" is unique and cannot take a heroic trait.`);
      }
    }

    for (const [table, _] of unit.enhancements.entries()) {
      if (!enhancementCount.has(table)) {
        enhancementCount.set(table, 0);
      }
      enhancementCount.set(table, enhancementCount.get(table)! + 1);
      if (!bp.enhancementTables.includes(table)) {
        errors.push(`Unit "${unit.name}" cannot take enhancements from table "${table}".`);
        continue;
      }
    }
  }

  if (artifactCount > 1) {
    errors.push('No more than 1 artifact may be selected.');
  }
  if (heroicTraitCount > 1) {
    errors.push('No more than 1 heroic trait may be selected.');
  }
  for (const [table, count] of enhancementCount.entries()) {
    if (count > 1) {
      errors.push(`No more than 1 enhancement may be selected from table "${table}".`);
    }
  }

  return errors;
}

function checkWeaponOptionsAreValid(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return []; // error handled elsewhere

  const errors: string[] = [];
  const units = list.allUnits(true); // include RoR units

  for (const unit of units) {
    const unitData = game.units.get(unit.name);
    if (!unitData) continue; // error handled elsewhere

    for (const [modelName, model] of unit.weaponOptions.entries()) {
      if (!unitData.models.has(modelName)) {
        errors.push(`Unit "${unit.name}" does not have a model named "${modelName}".`);
        continue;
      }

      const modelData = unitData.models.get(modelName);
      if (!modelData) continue;
      const weaponsData = Array.from(modelData.weapons.values());

      const reinforceMod = unit.reinforced ? 2 : 1;
      const groupedWeaponCounts = new Map<string, number>();
      for (const option of model) {
        const weaponData = weaponsData.find((w) => w.name === option.name);
        if (!weaponData) {
          errors.push(
            `Weapon option "${option.name}" does not exist for model "${modelName}" in unit "${unit.name}".`
          );
          continue;
        }

        if (weaponData.type === 'optional') {
          const effectiveMax = weaponData.max * reinforceMod;
          if (option.count > effectiveMax) {
            errors.push(
              `${unit.name} cannot take more than ${effectiveMax} of weapon "${option.name}".`
            );
          }
        }

        if (weaponData.type === 'grouped') {
          const group = weaponData.group;
          if (!groupedWeaponCounts.has(group)) {
            groupedWeaponCounts.set(group, 0);
          }
          groupedWeaponCounts.set(
            group,
            groupedWeaponCounts.get(group)! + option.count
          );
        }
      }

      for (const [groupName, count] of groupedWeaponCounts.entries()) {
        const groupedWeaponsData = weaponsData.filter((w) => w.group === groupName) || [];
        if (groupedWeaponsData.length === 0) continue;
        const expected = modelData.count * reinforceMod;
        if (count != expected) {
          errors.push(
            `${modelName} must take exactly ${expected} selections from (${groupedWeaponsData.map((w) => w.name).join(', ')}).`
          );
        }
      }
    }
  }

  return errors;
}
