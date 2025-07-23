// this file contains hacks for the parsing process
// basically accounting for exceptions that are too complex/annoying to handle generically in the main parser logic

import type { Game } from "./models/game";

type ParserHack = (game: Game) => void;

export const parserHacks: ParserHack[] = [
	markBigWaaaghAsArmyOfRenown,
	addManifestationsToThryxRoR,
	makeDuardinAscendantArmyOfRenown,
	markLegendsArmiesUnitsAsLegends
];

function markBigWaaaghAsArmyOfRenown(game: Game) {
	const bigWaaagh = game.armies.get('Big Waaagh!');
	if (bigWaaagh) {
		bigWaaagh.isArmyOfRenown = true;
	}
}

function addManifestationsToThryxRoR(game: Game) {
	const thryxRoR = game.regimentsOfRenown.get('The Coven of Thryx');
	if (thryxRoR) {
		thryxRoR.units.set('Burning Sigil of Tzeentch', 1);
		thryxRoR.units.set('Tome of Eyes', 1);
		thryxRoR.units.set('Daemonic Simulacrum', 1);
	}
}

function makeDuardinAscendantArmyOfRenown(game: Game) {
	const duardinAscendant = game.armies.get("The Duardin Ascendant");
	if (duardinAscendant) {
		duardinAscendant.isArmyOfRenown = true;
	}
}

// Some legends armies have many units that are not marked as legends themselves but should be treated as legends
// sometimes they share units with current armies, so we need to figure out which ones only exist in legends armies
// and mark those units as legends
function markLegendsArmiesUnitsAsLegends(game: Game) {
	const nonLegendsArmies = Array.from(game.armies.values()).filter(army => !army.legends);

	for (const army of game.armies.values()) {
		if (army.legends) {
			for (const profile of army.battleProfiles.values()) {
				if (profile.legends) continue; // skip if already marked as legends

				// if exists in a non-legends army skip it otherwise mark it as legends
				if (nonLegendsArmies.some(nonLegendsArmy => nonLegendsArmy.battleProfiles.has(profile.name))) {
					continue;
				}

				// update bp
				profile.legends = true;
				if (!profile.keywords.includes('LEGENDS')) {
					profile.keywords.push('LEGENDS');
				}

				// update unitList in army
				const unitList = army.unitList.get(profile.category);
				if (unitList) {
					const listItem = unitList.find(unit => unit.name === profile.name);
					if (listItem) {
						listItem.legends = true;
					}
				}

				// update unit data in game
				const unitData = game.units.get(profile.name);
				if (unitData) {
					unitData.legends = true;
					if (!unitData.keywords.includes('LEGENDS')) {
						unitData.keywords.push('LEGENDS');
					}
				}
			}
		}
	}
}