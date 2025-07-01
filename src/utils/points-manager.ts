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
  // Helper to get heroic trait or artifact points by name from Map<string, Ability[]>
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
  for (const regiment of list.regiments) {
    if (regiment.leader) {
      total += getPoints(regiment.leader.name);
      // Add heroic trait and artifact points for leader
      if (regiment.leader.heroic_trait) {
        total += getAbilityPoints(regiment.leader.heroic_trait, army.heroicTraits);
      }
      if (regiment.leader.artifact) {
        total += getAbilityPoints(regiment.leader.artifact, army.artifacts);
      }
    }
    for (const unit of regiment.units) {
      let unitPoints = getPoints(unit.name);
      if (unit.reinforced) {
        unitPoints *= 2;
      }
      total += unitPoints;
      // Add heroic trait and artifact points for unit
      if (unit.heroic_trait) {
        total += getAbilityPoints(unit.heroic_trait, army.heroicTraits);
      }
      if (unit.artifact) {
        total += getAbilityPoints(unit.artifact, army.artifacts);
      }
    }
  }
  if (list.auxiallary_units) {
    for (const unit of list.auxiallary_units) {
      let unitPoints = getPoints(unit.name);
      if (unit.reinforced) {
        unitPoints *= 2;
      }
      total += unitPoints;
      // Add heroic trait and artifact points for aux unit
      if (unit.heroic_trait) {
        total += getAbilityPoints(unit.heroic_trait, army.heroicTraits);
      }
      if (unit.artifact) {
        total += getAbilityPoints(unit.artifact, army.artifacts);
      }
    }
  }
  // Optionally, add points for auxiallary_units if present
  if (list.auxiallary_units) {
    for (const unit of list.auxiallary_units) {
      let unitPoints = getPoints(unit.name);
      if (unit.reinforced) {
        unitPoints *= 2;
      }
      total += unitPoints;
      // Add heroic trait and artifact points for aux units
      if (unit.heroic_trait && army.heroicTraits && army.heroicTraits instanceof Map) {
        let found = false;
        for (const arr of army.heroicTraits.values()) {
          for (const ability of arr) {
            if (ability.name === unit.heroic_trait && typeof ability.points === 'number') {
              total += ability.points;
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }
      if (unit.artifact && army.artifacts && army.artifacts instanceof Map) {
        let found = false;
        for (const arr of army.artifacts.values()) {
          for (const ability of arr) {
            if (ability.name === unit.artifact && typeof ability.points === 'number') {
              total += ability.points;
              found = true;
              break;
            }
          }
          if (found) break;
        }
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
