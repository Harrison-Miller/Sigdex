import type { List } from '../../list/models/list';
import type { ListRegiment } from '../../list/models/regiment';
import type { ListUnit } from '../../list/models/unit';
import type { Army } from '../../parser/models/army';
import type { Game } from '../../parser/models/game';
import { calculatePoints } from '../../validation/points';
import { SIGDEX_VERSION } from '../../version';

function calculateDrops(list: List): number {
  if (!list || !list.regiments) return 0;
  let drops = list.regiments.length;
  drops += list.auxiliaryUnits.length;
  drops += list.regimentOfRenown ? 1 : 0; // count RoR as a drop
  return drops;
}

function calculateWounds(list: List, game: Game): number {
  if (!list || !list.regiments) return 0;
  let totalWounds = list.allUnits().reduce((sum, unit) => {
    const unitData = game.units.get(unit.name);
    if (!unitData) return sum; // skip if unit data not found
    return sum + unitData.totalWounds(unit.reinforced);
  }, 0);

  if (list.regimentOfRenown) {
    for (const unit of list.regimentOfRenownUnits) {
      const unitData = game.units.get(unit.name);
      if (!unitData) continue; // skip if unit data not found
      totalWounds += unitData.totalWounds();
    }
  }

  // we don't count faction terrain
  return totalWounds;
}

function getArtifactPoints(artifact: string, army: Army): number {
  if (!artifact || !army.artifacts) return 0;
  for (const [_, table] of army.artifacts) {
    for (const enhancement of table.enhancements) {
      if (enhancement.ability.name === artifact) {
        return enhancement.points;
      }
    }
  }
  return 0; // Fallback if artifact not found
}

function getHeroicTraitPoints(trait: string, army: Army): number {
  if (!trait || !army.heroicTraits) return 0;
  for (const [_, table] of army.heroicTraits) {
    for (const enhancement of table.enhancements) {
      if (enhancement.ability.name === trait) {
        return enhancement.points;
      }
    }
  }
  return 0; // Fallback if trait not found
}

function getEnhancementPoints(enhancement: string, army: Army): number {
  if (!enhancement || army.enhancements.size === 0) return 0;
  for (const [_, table] of army.enhancements) {
    for (const enh of table.enhancements) {
      if (enh.ability.name === enhancement) {
        return enh.points; // Return points if found
      }
    }
  }
  return 0; // Fallback if enhancement not found
}

function displayWithPoints(text: string, points: number | undefined): string {
  if (points && points > 0) {
    return `${text} (${points})\n`; // Add points if available
  }
  return `${text}\n`; // No points, just the name
}

function displayUnit(unit: ListUnit, army: Army, game: Game, noPoints: boolean = false): string {
  if (!unit) return '';
  const unitData = game.units.get(unit.name);
  const bp = army.battleProfiles.get(unit.name);
  if (!unitData) return `${unit.name} (not found in army)`; // Fallback if unit not found

  const points = noPoints ? 0 : (bp?.points || 0) * (unit.reinforced ? 2 : 1);
  let out = displayWithPoints(unitData.name, points);

  // bullet point (use special bullet point character) list of things
  // general > reinforced > weapon options > heroic trait > artifact > enhancements
  if (unit.general) {
    out += '• General\n';
  }
  if (unit.reinforced) {
    out += '• Reinforced\n';
  }
  // weapon options
  for (const [modelGroup, weaponOptions] of unit.weaponOptions || new Map()) {
    for (const option of weaponOptions) {
      // look up weapon option in unitData
      // const weaponData = findWeaponOption(modelGroup, option.name, unitData);
      const modelGroupData = unitData.models.get(modelGroup);
      if (!modelGroupData) continue; // Skip if model group not found in unit data
      const optionData = modelGroupData.weapons?.get(option.name);
      if (!optionData) continue; // Skip if option not found in unit data
      const modelGroupCount = modelGroupData.count || 1;

      if (optionData.type === 'default') continue; // Skip because default weapon

      // the max for a grouped weapon is the modelGroup count * 2 if reinforced
      const maxCount =
        (optionData.max ? optionData.max : modelGroupCount || 1) * (unit.reinforced ? 2 : 1);
      const count = Math.min(option.count, maxCount);

      out += '• ';
      if (count > 1) {
        out += `${count}x `;
      }
      out += `${option.name}\n`;
    }
  }

  // artifact then heroic trait
  if (unit.artifact) {
    const artifactPoints = getArtifactPoints(unit.artifact, army);
    out += displayWithPoints(`• ${unit.artifact}`, artifactPoints);
  }
  if (unit.heroicTrait) {
    const heroicTraitPoints = getHeroicTraitPoints(unit.heroicTrait, army);
    out += displayWithPoints(`• ${unit.heroicTrait}`, heroicTraitPoints);
  }
  if (unit.enhancements) {
    for (const [_, enhancement] of unit.enhancements) {
      const enhancementPoints = getEnhancementPoints(enhancement, army);
      out += displayWithPoints(`• ${enhancement}`, enhancementPoints);
    }
  }

  return out;
}

function displayRegiment(regiment: ListRegiment, army: Army, game: Game): string {
  let out = '';
  if (regiment.leader) {
    out += `${displayUnit(regiment.leader, army, game)}`;
  }

  for (const unit of regiment.units) {
    out += `${displayUnit(unit, army, game)}`;
  }

  return out;
}

export function exportList(list: List, game: Game): string {
  let out = '';

  const army = game.armies.get(list.faction);
  if (!army) {
    console.error(`Army not found for faction: ${list.faction}`);
    throw new Error(`Army not found for faction: ${list.faction}`);
  }

  const points = calculatePoints(list, game);

  // name and points
  out += `${list.name} ${points}/2000 pts\n\n`;

  if (army.isArmyOfRenown) {
    const aorName = army.name.split(' - ')[1]; // Get the name before the " - "
    out += `${army.baseArmyName} | ${aorName}\n`;
    out += `Army of Renown\n`;
  } else {
    out += `${list.faction}\n${list.formation}\n`;
  }
  out += 'General\'s Handbook 2025-26\n'; // TODO: actually have ghb version selection that leads to different rules
  out += `Drops: ${calculateDrops(list)}\n`;
  out += `Wounds: ${calculateWounds(list, game)}\n`;

  // lores
  if (list.spellLore) {
    const spellPoints = army.spellLores.get(list.spellLore)?.points || 0;
    out += displayWithPoints(`Spell Lore - ${list.spellLore}`, spellPoints);
  }
  if (list.prayerLore) {
    const prayerPoints = army.prayerLores.get(list.prayerLore)?.points || 0;
    out += displayWithPoints(`Prayer Lore - ${list.prayerLore}`, prayerPoints);
  }
  if (list.manifestationLore) {
    const manifestationPoints =
      army.manifestationLores.get(list.manifestationLore)?.points ||
      game.universalManifestationLores.get(list.manifestationLore)?.points ||
      0;
    out += displayWithPoints(`Manifestation Lore - ${list.manifestationLore}`, manifestationPoints);
  }

  const cards: string[] = [list.battleTacticCard1, list.battleTacticCard2].filter(Boolean);
  if (cards.length > 0) {
    out += '\nBattle Tactic Cards: ';
    out += `${cards.join(', ')}\n`;
  }

  // display the general
  // get general's regiment idx
  let generalRegimentIdx = -1;
  const generalsRegiment = list.regiments.find((reg, idx) => {
    if (reg.leader && reg.leader.general) {
      generalRegimentIdx = idx;
      return true;
    }
    return false;
  });

  if (generalRegimentIdx >= 0 && generalsRegiment) {
    out += '\nGeneral\'s Regiment\n';
    out += `${displayRegiment(generalsRegiment, army, game)}\n`;
  }

  // display the rest of the regiments
  let regimentIdx = 1;
  for (let i = 0; i < list.regiments.length; i++) {
    if (i === generalRegimentIdx) continue; // skip the general's regiment
    out += `Regiment ${regimentIdx++}\n`;
    out += `${displayRegiment(list.regiments[i], army, game)}\n`;
  }

  // auxiliary units
  if (list.auxiliaryUnits && list.auxiliaryUnits.length > 0) {
    out += 'Auxiliary Units\n';
    for (const auxUnit of list.auxiliaryUnits) {
      out += `${displayUnit(auxUnit, army, game)}`;
    }
    out += '\n';
  }

  // faction terrain
  if (list.factionTerrain) {
    out += 'Faction Terrain\n';
    const terrainPoints = army.battleProfiles.get(list.factionTerrain)?.points || 0;
    out += displayWithPoints(list.factionTerrain, terrainPoints);
    out += '\n';
  }

  if (list.regimentOfRenown) {
    const ror = game.regimentsOfRenown.get(list.regimentOfRenown);
    out += 'Regiments of Renown\n';
    out += displayWithPoints(list.regimentOfRenown, ror?.points || 0);
    for (const unit of list.regimentOfRenownUnits) {
      out += `${displayUnit(unit, army, game, true)}`;
    }
    out += '\n';
  }

  // app info
  out += '\nCreated with Sigdex: https://sigdex.io/\n';
  out += `Version: ${SIGDEX_VERSION}\n`;

  return out;
}
