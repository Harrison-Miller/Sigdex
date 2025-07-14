import type { List } from "../../list/models/list";
import type { Game } from "../../parser/models/game";
import type { ListValidator } from "../validator";

export const rorChecks: ListValidator[] = [
	allowedToTakeRoR,
	checkAoRUnitsAreValid,
	checkAoRUnitsHaveNoConfiguration,
];

function allowedToTakeRoR(list: List, game: Game): string[] {
	if (!list.regimentOfRenown) return [];

	const ror = game.regimentsOfRenown.get(list.regimentOfRenown);
	if (!ror) return [`Regiment of Renown: ${list.regimentOfRenown} not found.`];


	if (!ror.allowedArmies.includes(list.faction)) {
		return [
			`Not allowed to take ${list.regimentOfRenown} in ${list.faction}.`,
		];
	}

	return [];
}

function checkAoRUnitsAreValid(list: List, game: Game): string[] {
	if (!list.regimentOfRenown) return [];

	const errors: string[] = [];

	const ror = game.regimentsOfRenown.get(list.regimentOfRenown);
	if (!ror) return []; // covered elsewhere

	const foundUnits: Map<string, number> = new Map();
	for (const unit of list.regimentOfRenownUnits) {
		const unitData = game.units.get(unit.name);
		if (!unitData) {
			errors.push(`Regiment of Renown unit "${unit.name}" not found in game data.`);
			continue;
		}

		if (!ror.units.get(unit.name)) {
			errors.push(
				`Unit "${unit.name}" is not part of the Regiment of Renown "${list.regimentOfRenown}".`
			);
			continue;
		}
		foundUnits.set(unit.name, (foundUnits.get(unit.name) || 0) + 1);
	}

	for (const [unitName, count] of foundUnits.entries()) {
		const expectedCount = ror.units.get(unitName) || 0;
		if (count != expectedCount) {
			errors.push(`Unit "${unitName}" is included ${count} times, but the Regiment of Renown "${list.regimentOfRenown}" expects exactly ${expectedCount} instances.`);
		}
	}

	return errors;
}

function checkAoRUnitsHaveNoConfiguration(list: List): string[] {
	if (!list.regimentOfRenown) return [];

	const errors: string[] = [];

	for (const unit of list.regimentOfRenownUnits) {
		if (unit.general) {
			errors.push(`${unit.name} in Regiment of Renown cannot be a general.`);
		}
		if (unit.reinforced) {
			errors.push(`${unit.name} in Regiment of Renown cannot be reinforced.`);
		}
		if (unit.artifact) {
			errors.push(`${unit.name} in Regiment of Renown cannot have an artifact.`);
		}
		if (unit.heroicTrait) {
			errors.push(`${unit.name} in Regiment of Renown cannot have a heroic trait.`);
		}
		if (unit.enhancements.size > 0) {
			errors.push(`${unit.name} in Regiment of Renown cannot have enhancements.`);
		}
	}

	return errors;
}

