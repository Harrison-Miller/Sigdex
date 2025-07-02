import type { Army } from '../../common/ArmyData';
import type { List, ListRegiment, ListUnit } from '../../common/ListData';
import type { Lore } from '../../common/ManifestationData';
import type { Unit } from '../../common/UnitData';
import { calculatePoints } from '../../utils/points-manager';
import { SIGDEX_VERSION } from '../../version';

function calculateDrops(list: List): number {
  if (!list || !list.regiments) return 0;
  let drops = list.regiments.length + (list.auxiallary_units?.length || 0);
  return drops;
}

function getUnitData(unitName: string, army: Army): Unit | undefined {
  if (!unitName || !army.units) return undefined;
  return army.units.find((u) => u.name === unitName);
}

function calculateWounds(list: List, army: Army): number {
  if (!list || !list.regiments || !army.units) return 0;
  let totalWounds = 0;
  for (const regiment of list.regiments) {
    if (regiment.leader) {
      const leaderUnit = getUnitData(regiment.leader.name, army);
      if (leaderUnit) {
        totalWounds += leaderUnit.stats.health;
      }
    }
    for (const unit of regiment.units) {
      const unitData = getUnitData(unit.name, army);
      if (unitData) {
        totalWounds += unitData.stats.health;
      }
    }
  }

  // aux
  for (const unit of list.auxiallary_units || []) {
    const unitData = getUnitData(unit.name, army);
    if (unitData) {
      totalWounds += unitData.stats.health;
    }
  }

  // we don't count faction terrain
  return totalWounds;
}

function getArtifactPoints(artifact: string, army: Army): number {
  if (!artifact || !army.artifacts) return 0;
  for (const abilities of army.artifacts.values()) {
    for (const ability of abilities) {
      if (ability.name === artifact) {
        return ability.points || 0; // Return points if defined, otherwise 0
      }
    }
  }
  return 0; // Fallback if artifact not found
}

function getHeroicTraitPoints(trait: string, army: Army): number {
  if (!trait || !army.heroicTraits) return 0;
  for (const abilities of army.heroicTraits.values()) {
    for (const ability of abilities) {
      if (ability.name === trait) {
        return ability.points || 0; // Return points if defined, otherwise 0
      }
    }
  }
  return 0; // Fallback if trait not found
}

function getEnhancementPoints(enhancement: string, army: Army): number {
  if (!enhancement || !army.enhancementTables) return 0;
  for (const [tableName, enhancements] of army.enhancementTables.entries()) {
    if (enhancement === tableName) {
      return enhancements.reduce((sum, enh) => sum + (enh.points || 0), 0);
    }
  }
  return 0; // Fallback if enhancement not found
}

function getLorePoints(lore: string, lores?: Map<string, Lore>): number {
  if (!lore || !lores) return 0;
  const loreData = lores.get(lore);
  if (!loreData) return 0; // Fallback if lore not found
  return loreData.points || 0; // Return points if defined, otherwise 0
}

function displayUnit(unit: ListUnit, army: Army): string {
  if (!unit) return '';
  const unitData = getUnitData(unit.name, army);
  if (!unitData) return `${unit.name} (not found in army)`; // Fallback if unit not found

  let out = `${unit.name}`;
  if (unitData.points) {
    out += ` (${unitData.points})`; // Add points if available
  }
  out += '\n';

  // bullet point (use special bullet point character) list of things
  // general > reinforced > weapon options > heroic trait > artifact > enhancements
  if (unit.general) {
    out += '• General\n';
  }
  if (unit.reinforced) {
    out += '• Reinforced\n';
  }
  // weapon options
  for (const [_, weaponOptions] of unit.weapon_options || new Map()) {
    for (const option of weaponOptions) {
      if (option.count) {
        out += `• ${option.count}x ${option.name}\n`;
      } else {
        out += `• ${option.name}\n`;
      }
    }
  }

  // artifact then heroic trait
  if (unit.artifact) {
    const artifactPoints = getArtifactPoints(unit.artifact, army);
    out += `• ${unit.artifact}`;
    if (artifactPoints > 0) {
      out += ` (${artifactPoints})\n`;
    } else {
      out += '\n'; // No points, just the name
    }
  }
  if (unit.heroic_trait) {
    const heroicTraitPoints = getHeroicTraitPoints(unit.heroic_trait, army);
    out += `• ${unit.heroic_trait}`;
    if (heroicTraitPoints > 0) {
      out += ` (${heroicTraitPoints})\n`;
    } else {
      out += '\n'; // No points, just the name
    }
  }
  if (unit.enhancements) {
    for (const [_, enhancement] of unit.enhancements) {
      const enhancementPoints = getEnhancementPoints(enhancement, army);
      out += `• ${enhancement}`;
      if (enhancementPoints > 0) {
        out += ` (${enhancementPoints})\n`;
      } else {
        out += '\n'; // No points, just the name
      }
    }
  }

  return out;
}

function displayRegiment(regiment: ListRegiment, army: Army): string {
  let out = '';
  if (regiment.leader) {
    out += `${displayUnit(regiment.leader, army)}`;
  }

  for (const unit of regiment.units) {
    out += `${displayUnit(unit, army)}`;
  }

  return out;
}

export function exportList(list: List, army: Army, lores?: Map<string, Lore>): string {
  let out = '';

  const points = calculatePoints(list, army, lores);

  // name and points
  out += `${list.name} ${points}/2000 pts\n\n`;
  out += `${list.faction}\n${list.formation}\n`;
  out += `General's Handbook 2025-26\n`; // TODO: actually have ghb version selection that leads to different rules
  out += `Drops: ${calculateDrops(list)}\n`;
  out += `Wounds: ${calculateWounds(list, army)}\n`;

  // lores
  if (list.spell_lore) {
    out += `Spell Lore - ${list.spell_lore}`;
    const spellPoints = getLorePoints(list.spell_lore, lores);
    if (spellPoints > 0) {
      out += ` (${spellPoints})\n`;
    } else {
      out += `\n`;
    }
  }
  if (list.prayer_lore) {
    out += `Prayer Lore - ${list.prayer_lore}`;
    const prayerPoints = getLorePoints(list.prayer_lore, lores);
    if (prayerPoints > 0) {
      out += ` (${prayerPoints})\n`;
    } else {
      out += `\n`;
    }
  }
  if (list.manifestation_lore) {
    out += `Manifestation Lore - ${list.manifestation_lore}`;
    const manifestationPoints = getLorePoints(list.manifestation_lore, lores);
    if (manifestationPoints > 0) {
      out += ` (${manifestationPoints})\n`;
    } else {
      out += `\n`;
    }
  }

  // TODO: add battle tactic cards or grand starts based on ghb version

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
    out += `${displayRegiment(generalsRegiment, army)}\n`;
  }

  // display the rest of the regiments
  let regimentIdx = 1;
  for (let i = 0; i < list.regiments.length; i++) {
    if (i === generalRegimentIdx) continue; // skip the general's regiment
    out += `Regiment ${regimentIdx++}\n`;
    out += `${displayRegiment(list.regiments[i], army)}\n`;
  }

  // faction terrain
  if (list.faction_terrain) {
    const terrainUnit = army.units.find((u) => u.name === list.faction_terrain);
    if (terrainUnit) {
      out += `Faction Terrain\n`;
      out += `${terrainUnit.name}`;
      if (terrainUnit.points) {
        out += ` (${terrainUnit.points})\n`;
      } else {
        out += '\n'; // No points, just the name
      }
    }
  }

  // app info
  out += `\n\nCreated with Sigdex: https://sigdex.io/\n`;
  out += `Version: ${SIGDEX_VERSION}\n`;

  return out;
}
