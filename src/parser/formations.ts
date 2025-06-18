import type { Ability } from '../common/Ability';
import { findFirstByTagAndAttrPrefix, findAllByTagAndAttr } from './utils';
import { parseAbilities } from './abilities';

export function parseBattleFormations(root: Element): Map<string, Ability[]> {
  const formationGroups: Map<string, Ability[]> = new Map();

  const formationElement = findFirstByTagAndAttrPrefix(
    root,
    'selectionEntryGroup',
    'name',
    'Battle Formations'
  );
  if (!formationElement) {
    return formationGroups; // Return empty map if no battle formations group is found
  }

  // Each <selectionEntry> inside <selectionEntries> is a formation
  const entries = findAllByTagAndAttr(formationElement, 'selectionEntry', 'type', 'upgrade');
  for (const entry of entries) {
    const formationName = entry.getAttribute('name');
    if (!formationName) continue;
    const abilities = parseAbilities(entry) || [];
    if (abilities.length > 0) {
      formationGroups.set(formationName, abilities);
    }
  }

  return formationGroups;
}
