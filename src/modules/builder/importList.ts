import { loadArmy } from '../../army';
import { allArmies, Army } from '../../common/ArmyData';
import type { List, ListUnit } from '../../common/ListData';
import { universalManifestationLores } from '../../common/ManifestationData';

export async function importList(text: string): Promise<List> {
  const listText = text.toLowerCase().trim();
  // search the text for the name of a faction
  const faction = findFaction(listText);
  if (!faction) {
    console.log('No faction found in the list.');
    throw new Error('No faction found in the list.');
  }

  const army = await loadArmy(faction);
  if (!army) {
    console.log(`No army data found for faction: ${faction}`);
    throw new Error(`No army data found for faction: ${faction}`);
  }

  let list: List = {
    id: '',
    name: findName(text),
    setup: true,
    faction,
    formation: findFormationOrFirst(listText, army),
    regiments: [],

    // optional
    faction_terrain: findFactionTerrain(listText, army),
    spell_lore: findSpellLore(listText, army),
    prayer_lore: findPrayerLore(listText, army),
    manifestation_lore: findManifestationLore(listText, army),
    battle_tactics: [], // will be filled later
  };

  // split the text into regiment chunks
  const { regiments, auxiliary } = splitIntoRegimentChunks(listText);
  for (const regimentText of regiments) {
    const units = parseUnits(regimentText, army);
    if (units.length > 0) {
      const leader = units[0];
      list.regiments.push({
        leader: leader,
        units: units.slice(1), // all other units are part of the regiment
      });
    }
  }

  if (auxiliary) {
    const auxUnits = parseUnits(auxiliary, army);
    if (auxUnits.length > 0) {
      list.auxiliary_units = auxUnits;
    }
  }

  return list;
}

function findFaction(text: string): string | null {
  for (const faction of allArmies) {
    if (text.includes(faction.name.toLowerCase())) {
      return faction.name;
    }
  }
  return null;
}

function findFormationOrFirst(text: string, army: Army): string {
  for (const formation of army.formations.keys()) {
    if (text.includes(formation.toLowerCase())) {
      return formation;
    }
  }
  return army.formations.keys().next().value || '';
}

function findName(text: string): string {
  // name should be the entire fist line minus xxxx/yyyy pts (if present)
  const lines = text.split('\n');
  if (lines.length === 0) return 'Imported List';
  const firstLine = lines.find((line) => line.trim() !== '');
  if (!firstLine) {
    return 'Imported List';
  }
  // remove xxxx/yyyy pts if present
  const ptsMatch = firstLine.match(/(\d+\/\d+ pts)$/i);
  if (ptsMatch) {
    return firstLine.replace(ptsMatch[0], '').trim();
  }
  return firstLine;
}

function findFactionTerrain(text: string, army: Army): string | undefined {
  for (const unit of army.units) {
    if (unit.category != 'Faction Terrain') continue;
    if (text.toLowerCase().includes(unit.name.toLowerCase())) {
      return unit.name;
    }
  }
  return undefined;
}

function findSpellLore(text: string, army: Army): string | undefined {
  for (const lore of army.spellLores) {
    if (text.toLowerCase().includes(lore.name.toLowerCase())) {
      return lore.name;
    }
  }
  return undefined;
}

function findPrayerLore(text: string, army: Army): string | undefined {
  for (const lore of army.prayerLores) {
    if (text.toLowerCase().includes(lore.name.toLowerCase())) {
      return lore.name;
    }
  }
  return undefined;
}

function findManifestationLore(text: string, army: Army): string | undefined {
  for (const lore of army.manifestationLores) {
    if (text.toLowerCase().includes(lore.name.toLowerCase())) {
      return lore.name;
    }
  }
  for (const lore of universalManifestationLores) {
    if (text.toLowerCase().includes(lore.toLowerCase())) {
      return lore;
    }
  }
  return undefined;
}

// splitIntoRegimentChunks will split the text into a list of texts each one should hold a regiment
// this is done by splitting the text on "Regiment" and "Auxiliary" keywords
function splitIntoRegimentChunks(text: string): {
  regiments: string[];
  auxiliary: string | undefined;
} {
  const regiments: string[] = [];
  let auxiliary: string | undefined = undefined;

  // Regex to match "regiment" or "auxiliary" and capture the block until the next keyword or end of text
  const regex = /(regiment|auxiliary)\s*([\s\S]*?)(?=(?:regiment|auxiliary)\s|$)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const type = match[1].toLowerCase();
    const block = match[2].trim();
    if (type === 'regiment') {
      regiments.push(block);
    } else if (type === 'auxiliary') {
      auxiliary = block;
    }
  }
  return { regiments, auxiliary };
}

function parseUnits(text: string, army: Army): ListUnit[] {
  // go line by line until we find a unit name that we recognize
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const units: ListUnit[] = [];
  const filteredArmyUnits = army.units.filter((unit: any) => {
    // filter manifestation and faction terrain units
    return unit.category !== 'Manifestation' && unit.category !== 'Faction Terrain';
  });

  let currentUnit: ListUnit | null = null;
  for (const line of lines) {
    // scourge of ghyran may be formatted in a different fashion than our app.
    const SoG = line.includes('scourge of ghyran');
    const unit = filteredArmyUnits.find((unit) => {
      if (SoG) {
        if (unit.name.toLowerCase().includes('scourge of ghyran')) {
          const cleanUnitName = unit.name
            .toLowerCase()
            .replace('scourge of ghyran', '')
            .replace(/\(.*?\)/g, '')
            .trim();
          const cleanedLine = line
            .toLowerCase()
            .replace('scourge of ghyran', '')
            .replace(/\(.*?\)/g, '')
            .trim();
          return cleanedLine.includes(cleanUnitName);
        }
        return false;
      } else {
        return line.includes(unit.name.toLowerCase());
      }
    });
    if (unit) {
      if (currentUnit) {
        units.push(currentUnit);
      }
      currentUnit = {
        name: unit.name,
      };
    }

    // check for anything that looks like anything
    if (currentUnit) {
      if (line.includes('general')) {
        currentUnit.general = true;
      }
      if (line.includes('reinforce')) {
        currentUnit.reinforced = true;
      }
      if (unit && unit.points && line.includes(`${unit.points * 2}`)) {
        currentUnit.reinforced = true;
      }

      // Weapon options
      const currentUnitData = army.units.find((u) => u.name === currentUnit?.name);
      if (currentUnitData && currentUnitData.models && currentUnitData.models.length > 0) {
        // Try to find weapon option names in the line
        for (const group of currentUnitData.models) {
          for (const weapon of group.weapons) {
            if (line.includes(weapon.name.toLowerCase())) {
              if (!currentUnit.weapon_options) currentUnit.weapon_options = new Map();
              if (!currentUnit.weapon_options.has(group.name)) {
                currentUnit.weapon_options.set(group.name, []);
              }

              // search the line for a number anywhere
              const countMatch = line.match(/(\d+)/);
              let count: number | undefined;
              if (countMatch) {
                count = parseInt(countMatch[1], 10);
              }

              const arr = currentUnit.weapon_options.get(group.name)!;
              arr.push({ name: weapon.name, count: count });
            }
          }
        }
      }

      // Heroic traits
      if (army.heroicTraits) {
        for (const [_, abilities] of army.heroicTraits.entries()) {
          for (const ability of abilities) {
            if (line.includes(ability.name.toLowerCase())) {
              currentUnit.heroic_trait = ability.name;
              break;
            }
          }
        }
      }

      // Artifacts
      if (army.artifacts) {
        for (const [_, abilities] of army.artifacts.entries()) {
          for (const ability of abilities) {
            if (line.includes(ability.name.toLowerCase())) {
              currentUnit.artifact = ability.name;
              break;
            }
          }
        }
      }

      // Enhancements
      if (army.enhancementTables) {
        for (const [table, abilities] of army.enhancementTables.entries()) {
          for (const ability of abilities) {
            if (line.includes(ability.name.toLowerCase())) {
              if (!currentUnit.enhancements) currentUnit.enhancements = new Map();
              currentUnit.enhancements.set(table, ability.name);
              break;
            }
          }
        }
      }
    }
  }

  if (currentUnit) {
    units.push(currentUnit);
  }

  return units;
}
