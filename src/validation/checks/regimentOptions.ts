import type { List } from '../../list/models/list';
import type { ListRegiment } from '../../list/models/regiment';
import type { Army } from '../../parser/models/army';
import type { BattleProfile } from '../../parser/models/battleProfile';
import type { Game } from '../../parser/models/game';
import type { ListValidator } from '../validator';

export const regimentOptionsChecks: ListValidator[] = [
  checkRegimentsAreValid,
  checkCompanionUnits,
  checkUndersizeUnits,
];

function checkRegimentsAreValid(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return []; // error handled elsewhere

  const errors: string[] = [];
  for (const regiment of list.regiments) {
    const regimentErrors = validateRegimentOptions(regiment, army);
    if (regimentErrors.length > 0) {
      errors.push(...regimentErrors);
    }
  }

  return errors;
}

function validateRegimentOptions(regiment: ListRegiment, army: Army): string[] {
  if (!regiment.leader.name) return []; // hanlded elsewhere

  const leaderUnit = army.battleProfiles.get(regiment.leader.name);
  if (!leaderUnit) return []; // leader must be a valid unit

  const errors: string[] = [];

  // heroes may not be present in a regiment unless the leader specifically allows it
  for (const unit of regiment.units) {
    const bp = army.battleProfiles.get(unit.name);
    if (!bp) continue; // skip if unit not found in army
    if (bp.category === 'HERO') {
      const allowedByName = leaderUnit.regimentOptions.some((opt) => opt.name === bp.name);
      const allowedByTags = leaderUnit.regimentOptions.some((opt) =>
        bp.regimentTags.includes(opt.name)
      );
      if (!allowedByName && !allowedByTags) {
        errors.push(
          `Hero '${bp.name}' is not allowed in regiment led by '${regiment.leader.name}'.`
        );
      }
    }
  }

  // all units match some regiment option
  for (const unit of regiment.units) {
    const bp = army.battleProfiles.get(unit.name) as BattleProfile;
    if (!bp) continue; // skip if unit not found in army
    if (bp.category === 'HERO') continue; // heroes already validated above
    const matches = leaderUnit.regimentOptions.some((opt) => bp.matchesRegimentOption(opt.name));
    if (!matches) {
      errors.push(
        `Unit '${bp.name}' does not match any regiment option in regiment led by '${regiment.leader.name}'.`
      );
    }
  }

  // enforce min/max of options
  for (const opt of leaderUnit.regimentOptions) {
    if (opt.max === 0 && opt.min == 0) continue; // skip options with no limits

    let count = 0;

    for (const unit of regiment.units) {
      const bp = army.battleProfiles.get(unit.name) as BattleProfile;
      if (!bp) continue; // skip if unit not found in army
      if (bp.matchesRegimentOption(opt.name)) {
        count++;
      }
    }

    if (count < opt.min) {
      errors.push(
        `Not enough units matching option '${opt.name}' (min ${opt.min}) in regiment led by '${regiment.leader.name}'.`
      );
    } else if (count > opt.max) {
      errors.push(
        `Too many units matching option '${opt.name}' (max ${opt.max}) in regiment led by '${regiment.leader.name}'.`
      );
    }
  }

  return errors;
}

function checkCompanionUnits(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return []; // error handled elsewhere

  const errors: string[] = [];

  for (const regiment of list.regiments) {
    if (!regiment.leader.name) continue; // skip if no leader

    // check if companion leader has it's required companion units is covered
    // by regiment option min check
    for (const unit of regiment.units) {
      const bp = army.battleProfiles.get(unit.name);
      if (!bp) continue; // skip if unit not found in army
      if (bp.companionLeader && bp.companionLeader !== regiment.leader.name) {
        errors.push(
          `${bp.name} is a companion unit but not led by the correct leader '${bp.companionLeader}'.`
        );
      }
    }
  }

  return errors;
}

function checkUndersizeUnits(list: List, game: Game) {
  const army = game.armies.get(list.faction);
  if (!army) return []; // error handled elsewhere

  const undersizeConditions: Map<string, number> = new Map();
  const undersizeUnits: Map<string, Set<string>> = new Map(); // condition -> set of unit names
  const units = list.allUnits();
  for (const unit of units) {
    const bp = army.battleProfiles.get(unit.name) as BattleProfile;
    if (!bp) continue; // skip if unit not found in army

    if (bp.isUndersize && bp.undersizeCondition) {
      const currentCount = undersizeConditions.get(bp.undersizeCondition) || 0;
      undersizeConditions.set(bp.undersizeCondition, currentCount + 1);
      if (!undersizeUnits.has(bp.undersizeCondition)) {
        undersizeUnits.set(bp.undersizeCondition, new Set());
      }
      undersizeUnits.get(bp.undersizeCondition)!.add(unit.name);
    }
  }

  const errors: string[] = [];
  for (const [condition, count] of undersizeConditions.entries()) {
    const allowed = units.filter((unit) => unit.name == condition).length;
    if (count > allowed) {
      const undersizeUnitNames = Array.from(undersizeUnits.get(condition) || []).join(', ');
      errors.push(
        `Only 1 ${undersizeUnitNames} allowed per ${condition} (${allowed}), but there are ${count}.`
      );
    }
  }

  return errors;
}
