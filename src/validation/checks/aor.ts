import type { List } from '../../list/models/list';
import type { Game } from '../../parser/models/game';
import type { ListValidator } from '../validator';

export const aorChecks: ListValidator[] = [
  requiredGeneralIsSelected,
  mustBeGeneralIfIncluded,
  aorMayNotIncludeRoR,
];

function requiredGeneralIsSelected(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army || army.requiredGeneral.length === 0) return [];

  const units = list.allUnits();

  for (const unit of units) {
    if (unit.general && army.requiredGeneral.includes(unit.name)) {
      return [];
    }
  }
  return [
    `One of the following units must be selected as your general: ${army.requiredGeneral.join(', ')}`,
  ];
}

function mustBeGeneralIfIncluded(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army || army.mustBeGeneralIfIncluded.length === 0) return [];

  const units = list.allUnits();

  for (const unit of units) {
    if (army.mustBeGeneralIfIncluded.includes(unit.name) && !unit.general) {
      return [`${unit.name} must be selected as your general if included in the list.`];
    }
  }
  return [];
}

function aorMayNotIncludeRoR(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return [];
  if (army.isArmyOfRenown && list.regimentOfRenown) {
    return ['Regiments of Renown may not be included in an Army of Renown.'];
  }
  return [];
}
