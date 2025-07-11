import type { List } from '../../list/models/list';
import type { Game } from '../../parser/models/game';
import type { ListValidator } from '../validator';

export const aorChecks: ListValidator[] = [
  requiredGeneralIsSelected,
  // aorMayNotIncludeRoR
];

export function requiredGeneralIsSelected(list: List, game: Game): string[] {
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

// export function aorMayNotIncludeRoR(list: List, game: Game): string[] {
// 	// TODO: RoRs haven't been implemented yet, so this is a placeholder
// 	return [];
// }
