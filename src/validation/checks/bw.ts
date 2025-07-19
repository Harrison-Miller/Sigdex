import type { List } from "../../list/models/list";
import type { Game } from "../../parser/models/game";
import type { ListValidator } from "../validator";

export const bwChecks: ListValidator[] = [
	kragnosLeadsEitherKBZorIJ,
	halfRegimentsAreIJandKBZ,
];

function kragnosRegimentType(list: List, game: Game): 'none' | 'kbz' | 'ij' | 'both' {
	if (list.faction !== 'Big Waaagh!') return 'none';

	if (list.regiments.length === 0) return 'none';

	const kragnosRegiment = list.regiments.find((r) => r.leader.name.includes('Kragnos'));
	if (!kragnosRegiment) return 'none';

	const hasKBZ = kragnosRegiment.units.some((u) => {
		const unitData = game.units.get(u.name);
		return unitData?.hasKeyword('Kruleboyz');
	});

	const hasIJ = kragnosRegiment.units.some((u) => {
		const unitData = game.units.get(u.name);
		return unitData?.hasKeyword('Ironjawz');
	});

	if (!hasKBZ && !hasIJ) return 'none';
	if (hasKBZ && hasIJ) return 'both';
	if (hasKBZ) return 'kbz';
	if (hasIJ) return 'ij';
	return 'none';
}



function kragnosLeadsEitherKBZorIJ(list: List, game: Game): string[] {
	if (list.faction !== 'Big Waaagh!') return [];

	const regimentType = kragnosRegimentType(list, game);
	if (regimentType === 'none' || regimentType === 'kbz' || regimentType === 'ij') return [];

	return ['In a Big Waaagh! army, Kragnos, the End of Empires may not lead a regiment that contains both Kruleboyz and Ironjawz units.'];
}

function halfRegimentsAreIJandKBZ(list: List, game: Game): string[] {
	if (list.faction !== 'Big Waaagh!') return [];

	const regimentType = kragnosRegimentType(list, game);
	let kbz: number = regimentType === 'kbz' ? 1 : 0;
	let ij: number = regimentType === 'ij' ? 1 : 0;

	for (const regiment of list.regiments) {
		if (regiment.leader.name.includes('Kragnos')) continue; // Skip Kragnos regiment

		const leaderData = game.units.get(regiment.leader.name);
		if (!leaderData) continue;
		if (leaderData.hasKeyword('Kruleboyz')) kbz++;
		if (leaderData.hasKeyword('Ironjawz')) ij++;
	}

	if (kbz === ij) return [];

	return ['In a Big Waaagh! army, for every Kruleboyz regiment, there must be an Ironjawz regiment, and vice versa.'];
}