import type { List } from '../../list/models/list';
import type { Game } from '../../parser/models/game';
import type { ListValidator } from '../validator';

export const aorChecks: ListValidator[] = [
  requiredGeneralIsSelected,
  mustBeGeneralIfIncluded,
  aorMayNotIncludeRoR,
  mustBeIncluded,
];

function requiredGeneralIsSelected(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return [];

  const requiredGeneralOption = army.options.find(option => option.type === 'requiredGeneral');
  if (!requiredGeneralOption) return [];

  const units = list.allUnits();

  for (const unit of units) {
    if (unit.general && requiredGeneralOption.units.includes(unit.name)) {
      return [];
    }
  }
  return [
    `One of the following units must be selected as your general: ${requiredGeneralOption.units.join(', ')}`,
  ];
}

function mustBeGeneralIfIncluded(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return [];

  const mustBeGeneralOption = army.options.find(option => option.type === 'generalIfIncluded');
  if (!mustBeGeneralOption) return [];

  const units = list.allUnits();

  for (const unit of units) {
    if (mustBeGeneralOption.units.includes(unit.name) && !unit.general) {
      return [`${unit.name} must be selected as your general if included in the list.`];
    }
  }
  return [];
}

function mustBeIncluded(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return [];

  const mustBeIncludedOptions = army.options.filter(option => option.type === 'mustBeIncluded');
  if (mustBeIncludedOptions.length === 0) return [];

  const units = list.allUnits();

  // for ech mustBeIncludedOption we need to respect the min and max
  // each min/max is counted separately for that particular option
  const errors: string[] = [];
  for (const option of mustBeIncludedOptions) {
    const selectedUnits = units.filter(unit => option.units.includes(unit.name));
    const selectedCount = selectedUnits.length;
    if (selectedCount < option.min) {
      errors.push(`You must include at least ${option.min} of the following units: ${option.units.join(', ')}`);
    }
    if (selectedCount > option.max) {
      errors.push(`You can include a maximum of ${option.max} of the following units: ${option.units.join(', ')}`);
    }
  }

  return errors;
}

function aorMayNotIncludeRoR(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) return [];
  if (army.isArmyOfRenown && list.regimentOfRenown) {
    return ['Regiments of Renown may not be included in an Army of Renown.'];
  }
  return [];
}
