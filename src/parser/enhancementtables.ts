import type { Ability } from '../common/Ability';
import { parseAbilities } from './abilities';
import {
  findAllByTagAndAttr,
  getAllDirectChildrenByTagName,
  getDirectChildByTagName,
  findFirstByTagAndAttr,
} from './utils';

const IGNORED_TABLES = [
  // stuff already parsed by other parsers
  'Lores',
  'Artefacts',
  'Battle Formations',
  'Heroic Traits',
  // stuff for path and other game modes
  'Battle Wounds',
  'Ravaged Coast',
  'Paths',
];

export function parseEnhancementTables(root: Element): Map<string, Ability[]> {
  let enhancementTables: Map<string, Ability[]> = new Map();

  const sharedSelections = getDirectChildByTagName(root, 'sharedSelectionEntryGroups');
  if (!sharedSelections) return enhancementTables; // no shared selections, nothing to parse
  const enhancementElements = getAllDirectChildrenByTagName(
    sharedSelections,
    'selectionEntryGroup'
  );

  // gather all enhancement tables
  for (const element of enhancementElements) {
    const tableName = element.getAttribute('name');
    if (!tableName) continue; // skip if no table name
    // check for partial matches for ignored tables
    if (IGNORED_TABLES.some((ignored) => tableName?.includes(ignored))) continue;

    const enhancementGroup = Array.from(element.getElementsByTagName('selectionEntryGroup'));

    let abilities: Ability[] = [];
    for (const group of enhancementGroup) {
      const groupName = group.getAttribute('name');
      if (!groupName) continue; // skip if no group name`

      const entries = findAllByTagAndAttr(group, 'selectionEntry', 'type', 'upgrade');
      for (const entry of entries) {
        const entryAbilities = parseAbilities(entry);
        if (!entryAbilities) continue; // skip if no abilities found

        abilities.push(entryAbilities[0]); // assuming each enhancement has one ability
      }
    }

    if (abilities.length > 0) {
      enhancementTables.set(tableName, abilities);
    }
  }

  return enhancementTables;
}

/**
 * Given the root element and a unit name, returns a list of enhancement table names (selectionEntryGroup names) that the unit can take.
 * Ignores tables in IGNORED_TABLES (same as parseEnhancementTables).
 */
export function parseUnitEnhancementTables(root: Element, unitName: string): string[] {
  const enhancementTables: string[] = [];
  // Find the entryLink for the unit by name
  const unitEntryLink = findFirstByTagAndAttr(root, 'entryLink', 'name', unitName);
  if (!unitEntryLink) return enhancementTables;
  // Find all entryLinks under this unit entryLink
  const entryLinks = unitEntryLink.getElementsByTagName('entryLink');
  for (let i = 0; i < entryLinks.length; i++) {
    const link = entryLinks[i];
    const type = link.getAttribute('type');
    const name = link.getAttribute('name');
    if (
      type === 'selectionEntryGroup' &&
      name &&
      !IGNORED_TABLES.some((ignored) => name.includes(ignored))
    ) {
      enhancementTables.push(name);
    }
  }
  return enhancementTables;
}
