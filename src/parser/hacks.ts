// this file contains hacks for the parsing process
// basically accounting for exceptions that are too complex/annoying to handle generically in the main parser logic

import type { Game } from "./models/game";

type ParserHack = (game: Game) => void;

export const parserHacks: ParserHack[] = [
	markBigWaaaghAsArmyOfRenown,
	addManifestationsToThryxRoR,
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