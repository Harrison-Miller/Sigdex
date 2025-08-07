import { List } from '../../list/models/list';
import { ListUnit } from '../../list/models/unit';
import type { Army } from '../../parser/models/army';
import type { Game } from '../../parser/models/game';
import { bestStringMatch, bestLineMatch } from '../../utils/stringSimilarity';

const similarityThreshold = 0.5;

// TODO: split regiment chunk more permissively
// TODO: add some logic, that prevents non-heroes from being regiment leaders

const alternateUnitNames: Map<string, string[]> = new Map([
  ['Kruleboyz Monsta-killaz', ['Monsta-Killaz']],
]);

export function importList(text: string, game: Game): List {
  let listText = text.toLowerCase().replace('```', '').trim();
  // normalize text to all ascii
  listText = listText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // em dash to dash
  listText = listText.replace(/–/g, '-');
  // fancy quotes to normal quotes
  listText = listText.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  // remove this —
  listText = listText.replace(/—/g, '-');

  // search the text for the name of a faction
  const army = findArmy(listText, game);
  if (!army) {
    throw new Error('No valid army found in the list text.');
  }

  const { name, points } = findNameAndPointsCap(text);

  const list: Partial<List> = {
    name: name,
    pointsCap: points,
    faction: army.name,
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
    // TODO: points cap
  };

  // to get eslint to not complain about missing properties
  if (!list.regiments) {
    list.regiments = [];
  }

  const foundCards = findBattleTacticCards(listText, game);
  list.battleTacticCard1 = foundCards.card1;
  list.battleTacticCard2 = foundCards.card2;

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

  if (!army.isArmyOfRenown && regimentOfRenown) {
    const { rorName, units: rorUnits } = parseRoRUnits(regimentOfRenown, game);
    if (rorName) {
      list.regimentOfRenown = rorName;
      list.regimentOfRenownUnits = rorUnits;
    }
  }

  return new List(list);
}

function findArmy(text: string, game: Game): Army | null {
  for (const [armyName, army] of game.armies) {
    if (text.includes(armyName.toLowerCase())) {
      // check if this is an AoR
      for (const aor of army.armiesOfRenown) {
        if (text.includes(aor.toLowerCase())) {
          const aorArmy = game.armies.get(`${armyName} - ${aor}`);
          if (aorArmy) {
            return aorArmy;
          }
        }
      }
      return army;
    }
  }

  // all army names in an array
  const armyNames = Array.from(game.armies.values()).flatMap(army => {
    const names = [army.name];
    for (const aor of army.armiesOfRenown) {
      names.push(`${army.name} - ${aor}`);
    }
    return names;
  }).sort((a, b) => b.length - a.length); // longest first

  console.log('Searching for best match army name in text');
  const bestMatch = bestLineMatch(text, armyNames, similarityThreshold);
  if (bestMatch) {
    const army = game.armies.get(bestMatch);
    if (army) return army;
  }
  return null;
}

function findFormationOrFirst(text: string, army: Army): string {
  for (const formation of army.formations.keys()) {
    if (text.includes(formation.toLowerCase())) {
      return formation;
    }
  }

  console.log('No specific formation found, using best match or first available.');
  const bestMatch = bestLineMatch(text, Array.from(army.formations.keys()), similarityThreshold);
  if (bestMatch) return bestMatch;
  return army.formations.keys().next().value || '';
}

function findNameAndPointsCap(text: string): { name: string; points: number } {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Try to find a line with xxxx/yyyy pts
  const ptsLine = lines.find(line => /(\d+\/\d+ pts)$/i.test(line));
  if (ptsLine) {
    const ptsMatch = ptsLine.match(/(\d+)\/(\d+) pts$/i);
    if (ptsMatch) {
      const name = ptsLine.replace(ptsMatch[0], '').trim();
      const points = parseInt(ptsMatch[2], 10) || 2000;
      return { name, points };
    }
    return { name: ptsLine, points: 2000 };
  }

  // Fallback to first non-empty line
  return { name: lines[0] || 'Imported List', points: 2000 };
}

function findBattleTacticCards(text: string, game: Game): { card1: string, card2: string } {
  let cards: string[] = [];
  for (const card of game.battleTacticCards) {
    if (text.toLowerCase().includes(card.name.toLowerCase())) {
      cards.push(card.name);
    }
  }
  if (cards.length === 2) {
    return { card1: cards[0] || '', card2: cards[1] || '' };
  }

  console.log('No specific battle tactic cards found, using best match');
  const cardNames = game.battleTacticCards.map(card => card.name);
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  for (const line of lines) {
    const match = bestStringMatch(line, cardNames, similarityThreshold);
    if (match) {
      cards.push(match);
    }
  }

  cards = Array.from(new Set(cards));
  return { card1: cards[0] || '', card2: cards[1] || '' };
}

function findFactionTerrain(text: string, army: Army): string | undefined {
  for (const unit of army.unitList.get('FACTION TERRAIN') || []) {
    if (text.toLowerCase().includes(unit.name.toLowerCase())) {
      return unit.name;
    }
  }

  console.log('No specific faction terrain found, using best match');
  const names = Array.from(army.unitList.get('FACTION TERRAIN') || []).map(unit => unit.name);
  const bestMatch = bestLineMatch(text, names, similarityThreshold);
  if (bestMatch) return bestMatch;
  return undefined;
}

function findSpellLore(text: string, army: Army): string | undefined {
  for (const lore of army.spellLores.keys()) {
    if (text.toLowerCase().includes(lore.toLowerCase())) {
      return lore;
    }
  }

  console.log('No specific spell lore found, using best match');
  const names = Array.from(army.spellLores.keys()).map(lore => lore);
  const bestMatch = bestLineMatch(text, names, similarityThreshold);
  if (bestMatch) return bestMatch;

  return undefined;
}

function findPrayerLore(text: string, army: Army): string | undefined {
  for (const lore of army.prayerLores.keys()) {
    if (text.toLowerCase().includes(lore.toLowerCase())) {
      return lore;
    }
  }

  console.log('No specific prayer lore found, using best match');
  const names = Array.from(army.prayerLores.keys()).map(lore => lore);
  const bestMatch = bestLineMatch(text, names, similarityThreshold);
  if (bestMatch) return bestMatch;

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

  console.log('No specific manifestation lore found, using best match');
  const names = Array.from(army.manifestationLores.keys()).concat(universalManifestationLores);
  const bestMatch = bestLineMatch(text, names, similarityThreshold);
  if (bestMatch) return bestMatch;

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
        if (alternateUnitNames.has(bp.name)) {
          return alternateUnitNames.get(bp.name)!.some((name) => {
            return line.includes(name.toLowerCase())
          });
        }
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
    } else {
      // try to find unit name by similarity
      const unitNames = filteredArmyBPs.map(bp => bp.name);
      const match = bestStringMatch(line, unitNames, similarityThreshold);
      if (match) {
        if (currentUnit) {
          units.push(new ListUnit(currentUnit));
        }
        currentUnit = {
          name: match,
        };
      }
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
