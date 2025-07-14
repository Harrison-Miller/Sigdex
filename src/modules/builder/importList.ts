import { List } from '../../list/models/list';
import { ListUnit } from '../../list/models/unit';
import type { Army } from '../../parser/models/army';
import type { Game } from '../../parser/models/game';

export function importList(text: string, game: Game): List {
  const listText = text.toLowerCase().trim();
  // search the text for the name of a faction
  const faction = findFaction(listText, Array.from(game.armies.keys()));
  if (!faction) {
    console.error('No faction found in the list.');
    throw new Error('No faction found in the list.');
  }

  const army = game.armies.get(faction);
  if (!army) {
    console.error(`No army data found for faction: ${faction}`);
    throw new Error(`No army data found for faction: ${faction}`);
  }

  const list: Partial<List> = {
    name: findName(text),
    faction,
    formation: findFormationOrFirst(listText, army),
    regiments: [],
    factionTerrain: findFactionTerrain(listText, army),
    spellLore: findSpellLore(listText, army),
    prayerLore: findPrayerLore(listText, army),
    manifestationLore: findManifestationLore(
      listText,
      army,
      Array.from(game.universalManifestationLores.keys())
    ),
    // TODO: find battle tactics and points cap
  };

  // to get eslint to not complain about missing properties
  if (!list.regiments) {
    list.regiments = [];
  }

  // split the text into regiment chunks
  const { regiments, auxiliary, regimentOfRenown } = splitIntoRegimentChunks(listText);
  for (const regimentText of regiments) {
    const units = parseUnits(regimentText, army, game);
    if (units.length > 0) {
      const leader = units[0];
      list.regiments.push({
        leader: leader,
        units: units.slice(1), // all other units are part of the regiment
      });
    }
  }

  if (auxiliary) {
    const auxUnits = parseUnits(auxiliary, army, game);
    if (auxUnits.length > 0) {
      list.auxiliaryUnits = auxUnits;
    }
  }

  if (regimentOfRenown) {
    const { rorName, units: rorUnits } = parseRoRUnits(regimentOfRenown, game);
    if (rorName) {
      list.regimentOfRenown = rorName;
      list.regimentOfRenownUnits = rorUnits;
    }
  }

  return new List(list);
}

function findFaction(text: string, armyNames: string[]): string | null {
  for (const faction of armyNames) {
    if (text.includes(faction.toLowerCase())) {
      return faction;
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
  for (const unit of army.unitList.get('FACTION TERRAIN') || []) {
    if (text.toLowerCase().includes(unit.name.toLowerCase())) {
      return unit.name;
    }
  }
  return undefined;
}

function findSpellLore(text: string, army: Army): string | undefined {
  for (const lore of army.spellLores.keys()) {
    if (text.toLowerCase().includes(lore.toLowerCase())) {
      return lore;
    }
  }
  return undefined;
}

function findPrayerLore(text: string, army: Army): string | undefined {
  for (const lore of army.prayerLores.keys()) {
    if (text.toLowerCase().includes(lore.toLowerCase())) {
      return lore;
    }
  }
  return undefined;
}

function findManifestationLore(
  text: string,
  army: Army,
  universalManifestationLores: string[]
): string | undefined {
  for (const lore of army.manifestationLores.keys()) {
    if (text.toLowerCase().includes(lore.toLowerCase())) {
      return lore;
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
  regimentOfRenown: string | undefined;
} {
  const regiments: string[] = [];
  let auxiliary: string | undefined = undefined;
  let regimentOfRenown: string | undefined = undefined;

  // Regex to match "regiment" or "auxiliary" and capture the block until the next keyword or end of text
  const regex = /(renown|regiment|auxiliary)\s*([\s\S]*?)(?=(?:renown|regiment|auxiliary)\s|$)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const type = match[1].toLowerCase();
    const block = match[2].trim();
    if (type === 'regiment') {
      regiments.push(block);
    } else if (type === 'auxiliary') {
      auxiliary = block;
    } else if (type === 'renown') {
      regimentOfRenown = block;
    }
  }
  return { regiments, auxiliary, regimentOfRenown };
}

function parseUnits(text: string, army: Army, game: Game): ListUnit[] {
  // go line by line until we find a unit name that we recognize
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const units: ListUnit[] = [];
  const filteredArmyBPs = Array.from(army.battleProfiles.values())
    .filter((bp: any) => {
      // filter manifestation and faction terrain units
      return bp.category !== 'MANIFESTATION' && bp.category !== 'FACTION TERRAIN';
    })
    .sort((a, b) => {
      // sort by length (longer first) then alpha
      if (a.name.length !== b.name.length) {
        return b.name.length - a.name.length;
      }
      return a.name.localeCompare(b.name);
    });

  let currentUnit: Partial<ListUnit> | null = null;
  for (const line of lines) {
    // scourge of ghyran may be formatted in a different fashion than our app.
    const SoG = line.includes('scourge of ghyran');
    const bp = filteredArmyBPs.find((bp) => {
      if (SoG) {
        if (bp.name.toLowerCase().includes('scourge of ghyran')) {
          const cleanUnitName = bp.name
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
        return line.includes(bp.name.toLowerCase());
      }
    });
    if (bp) {
      if (currentUnit) {
        units.push(new ListUnit(currentUnit));
      }
      currentUnit = {
        name: bp.name,
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
      if (bp && bp.points && line.includes(`${bp.points * 2}`)) {
        currentUnit.reinforced = true;
      }

      // Weapon options
      const currentUnitData = game.units.get(currentUnit?.name || '');
      if (currentUnitData && currentUnitData.models && currentUnitData.models.size > 0) {
        // Try to find weapon option names in the line
        for (const [_, model] of currentUnitData.models) {
          for (const [_, weapon] of model.weapons) {
            if (weapon.type === 'default') continue; // skip default weapons

            if (line.includes(weapon.name.toLowerCase())) {
              if (!currentUnit.weaponOptions) currentUnit.weaponOptions = new Map();
              if (!currentUnit.weaponOptions.has(model.name)) {
                currentUnit.weaponOptions.set(model.name, []);
              }

              // search the line for a number anywhere
              const countMatch = line.match(/(\d+)/);
              let count: number | undefined;
              if (countMatch) {
                count = parseInt(countMatch[1], 10);
              }

              const maxCount =
                (weapon.max ? weapon.max : model.count || 1) * (currentUnit.reinforced ? 2 : 1);
              const actualCount = count ? Math.min(count, maxCount) : 1;

              const arr = currentUnit.weaponOptions.get(model.name)!;
              arr.push({ name: weapon.name, count: actualCount });
            }
          }
        }
      }

      // Heroic traits
      if (army.heroicTraits) {
        for (const [_, table] of army.heroicTraits) {
          for (const enhancement of table.enhancements) {
            if (line.includes(enhancement.ability.name.toLowerCase())) {
              currentUnit.heroicTrait = enhancement.ability.name;
              break;
            }
          }
        }
      }

      // Artifacts
      if (army.artifacts) {
        for (const [_, table] of army.artifacts) {
          for (const enhancement of table.enhancements) {
            if (line.includes(enhancement.ability.name.toLowerCase())) {
              currentUnit.artifact = enhancement.ability.name;
              break;
            }
          }
        }
      }

      // Enhancements
      if (army.enhancements.size > 0) {
        for (const [_, table] of army.enhancements) {
          for (const enhancement of table.enhancements) {
            if (line.includes(enhancement.ability.name.toLowerCase())) {
              if (!currentUnit.enhancements) currentUnit.enhancements = new Map();
              currentUnit.enhancements.set(table.name, enhancement.ability.name);
              break;
            }
          }
        }
      }
    }
  }

  if (currentUnit) {
    units.push(new ListUnit(currentUnit));
  }

  return units;
}

function parseRoRUnits(text: string, game: Game): { rorName: string, units: ListUnit[] } {
  const rorName = Array.from(game.regimentsOfRenown.keys()).find((name) =>
    text.toLowerCase().includes(name.toLowerCase())
  );

  if (!rorName) {
    console.warn('No Regiment of Renown found in the text.');
    return { rorName: '', units: [] };
  }

  // go line by line until we find a unit name that we recognize
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const units: ListUnit[] = [];

  const ror = game.regimentsOfRenown.get(rorName);
  if (!ror) return { rorName: '', units: [] };

  const unitNames = Array.from(ror.units.keys());


  let currentUnit: Partial<ListUnit> | null = null;
  for (const line of lines) {
    const foundUnit = unitNames.find((name) => line.includes(name.toLowerCase()));

    if (foundUnit) {

      if (currentUnit) {
        units.push(new ListUnit(currentUnit));
      }
      currentUnit = {
        name: foundUnit,
      };
    }

    // check for anything that looks like anything
    if (currentUnit) {
      // Weapon options
      const currentUnitData = game.units.get(currentUnit?.name || '');
      if (currentUnitData && currentUnitData.models && currentUnitData.models.size > 0) {
        // Try to find weapon option names in the line
        for (const [_, model] of currentUnitData.models) {
          for (const [_, weapon] of model.weapons) {
            if (weapon.type === 'default') continue; // skip default weapons

            if (line.includes(weapon.name.toLowerCase())) {
              if (!currentUnit.weaponOptions) currentUnit.weaponOptions = new Map();
              if (!currentUnit.weaponOptions.has(model.name)) {
                currentUnit.weaponOptions.set(model.name, []);
              }

              // search the line for a number anywhere
              const countMatch = line.match(/(\d+)/);
              let count: number | undefined;
              if (countMatch) {
                count = parseInt(countMatch[1], 10);
              }

              const maxCount =
                (weapon.max ? weapon.max : model.count || 1) * (currentUnit.reinforced ? 2 : 1);
              const actualCount = count ? Math.min(count, maxCount) : 1;

              const arr = currentUnit.weaponOptions.get(model.name)!;
              arr.push({ name: weapon.name, count: actualCount });
            }
          }
        }
      }
    }
  }

  if (currentUnit) {
    units.push(new ListUnit(currentUnit));
  }

  return { rorName, units };
}
