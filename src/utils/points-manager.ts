import type { List } from '../common/ListData';
import type { ILore } from '../parser/v3/models/lore';
import type { IArmy, IEnhancementTable } from '../parser/v3/models/army';

/**
 * Calculates the total points for a list by summing the points of all units in all regiments (including leaders),
 * using the provided army data. Units not found in the army data are ignored.
 * @param list The list to calculate points for
 * @param army The loaded Army data (from loadArmy)
 * @param lores The loaded lores data (from loadLores) [currently unused, but included for future lore-based points]
 * @returns The total points for the list
 */
export function calculatePoints(
  list: List,
  army: IArmy,
  universalManifestationLores: Map<string, ILore>
): number {
  if (!list || !army) return 0;
  let total = 0;

  // Helper to get heroic trait, artifact, or enhancement points by name from Map<string, IEnhancementTable>
  const getEnhancementPoints = (name: string, tables: Map<string, IEnhancementTable>) => {
    for (const [_, table] of tables.entries()) {
      const found = table.enhancements.find((a) => a.ability.name === name);
      return found ? found.points : 0;
    }
    return 0;
  };

  for (const regiment of list.regiments) {
    if (regiment.leader) {
      total += army.battleProfiles.get(regiment.leader.name)?.points || 0;
      // Add heroic trait, artifact, and enhancement points for leader
      if (regiment.leader.heroic_trait) {
        total += getEnhancementPoints(regiment.leader.heroic_trait, army.heroicTraits);
      }
      if (regiment.leader.artifact) {
        total += getEnhancementPoints(regiment.leader.artifact, army.artifacts);
      }
      if (regiment.leader.enhancements) {
        for (const [_, enhancement] of regiment.leader.enhancements) {
          total += getEnhancementPoints(enhancement, army.enhancements);
        }
      }
    }
    for (const unit of regiment.units) {
      let unitPoints = army.battleProfiles.get(unit.name)?.points || 0;
      if (unit.reinforced) {
        unitPoints *= 2;
      }
      total += unitPoints;
      // Add heroic trait, artifact, and enhancement points for unit
      if (unit.heroic_trait) {
        total += getEnhancementPoints(unit.heroic_trait, army.heroicTraits);
      }
      if (unit.artifact) {
        total += getEnhancementPoints(unit.artifact, army.artifacts);
      }
      if (unit.enhancements) {
        for (const [_, enhancement] of unit.enhancements) {
          total += getEnhancementPoints(enhancement, army.enhancements);
        }
      }
    }
  }

  // Add points for auxiliary units
  if (list.auxiliary_units) {
    for (const unit of list.auxiliary_units) {
      let unitPoints = army.battleProfiles.get(unit.name)?.points || 0;
      if (unit.reinforced) {
        unitPoints *= 2;
      }
      total += unitPoints;
      // Add heroic trait, artifact, and enhancement points for aux unit
      if (unit.heroic_trait) {
        total += getEnhancementPoints(unit.heroic_trait, army.heroicTraits);
      }
      if (unit.artifact) {
        total += getEnhancementPoints(unit.artifact, army.artifacts);
      }
      if (unit.enhancements) {
        for (const [_, enhancement] of unit.enhancements) {
          total += getEnhancementPoints(enhancement, army.enhancements);
        }
      }
    }
  }

  // Add points for faction terrain if present
  if (list.faction_terrain) {
    total += army.battleProfiles.get(list.faction_terrain)?.points || 0;
  }
  // Add points for spell lore if present
  if (list.spell_lore) {
    total += army.spellLores.get(list.spell_lore)?.points || 0;
  }

  // Add points for prayer lore if present
  if (list.prayer_lore) {
    total += army.prayerLores.get(list.prayer_lore)?.points || 0;
  }

  // Add points for manifestation lore if present, using lores Map
  if (list.manifestation_lore) {
    total += army.manifestationLores.get(list.manifestation_lore)?.points || 0;
    total += universalManifestationLores.get(list.manifestation_lore)?.points || 0;
  }
  return total;
}
