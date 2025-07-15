import type { Game } from '../../parser/models/game';
import type { List } from '../../list/models/list';
import { useUnitSettings } from '../shared/composables/useUnitSettings';
import { ListUnit } from '../../list/models/unit';

export function assignRoR(ror: string, list: List, game: Game): void {
	list.regimentOfRenown = '';
	list.regimentOfRenownUnits = [];
	if (!ror) {
		return;
	}

	const rorData = game.regimentsOfRenown.get(ror);
	if (!rorData) {
		console.warn(`Regiment of Renown "${ror}" not found in game data.`);
		return;
	}

	const units: ListUnit[] = [];
	for (const [name, count] of rorData.units) {
		const unitData = game.units.get(name);
		if (!unitData) {
			console.warn(`Unit "${name}" not found in game data.`);
			return;
		}
		const unitSettings = useUnitSettings(unitData);
		const listUnit: Partial<ListUnit> = {
			name: name,
			reinforced: false,
			weaponOptions: unitSettings.value.weaponOptions, // TODO: if this came from reinforced settings, we need to half/handle it
		};
		for (let i = 0; i < count; i++) {
			units.push(new ListUnit(listUnit));
		}
	}
	list.regimentOfRenownUnits = units;
	list.regimentOfRenown = ror;
	return;
}