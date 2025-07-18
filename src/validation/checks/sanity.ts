import type { List } from '../../list/models/list';
import type { Game } from '../../parser/models/game';
import type { ListValidator } from '../validator';

// Checks in this file aren't really rules. They are checks to see if
// things in the list are valid parts of the dataset. Things like this might
// be triggered from import or manual edit, but shouldn't be triggered by UI actions.

export const sanityChecks: ListValidator[] = [validArmySelections, validGameSelections];

function validArmySelections(list: List, game: Game): string[] {
  const army = game.armies.get(list.faction);
  if (!army) {
    return [`Army "${list.faction}" not found in game data.`];
  }

  const errors: string[] = [];

  // formation
  // armies of renown do not have formations
  if (!army.isArmyOfRenown) {
    if (list.formation && list.formation === '') {
      errors.push('Formation must be selected.');
    } else {
      const formation = army.formations.get(list.formation);
      if (!formation) {
        errors.push(`${list.formation} is not a valid formation for army ${list.faction}.`);
      }
    }
  }

  // lores
  if (list.spellLore && list.spellLore !== '') {
    const lore = army.spellLores.get(list.spellLore);
    if (!lore) {
      errors.push(`${list.spellLore} is not a valid lore for army ${list.faction}.`);
    }
  }

  if (list.prayerLore && list.prayerLore !== '') {
    const lore = army.prayerLores.get(list.prayerLore);
    if (!lore) {
      errors.push(`${list.prayerLore} is not a valid prayer lore for army ${list.faction}.`);
    }
  }

  if (list.manifestationLore && list.manifestationLore !== '') {
    const lore =
      army.manifestationLores.get(list.manifestationLore) ||
      game.universalManifestationLores.get(list.manifestationLore);
    if (!lore) {
      errors.push(
        `${list.manifestationLore} is not a valid manifestation lore for army ${list.faction}.`
      );
    }
  }

  // faction terrain
  if (list.factionTerrain && list.factionTerrain !== '') {
    const terrain = army.battleProfiles.get(list.factionTerrain);
    if (!terrain) {
      errors.push(
        `${list.factionTerrain} is not a valid faction terrain for army ${list.faction}.`
      );
    }
  }

  // units
  const units = list.allUnits();
  for (const unit of units) {
    if (unit.name === '') continue; // skip empty units

    if (!army.battleProfiles.has(unit.name)) {
      errors.push(`${unit.name} is not a valid unit for army ${list.faction}.`);
    }

    if (unit.artifact && unit.artifact !== '') {
      const artifact = Array.from(army.artifacts.values()).find((a) =>
        a.enhancements.some((e) => e.ability.name === unit.artifact)
      );
      if (!artifact) {
        errors.push(`${unit.artifact} is not a valid artifact for army ${list.faction}.`);
      }
    }

    if (unit.heroicTrait && unit.heroicTrait !== '') {
      const trait = Array.from(army.heroicTraits.values()).find((t) =>
        t.enhancements.some((e) => e.ability.name === unit.heroicTrait)
      );
      if (!trait) {
        errors.push(`${unit.heroicTrait} is not a valid heroic trait for army ${list.faction}.`);
      }
    }

    if (unit.enhancements.size > 0) {
      for (const [table, enhancement] of unit.enhancements.entries()) {
        const tableData = army.enhancements.get(table);
        if (!tableData) {
          errors.push(`${table} is not a valid enhancement table for army ${list.faction}.`);
          continue;
        }
        if (!tableData.enhancements.find((e) => e.ability.name === enhancement)) {
          errors.push(
            `${enhancement} is not a valid enhancement for table ${table} in army ${list.faction}.`
          );
        }
      }
    }
  }

  return errors;
}

function validGameSelections(list: List, game: Game): string[] {
  if (list.validator === 'holy havoc') return []; // no tactics in holy havoc

  const errors: string[] = [];
  if (!list.battleTacticCard1 || !list.battleTacticCard2) {
    return ['Must select two battle tactic cards.'];
  }

  if (game.battleTacticCards.find((card) => card.name === list.battleTacticCard1) === undefined) {
    errors.push(`${list.battleTacticCard1} is not a valid battle tactic card.`);
  }
  if (game.battleTacticCards.find((card) => card.name === list.battleTacticCard2) === undefined) {
    errors.push(`${list.battleTacticCard2} is not a valid battle tactic card.`);
  }

  // can not have the same battle tactic card twice
  if (list.battleTacticCard1 === list.battleTacticCard2) {
    errors.push('Battle tactic cards must be different.');
  }
  return errors;
}
