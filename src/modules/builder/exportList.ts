import type { Army } from '../../common/ArmyData';
import type { List, ListRegiment, ListUnit } from '../../common/ListData';
import type { Lore } from '../../common/ManifestationData';
import type { Unit, WeaponOption } from '../../common/UnitData';
import { calculatePoints } from '../../utils/points-manager';
import { SIGDEX_VERSION } from '../../version';

function calculateDrops(list: List): number {
  if (!list || !list.regiments) return 0;
  let drops = list.regiments.length + (list.auxiliary_units?.length || 0);
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
        totalWounds +=
          leaderUnit.stats.health *
          (leaderUnit.unit_size || 1) *
          (regiment.leader.reinforced ? 2 : 1);
      }
    }
    for (const unit of regiment.units) {
      const unitData = getUnitData(unit.name, army);
      if (unitData) {
        totalWounds +=
          unitData.stats.health * (unitData.unit_size || 1) * (unit.reinforced ? 2 : 1);
      }
    }
  }

  // aux
  for (const unit of list.auxiliary_units || []) {
    const unitData = getUnitData(unit.name, army);
    if (unitData) {
      totalWounds += unitData.stats.health * (unitData.unit_size || 1) * (unit.reinforced ? 2 : 1);
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

function displayWithPoints(text: string, points: number | undefined): string {
  if (points && points > 0) {
    return `${text} (${points})\n`; // Add points if available
  }
  return `${text}\n`; // No points, just the name
}

function displayUnit(unit: ListUnit, army: Army): string {
  if (!unit) return '';
  const unitData = getUnitData(unit.name, army);
  if (!unitData) return `${unit.name} (not found in army)`; // Fallback if unit not found

  let out = displayWithPoints(unitData.name, (unitData.points || 0) * (unit.reinforced ? 2 : 1));

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
      const weaponData = findWeaponOption(modelGroup, option.name, unitData);
      if (!weaponData) continue; // Skip if option not found in unit data
      const optionData = weaponData.optionData;
      const modelGroupCount = weaponData.modelGroupCount;

      if (!optionData.max && !optionData.replaces && !optionData.group) continue; // Skip because default weapon

      // the max for a grouped weapon is the modelGroup count * 2 if reinforced
      const maxCount =
        (optionData.max ? optionData.max : modelGroupCount || 1) * (unit.reinforced ? 2 : 1);
      const count = Math.min(option.count, maxCount);
      if (option.count > count) {
        console.warn(
          `Warning: Unit ${unit.name} has weapon option ${option.name} with count ${option.count}, but max is ${maxCount}. Adjusting to ${count}.`
        );
        console.log(`Original option:`, option);
        console.log(`Option data:`, optionData);
        console.log(`Model group:`, modelGroup);
      }

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

function findWeaponOption(
  modelGroup: string,
  optionName: string,
  unitData: Unit
): { optionData: WeaponOption; modelGroupCount: number } | undefined {
  if (!unitData.models) return undefined;
  const model = unitData.models.find((m) => m.name === modelGroup);
  if (!model || model.weapons.length === 0) return undefined;
  const option = model.weapons.find((opt) => opt.name === optionName);
  if (!option) return undefined;
  return { optionData: option, modelGroupCount: model.count || 1 };
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
    const spellPoints = getLorePoints(list.spell_lore, lores);
    out += displayWithPoints(`Spell Lore - ${list.spell_lore}`, spellPoints);
  }
  if (list.prayer_lore) {
    const prayerPoints = getLorePoints(list.prayer_lore, lores);
    out += displayWithPoints(`Prayer Lore - ${list.prayer_lore}`, prayerPoints);
  }
  if (list.manifestation_lore) {
    const manifestationPoints = getLorePoints(list.manifestation_lore, lores);
    out += displayWithPoints(
      `Manifestation Lore - ${list.manifestation_lore}`,
      manifestationPoints
    );
  }

  if (list.battle_tactics && list.battle_tactics.length > 0) {
    out += `\nBattle Tactic Cards: ${list.battle_tactics.join(', ')}\n`;
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

  // auxiliary units
  if (list.auxiliary_units && list.auxiliary_units.length > 0) {
    out += `Auxiliary Units\n`;
    for (const auxUnit of list.auxiliary_units) {
      out += `${displayUnit(auxUnit, army)}`;
    }
    out += `\n`;
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
