import type { List, ListRegiment, ListUnit } from '../../common/ListData';
import type { IArmy } from '../../parser/v3/models/army';
import type { IGame } from '../../parser/v3/models/game';
import { calculatePoints } from '../../utils/points-manager';
import { SIGDEX_VERSION } from '../../version';

function calculateDrops(list: List): number {
  if (!list || !list.regiments) return 0;
  let drops = list.regiments.length + (list.auxiliary_units?.length || 0);
  return drops;
}

function calculateWounds(list: List, game: IGame): number {
  if (!list || !list.regiments) return 0;
  let totalWounds = 0;
  for (const regiment of list.regiments) {
    if (regiment.leader) {
      const leaderUnit = game.units.get(regiment.leader.name);
      if (leaderUnit) {
        totalWounds +=
          Number(leaderUnit.stats.health) *
          (leaderUnit.unitSize || 1) *
          (regiment.leader.reinforced ? 2 : 1);
      }
    }
    for (const unit of regiment.units) {
      const unitData = game.units.get(unit.name);
      if (unitData) {
        totalWounds +=
          Number(unitData.stats.health) * (unitData.unitSize || 1) * (unit.reinforced ? 2 : 1);
      }
    }
  }

  // aux
  for (const unit of list.auxiliary_units || []) {
    const unitData = game.units.get(unit.name);
    if (unitData) {
      totalWounds +=
        Number(unitData.stats.health) * (unitData.unitSize || 1) * (unit.reinforced ? 2 : 1);
    }
  }

  // we don't count faction terrain
  return totalWounds;
}

function getArtifactPoints(artifact: string, army: IArmy): number {
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

function getHeroicTraitPoints(trait: string, army: IArmy): number {
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

function getEnhancementPoints(enhancement: string, army: IArmy): number {
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

function displayUnit(unit: ListUnit, army: IArmy, game: IGame): string {
  if (!unit) return '';
  const unitData = game.units.get(unit.name);
  const bp = army.battleProfiles.get(unit.name);
  if (!unitData || !bp) return `${unit.name} (not found in army)`; // Fallback if unit not found

  let out = displayWithPoints(unitData.name, (bp.points || 0) * (unit.reinforced ? 2 : 1));

  // bullet point (use special bullet point character) list of things
  // general > reinforced > weapon options > heroic trait > artifact > enhancements
  if (unit.general) {
    out += '• General\n';
  }
  if (unit.reinforced) {
    out += '• Reinforced\n';
  }
  // weapon options
  for (const [modelGroup, weaponOptions] of unit.weapon_options || new Map()) {
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

      out += `• `;
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
  if (unit.heroic_trait) {
    const heroicTraitPoints = getHeroicTraitPoints(unit.heroic_trait, army);
    out += displayWithPoints(`• ${unit.heroic_trait}`, heroicTraitPoints);
  }
  if (unit.enhancements) {
    for (const [_, enhancement] of unit.enhancements) {
      const enhancementPoints = getEnhancementPoints(enhancement, army);
      out += displayWithPoints(`• ${enhancement}`, enhancementPoints);
    }
  }

  return out;
}

function displayRegiment(regiment: ListRegiment, army: IArmy, game: IGame): string {
  let out = '';
  if (regiment.leader) {
    out += `${displayUnit(regiment.leader, army, game)}`;
  }

  for (const unit of regiment.units) {
    out += `${displayUnit(unit, army, game)}`;
  }

  return out;
}

export function exportList(list: List, game: IGame): string {
  let out = '';

  const army = game.armies.get(list.faction);
  if (!army) {
    console.error(`Army not found for faction: ${list.faction}`);
    throw new Error(`Army not found for faction: ${list.faction}`);
  }

  const points = calculatePoints(list, army, game.universalManifestationLores);

  // name and points
  out += `${list.name} ${points}/2000 pts\n\n`;
  out += `${list.faction}\n${list.formation}\n`;
  out += `General's Handbook 2025-26\n`; // TODO: actually have ghb version selection that leads to different rules
  out += `Drops: ${calculateDrops(list)}\n`;
  out += `Wounds: ${calculateWounds(list, game)}\n`;

  // lores
  if (list.spell_lore) {
    const spellPoints = army.spellLores.get(list.spell_lore)?.points || 0;
    out += displayWithPoints(`Spell Lore - ${list.spell_lore}`, spellPoints);
  }
  if (list.prayer_lore) {
    const prayerPoints = army.prayerLores.get(list.prayer_lore)?.points || 0;
    out += displayWithPoints(`Prayer Lore - ${list.prayer_lore}`, prayerPoints);
  }
  if (list.manifestation_lore) {
    const manifestationPoints =
      army.manifestationLores.get(list.manifestation_lore)?.points ||
      game.universalManifestationLores.get(list.manifestation_lore)?.points ||
      0;
    out += displayWithPoints(
      `Manifestation Lore - ${list.manifestation_lore}`,
      manifestationPoints
    );
  }

  if (list.battle_tactics && list.battle_tactics.length > 0) {
    out += `\nBattle Tactic Cards: ${list.battle_tactics.join(', ')}\n`;
  }

  // display the general
  // get general's regiment idx
  let generalRegimentIdx = -1;
  let generalsRegiment = list.regiments.find((reg, idx) => {
    if (reg.leader && reg.leader.general) {
      generalRegimentIdx = idx;
      return true;
    }
    return false;
  });

  if (generalRegimentIdx >= 0 && generalsRegiment) {
    out += `\nGeneral's Regiment\n`;
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
  if (list.auxiliary_units && list.auxiliary_units.length > 0) {
    out += `Auxiliary Units\n`;
    for (const auxUnit of list.auxiliary_units) {
      out += `${displayUnit(auxUnit, army, game)}`;
    }
    out += `\n`;
  }

  // faction terrain
  if (list.faction_terrain) {
    out += `Faction Terrain\n`;
    const terrainPoints = army.battleProfiles.get(list.faction_terrain)?.points || 0;
    out += displayWithPoints(list.faction_terrain, terrainPoints);
  }

  // app info
  out += `\n\nCreated with Sigdex: https://sigdex.io/\n`;
  out += `Version: ${SIGDEX_VERSION}\n`;

  return out;
}
