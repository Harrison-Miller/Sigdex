import type { List } from "../../list/models/list";
import type { ListValidator } from "../validator";

export const sbglChecks: ListValidator[] = [
	cadoExclusiveCheck,
	radukarExclusiveCheck,
];

function cadoExclusiveCheck(list: List): string[] {
	const allUnits = list.allUnits();
	const cadoUnits = allUnits.filter((u) => u.name.includes('Cado Ezechiar, the Hollow King') || u.name.includes('Blades of the Hollow King'));
	if (cadoUnits.length === 2) {
		return ['In a Soulblight Gravelords army, you may not include both Cado Ezechiar, the Hollow King and Blades of the Hollow King.'];
	}
	return [];
}

function radukarExclusiveCheck(list: List): string[] {
	const allUnits = list.allUnits();
	const radukarUnits = allUnits.filter((u) => u.name.includes('Radukar the Beast') || u.name.includes('Radukar the Wolf'));
	if (radukarUnits.length === 2) {
		return ['In a Soulblight Gravelords army, you may not include both Radukar the Beast and Radukar the Wolf.'];
	}
	return [];
}