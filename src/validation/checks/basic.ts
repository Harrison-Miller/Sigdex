import type { List } from '../../list/models/list';
import { BattleProfile } from '../../parser/models/battleProfile';
import type { Game } from '../../parser/models/game';
import { calculatePoints } from '../points';
import type { ListValidator } from '../validator';

export const basicChecks: ListValidator[] = [
  belowPointsCap,
  hasGeneral,
  regimentCount,
  regimentUnitCount,
  regimentLeaderIsHero,
  warmasterMustBeGeneral,
  noDuplicateUniqueUnits,
  noLegendsUnits
];

function belowPointsCap(list: List, game: Game): string[] {
  const points = calculatePoints(list, game);
  if (points > list.pointsCap) {
    return [`List exceeds ${list.pointsCap} points (${points} points)`];
  }
  return [];
}

function hasGeneral(list: List): string[] {
  let generals = 0;
  for (const regiment of list.regiments) {
    if (regiment.leader.general) {
      generals++;
    }

    for (const unit of regiment.units) {
      if (unit.general) {
        return ['Only a regiment leader can be a general'];
      }
    }
  }

  if (generals === 0) {
    return ['1 general must be selected'];
  } else if (generals > 1) {
    return ['No more than 1 general in list'];
  }

  return [];
}

function regimentCount(list: List): string[] {
  let regiments = list.regiments.length;
  if (list.regimentOfRenown) {
    regiments++;
  }
  if (regiments > 5) {
    if (list.regimentOfRenown) {
      return ['No more than 5 regiments allowed in a list (including Regiments of Renown)'];
    }
    return ['No more than 5 regiments allowed in a list'];
  }

  return [];
}

function regimentUnitCount(list: List): string[] {
  const errors: string[] = [];
  for (const regiment of list.regiments) {
    const units = regiment.units.length;
    if (regiment.leader.general && units > 4) {
      errors.push('No more than 4 units in the general\'s regiment');
    } else if (!regiment.leader.general && units > 3) {
      errors.push('No more than 3 units in a regiment');
    }
  }
  return errors;
}

function regimentLeaderIsHero(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return []; // error handled elsewhere

  const errors: string[] = [];
  for (const [idx, regiment] of list.regiments.entries()) {
    if (regiment.leader.name) {
      const unit = army.battleProfiles.get(regiment.leader.name);
      if (unit && unit.category !== 'HERO') {
        errors.push(`Regiment leader ${regiment.leader.name} must have the hero category`);
      }
    } else {
      errors.push(`Regiment ${idx + 1} must have a leader`);
    }
  }
  return errors;
}

function warmasterMustBeGeneral(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return []; // error handled elsewhere

  const warmasterUnits = list.allUnits().filter((unit) => {
    const battleProfile = army.battleProfiles.get(unit.name) as BattleProfile;
    return battleProfile && battleProfile.hasKeyword('warmaster');
  });
  if (warmasterUnits.length > 0 && !warmasterUnits.some((u) => u.general)) {
    return [
      `At least one Warmaster must be marked as general (${warmasterUnits.map((u) => u.name).join(', ')})`,
    ];
  }

  return [];
}

function noDuplicateUniqueUnits(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return []; // error handled elsewhere

  const uniqueUnits = new Set<string>();
  const errors: string[] = [];

  for (const unit of list.allUnits()) {
    const battleProfile = army.battleProfiles.get(unit.name) as BattleProfile;
    if (battleProfile && battleProfile.hasKeyword('unique')) {
      if (uniqueUnits.has(unit.name)) {
        errors.push(`List may not contain more than one of unique unit: ${unit.name}`);
      } else {
        uniqueUnits.add(unit.name);
      }
    }
  }

  return errors;
}

function noLegendsUnits(list: List, game: Game): string[] {
  if (list.validator === 'legends') return [];
  for (const unit of list.allUnits()) {
    const unitData = game.units.get(unit.name);
    if (unitData && unitData.legends) {
      return ["Legends units can not be included in your army"]
    }
  }
  return []
}