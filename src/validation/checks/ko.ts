import type { List } from "../../list/models/list";
import type { ListValidator } from "../validator";

export const koChecks: ListValidator[] = [
	autoEndrinIsNotAUnit,
];

function autoEndrinIsNotAUnit(list: List): string[] {
	const allUnits = list.allUnits();

	if (allUnits.some((u) => u.name === 'Auto-Endrin')) {
		return ['The Auto-Endrin is not a valid unit in Kharadron Overlords armies (It is just added for convenience display).'];
	}

	return [];
}