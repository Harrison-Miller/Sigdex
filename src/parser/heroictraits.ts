import type { Ability } from '../common/Ability';
import { findFirstByTagAndAttr, findAllByTagAndAttr } from './utils';
import { parseAbilities } from './abilities';

export function parseHeroicTraits(root: Element): Map<string, Ability[]> {
  const traitGroups: Map<string, Ability[]> = new Map();

  const traitElement = findFirstByTagAndAttr(root, 'selectionEntryGroup', 'name', 'Heroic Traits');
  if (!traitElement) {
    return traitGroups; // Return empty map if no heroic trait group is found
  }

  let groups = Array.from(traitElement.getElementsByTagName('selectionEntryGroup'));
  for (let group of groups) {
    const groupName = group.getAttribute('name');
    if (!groupName) {
      continue; // Skip if group name is not defined
    }

    const traits: Ability[] = [];
    let traitElements = findAllByTagAndAttr(group, 'selectionEntry', 'type', 'upgrade');
    for (let el of traitElements) {
      let abilities = parseAbilities(el);
      if (!abilities) {
        continue; // Skip if no ability is found
      }

      traits.push(abilities[0]); // Assuming each heroic trait has one ability
    }

    if (traits.length > 0) {
      traitGroups.set(groupName, traits);
    }
  }

  return traitGroups;
}
