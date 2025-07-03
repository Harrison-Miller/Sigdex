import type { Army } from '../common/ArmyData';
import type { List } from '../common/ListData';
import type { Lore } from '../common/ManifestationData';
import type { Ability } from '../common/Ability';

/**
 * Calculates the total points for a list by summing the points of all units in all regiments (including leaders),
 * using the provided army data. Units not found in the army data are ignored.
 * @param list The list to calculate points for
 * @param army The loaded Army data (from loadArmy)
 * @param lores The loaded lores data (from loadLores) [currently unused, but included for future lore-based points]
 * @returns The total points for the list
 */
export function calculatePoints(list: List, army: Army, lores?: Map<string, Lore>): number {
  if (!list || !army) return 0;
  let total = 0;
  const allUnits = army.units || [];
  // Helper to find a unit's points by name
  const getPoints = (name: string): number => {
    const unit = allUnits.find((u) => u.name === name);
    return unit && typeof unit.points === 'number' ? unit.points : 0;
  };
  // Helper to get heroic trait, artifact, or enhancement points by name from Map<string, Ability[]>
  const getAbilityPoints = (name: string, map?: Map<string, Ability[]>) => {
    if (!name || !map) return 0;
    for (const arr of map.values()) {
      for (const ability of arr) {
        if (ability.name === name && typeof ability.points === 'number') {
          return ability.points;
        }
      }
    }
    return 0;
  };

  // Helper to get enhancement points from enhancementTables
  const getEnhancementPoints = (
    enhancements: Map<string, string> | undefined,
    enhancementTables: Map<string, Ability[]>
  ) => {
    if (!enhancements) return 0;
    let sum = 0;
    for (const [tableName, enhancementName] of enhancements.entries()) {
      const table = enhancementTables.get(tableName);
      if (table) {
        const found = table.find((a) => a.name === enhancementName && typeof a.points === 'number');
        if (found) sum += found.points!;
      }
    }
    return sum;
  };
  for (const regiment of list.regiments) {
    if (regiment.leader) {
      total += getPoints(regiment.leader.name);
      // Add heroic trait, artifact, and enhancement points for leader
      if (regiment.leader.heroic_trait) {
        total += getAbilityPoints(regiment.leader.heroic_trait, army.heroicTraits);
      }
      if (regiment.leader.artifact) {
        total += getAbilityPoints(regiment.leader.artifact, army.artifacts);
      }
      if (regiment.leader.enhancements) {
        total += getEnhancementPoints(regiment.leader.enhancements, army.enhancementTables);
      }
    }
    for (const unit of regiment.units) {
      let unitPoints = getPoints(unit.name);
      if (unit.reinforced) {
        unitPoints *= 2;
      }
      total += unitPoints;
      // Add heroic trait, artifact, and enhancement points for unit
      if (unit.heroic_trait) {
        total += getAbilityPoints(unit.heroic_trait, army.heroicTraits);
      }
      if (unit.artifact) {
        total += getAbilityPoints(unit.artifact, army.artifacts);
      }
      if (unit.enhancements) {
        total += getEnhancementPoints(unit.enhancements, army.enhancementTables);
      }
    }
  }

  // Add points for auxiliary units
  if (list.auxiallary_units) {
    for (const unit of list.auxiallary_units) {
      let unitPoints = getPoints(unit.name);
      if (unit.reinforced) {
        unitPoints *= 2;
      }
      total += unitPoints;
      // Add heroic trait, artifact, and enhancement points for aux unit
      if (unit.heroic_trait) {
        total += getAbilityPoints(unit.heroic_trait, army.heroicTraits);
      }
      if (unit.artifact) {
        total += getAbilityPoints(unit.artifact, army.artifacts);
      }
      if (unit.enhancements) {
        total += getEnhancementPoints(unit.enhancements, army.enhancementTables);
      }
    }
  }

  // Add points for faction terrain if present
  if (list.faction_terrain) {
    total += getPoints(list.faction_terrain);
  }
  // Add points for spell lore if present
  if (army.spellLores && Array.isArray(army.spellLores)) {
    if (list.spell_lore) {
      const spellLore = army.spellLores.find((l: any) => l.name === list.spell_lore);
      if (spellLore && typeof spellLore.points === 'number') {
        total += spellLore.points;
      }
    }
  }
  // Add points for prayer lore if present
  if (army.prayerLores && Array.isArray(army.prayerLores)) {
    if (list.prayer_lore) {
      const prayerLore = army.prayerLores.find((l: any) => l.name === list.prayer_lore);
      if (prayerLore && typeof prayerLore.points === 'number') {
        total += prayerLore.points;
      }
    }
  }
  // Add points for manifestation lore if present, using lores Map
  if (list.manifestation_lore && lores) {
    const lore = lores.get(list.manifestation_lore);
    if (lore && typeof lore.points === 'number') {
      total += lore.points;
    }
  }
  return total;
}
