import type { IAbility } from '../models/ability';
import { Army, type IArmy, type IEnhancement, type IEnhancementTable } from '../models/army';
import type { ILore } from '../models/lore';
import type { IUnit } from '../models/unit';
import { parseAbilities, parseAbility } from './parseAbility';
import { parseBattleProfiles } from './parseBattleProfile';
import { filterIgnoredEnhancementTables, parsePoints, type ICategory } from './parseCommon';

export function parseArmy(
  root: any,
  units: Map<string, IUnit>,
  categories: Map<string, ICategory>
): IArmy {
  const catalogue = root?.catalogue;
  const name = catalogue?.['@_name'] || 'Unknown Catalogue';
  let army: Partial<IArmy> = {
    name,
    battleTraits: parseBattleTraits(catalogue),
    formations: parseFormations(catalogue),
    artifacts: parseEnhancementTables(catalogue, 'Artefacts of Power'),
    heroicTraits: parseEnhancementTables(catalogue, 'Heroic Traits'),
    enhancements: parseOtherEnhancementTables(catalogue),
    spellLores: parseLoresByGroup(catalogue, 'Spell Lores'),
    prayerLores: parseLoresByGroup(catalogue, 'Prayer Lores'),
    manifestationLores: parseLoresByGroup(catalogue, 'Manifestation Lores'),
    battleProfiles: parseBattleProfiles(catalogue, units, categories),
  };

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

  return new Army(army);
}

export function parseBattleTraits(root: any): IAbility[] {
  const battleTraitsNode = root?.sharedSelectionEntries?.selectionEntry?.find((entry: any) =>
    entry['@_name'].startsWith('Battle Traits')
  );

  return parseAbilities(battleTraitsNode?.profiles);
}

export function parseFormations(root: any): Map<string, IAbility[]> {
  const formationsNode = root?.sharedSelectionEntryGroups?.selectionEntryGroup?.find((entry: any) =>
    entry['@_name'].startsWith('Battle Formations')
  );

  const formationNodes = formationsNode?.selectionEntries?.selectionEntry || [];
  const formationsMap = new Map<string, IAbility[]>();
  formationNodes.forEach((formationNode: any) => {
    const name = formationNode['@_name'];
    const abilities = parseAbilities(formationNode.profiles);
    formationsMap.set(name, abilities);
  });

  return formationsMap;
}

export function parseEnhancement(enhancementNode: any): IEnhancement {
  const points = parsePoints(enhancementNode);
  return {
    points,
    ability: parseAbility(enhancementNode.profiles?.profile?.[0]),
  };
}

export function parseEnhancementTables(
  root: any,
  groupName: string
): Map<string, IEnhancementTable> {
  const groupNode = root?.sharedSelectionEntryGroups?.selectionEntryGroup?.find((entry: any) =>
    entry['@_name'].toLowerCase().includes(groupName.toLowerCase())
  );

  const tableNodes = groupNode?.selectionEntryGroups?.selectionEntryGroup || [];

  const tablesMap = new Map<string, IEnhancementTable>();
  tableNodes.forEach((tableNode: any) => {
    const name = tableNode['@_name'];
    const enhancements: IEnhancement[] =
      tableNode.selectionEntries?.selectionEntry?.map((entry: any) => parseEnhancement(entry)) ||
      [];
    tablesMap.set(name, { name, enhancements });
  });
  return tablesMap;
}

export function parseOtherEnhancementTables(root: any): Map<string, IEnhancementTable> {
  // other enhancement groups have the same nested structure, but only ever have one table per a group
  const tableGroups =
    filterIgnoredEnhancementTables(root?.sharedSelectionEntryGroups?.selectionEntryGroup) || [];

  const tablesMap = new Map<string, IEnhancementTable>();
  tableGroups.forEach((groupNode: any) => {
    const name = groupNode['@_name']; // enhancement table type name
    const tableNode = groupNode?.selectionEntryGroups?.selectionEntryGroup[0] || {};

    const enhancements: IEnhancement[] =
      tableNode?.selectionEntries?.selectionEntry?.map((entry: any) => parseEnhancement(entry)) ||
      [];
    if (enhancements.length > 0) {
      tablesMap.set(name, { name, enhancements });
    }
  });
  return tablesMap;
}

export function parseLoresByGroup(root: any, group: string): Map<string, ILore> {
  const loresMap = new Map<string, ILore>();

  const loreGroupNode = root?.sharedSelectionEntryGroups?.selectionEntryGroup?.find(
    (entry: any) => entry['@_name'].toLowerCase() === group.toLowerCase()
  );

  const loreEntries = loreGroupNode?.selectionEntries?.selectionEntry || [];
  loreEntries.forEach((entry: any) => {
    const name = entry['@_name'] || '';
    const points = parsePoints(entry);
    loresMap.set(name, {
      name,
      abilities: [],
      points: points,
    });
  });

  return loresMap;
}
