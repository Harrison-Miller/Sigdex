import type { Ability } from '../models/ability';
import { Army, Enhancement, EnhancementTable, Formation, type IArmy } from '../models/army';
import type { BattleProfile } from '../models/battleProfile';
import { Lore } from '../models/lore';
import { type Unit } from '../models/unit';
import { parseAbilities, parseAbility } from './parseAbility';
import { parseArmyOptions } from './parseArmyOfRenown';
import { parseBattleProfiles } from './parseBattleProfile';
import { calculateCommonKeywords, filterIgnoredEnhancementTables, parseCategories, parseIsSoG, parsePoints, type ICategory } from './parseCommon';

export function parseArmy(
  root: any,
  units: Map<string, Unit>,
  categories: Map<string, ICategory>
): Army {
  const catalogue = root?.catalogue;
  let name = catalogue?.['@_name'] || 'Unknown Catalogue';
  //trim non-basic characters from the name a-zA-Z0-9 punctuation and spaces
  name = name.replace(/[^a-zA-Z0-9\s.,'!-]/g, '').trim();

  const armyCategories = parseCategories(catalogue);
  // add to all categories always override
  for (const [id, category] of armyCategories.entries()) {
    categories.set(id, category);
  }


  // find all armyCategories with no childIds and all caps
  const possibleArmyKeywords = Array.from(new Set(Array.from(armyCategories.values())
    .filter((cat) => !cat.modifiers.some(m => m.childConditionIds.length) && cat.name === cat.name.toUpperCase())
    .map((cat) => cat.name)));

  let armyKeyword: string = '';
  if (possibleArmyKeywords.length > 1) {
    console.warn(`Multiple possible army keywords found for ${name} not choosing any:`, possibleArmyKeywords);
  } else if (possibleArmyKeywords.length === 1) {
    // use the first one as the army keyword
    armyKeyword = possibleArmyKeywords[0];
  }

  const army: Partial<IArmy> = {
    name,
    revision: catalogue?.['@_revision'],
    formations: parseFormations(catalogue),
    artifacts: parseEnhancementTables(catalogue, 'Artefacts of Power'),
    heroicTraits: parseEnhancementTables(catalogue, 'Heroic Traits'),
    enhancements: parseOtherEnhancementTables(catalogue),
    spellLores: parseLoresByGroup(catalogue, 'Spell Lores'),
    prayerLores: parseLoresByGroup(catalogue, 'Prayer Lores'),
    manifestationLores: parseLoresByGroup(catalogue, 'Manifestation Lores'),
    battleProfiles: parseBattleProfiles(catalogue, units, categories, armyCategories, armyKeyword),
    armyKeyword: armyKeyword,
    options: parseArmyOptions(catalogue, armyCategories, units, armyKeyword),
  };

  const battleTraits = parseBattleTraits(catalogue);
  army.battleTraits = battleTraits.abilities;
  army.battleTraitNotes = battleTraits.notes;

  // get the first unit
  const firstBp = army.battleProfiles?.keys().next().value || '';
  const firstUnit = units.get(firstBp) || '';
  if (firstUnit) {
    // infer grand alliance from the first unit's keywords
    const grandAlliance =
      firstUnit.keywords.find((kw) =>
        ['order', 'chaos', 'death', 'destruction'].includes(kw.toLowerCase())
      ) || 'order';
    army.grandAlliance = (grandAlliance.charAt(0).toUpperCase() +
      grandAlliance.slice(1).toLowerCase()) as 'Order' | 'Chaos' | 'Death' | 'Destruction';
  } else {
    army.grandAlliance = 'Order'; // default to Order if no units are found
  }

  // add keywords to enhancement tables
  if (army.enhancements && army.enhancements.size > 0 && army.battleProfiles) {
    for (const [_, table] of army.enhancements.entries()) {
      table.keywords = calculateEnhancementTableKeywords(table, army.battleProfiles);
    }
  }

  // deal with roster level categories
  return new Army(army);
}

export function parseBattleTraits(root: any): { abilities: Ability[], notes: string[] } {
  const battleTraitsNode = root?.sharedSelectionEntries?.selectionEntry?.find((entry: any) =>
    entry['@_name'].startsWith('Battle Traits')
  );

  // get rules
  const noteNodes = battleTraitsNode?.rules?.rule || [];
  const notes = noteNodes.map((rule: any) => {
    const description = (typeof rule?.description === 'string' ? rule.description : rule?.description?.['#text']) || '';
    return description.trim() || '';
  }).filter((note: string) => note.length > 0) || [];
  const abilities = parseAbilities(battleTraitsNode?.profiles);
  return { abilities, notes };
}

export function parseFormations(root: any): Map<string, Formation> {
  const formationsNode = root?.sharedSelectionEntryGroups?.selectionEntryGroup?.find((entry: any) =>
    entry['@_name'].startsWith('Battle Formations')
  );

  const formationNodes = formationsNode?.selectionEntries?.selectionEntry || [];
  const formationsMap = new Map<string, Formation>();
  formationNodes.forEach((formationNode: any) => {
    const name = formationNode['@_name'];
    const abilities = parseAbilities(formationNode.profiles);
    const points = parsePoints(formationNode);
    const sog = parseIsSoG(formationNode);
    formationsMap.set(name, new Formation({ name, abilities, points, sog }));
  });

  return formationsMap;
}

export function parseEnhancement(enhancementNode: any): Enhancement {
  const points = parsePoints(enhancementNode);
  return new Enhancement({
    points,
    ability: parseAbility(enhancementNode.profiles?.profile?.[0]),
  });
}

export function parseEnhancementTables(
  root: any,
  groupName: string
): Map<string, EnhancementTable> {
  const groupNode = root?.sharedSelectionEntryGroups?.selectionEntryGroup?.find((entry: any) =>
    entry['@_name'].toLowerCase().includes(groupName.toLowerCase())
  );

  const tableNodes = groupNode?.selectionEntryGroups?.selectionEntryGroup || [];

  const tables: EnhancementTable[] = [];
  tableNodes.forEach((tableNode: any) => {
    const name = tableNode['@_name'];
    if (!name) return;

    const sog = parseIsSoG(tableNode);
    const enhancements: Enhancement[] =
      tableNode.selectionEntries?.selectionEntry?.map((entry: any) => parseEnhancement(entry)) ||
      [];
    tables.push(name, new EnhancementTable({ name, enhancements, sog }));
  });

  // create the map, if we find multiple tables with the same name, the one with sog will add (Scourge of Gyhran) to the name.
  const tablesMap = new Map<string, EnhancementTable>();
  tables.forEach((table: EnhancementTable) => {
    let tableName = table.name;
    if (table.sog) {
      if (tablesMap.has(tableName)) {
        // if we already have a table with this name, append (Scourge of Gyhran)
        tableName += ' (Scourge of Gyhran)';
        table.name = tableName; // update the name in the table
      }
    }

    if (!tablesMap.has(tableName) && tableName) {
      tablesMap.set(tableName, table);
    }
  });

  return tablesMap;
}

export function parseOtherEnhancementTables(root: any): Map<string, EnhancementTable> {
  // other enhancement groups have the same nested structure, but only ever have one table per a group
  const tableGroups =
    filterIgnoredEnhancementTables(root?.sharedSelectionEntryGroups?.selectionEntryGroup) || [];

  const tables: EnhancementTable[] = [];
  tableGroups.forEach((groupNode: any) => {
    const name = groupNode['@_name']; // enhancement table type name
    const tableNode = groupNode?.selectionEntryGroups?.selectionEntryGroup[0] || {};
    const sog = parseIsSoG(tableNode);

    const enhancements: Enhancement[] =
      tableNode?.selectionEntries?.selectionEntry?.map((entry: any) => parseEnhancement(entry)) ||
      [];
    if (enhancements.length > 0) {
      tables.push(name, new EnhancementTable({ name, enhancements, sog }));
    }
  });

  // create the map, if we find multiple tables with the same name, the one with sog will add (Scourge of Gyhran) to the name.
  const tablesMap = new Map<string, EnhancementTable>();
  tables.forEach((table: EnhancementTable) => {
    let tableName = table.name;
    if (table.sog) {
      if (tablesMap.has(tableName)) {
        // if we already have a table with this name, append (Scourge of Gyhran)
        tableName += ' (Scourge of Gyhran)';
        table.name = tableName; // update the name in the table
      }
    }
    if (!tablesMap.has(tableName) && tableName) {
      tablesMap.set(tableName, table);
    }
  });

  return tablesMap;
}

export function parseLoresByGroup(root: any, group: string): Map<string, Lore> {
  const loresMap = new Map<string, Lore>();

  const loreGroupNode = root?.sharedSelectionEntryGroups?.selectionEntryGroup?.find(
    (entry: any) => entry['@_name'].toLowerCase() === group.toLowerCase()
  );

  const loreEntries = loreGroupNode?.selectionEntries?.selectionEntry || [];
  loreEntries.forEach((entry: any) => {
    const name = entry['@_name'] || '';
    const points = parsePoints(entry);
    loresMap.set(name, new Lore({ name, abilities: [], points }));
  });

  return loresMap;
}

export function calculateEnhancementTableKeywords(table: EnhancementTable, bps: Map<string, BattleProfile>): string[] {
  const filteredBps = Array.from(bps.values()).filter(bp =>
    bp.enhancementTables.includes(table.name)
  );
  const keywords = new Set(calculateCommonKeywords(filteredBps));

  const nonTableBps = Array.from(bps.values()).filter(bp =>
    !bp.enhancementTables.includes(table.name) && !bp.keywords.includes('UNIQUE')
  );
  const nonTableKeywords = new Set(nonTableBps.flatMap(bp => bp.keywords));


  // remove non-table keywords from the keywords
  for (const kw of nonTableKeywords) {
    keywords.delete(kw);
  }

  const finalKeywords = Array.from(keywords).filter(kw => {
    // filter common game keywords
    if (['FLY'].includes(kw)) return false;
    if (kw.includes('WARD')) return false;
    return true;
  }).sort();

  if (finalKeywords.length === 0) {
    const unitNames = filteredBps.map(bp => bp.name).sort();
    console.warn(`No keywords found for enhancement table "${table.name}". Units:`, unitNames);
    return unitNames;
  }

  return finalKeywords;
}