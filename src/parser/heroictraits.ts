import type { Ability } from '../common/Ability';
import { findFirstByTagAndAttr, findAllByTagAndAttr } from './utils';
import { parseAbilities } from './abilities';

export function parseHeroicTraits(armyInfo: Element): Map<string, Ability[]> {
  const artifactGroups: Map<string, Ability[]> = new Map();

  const artifactElement = findFirstByTagAndAttr(
    armyInfo,
    'selectionEntryGroup',
    'name',
    'Heroic Traits'
  );
  if (!artifactElement) {
    return artifactGroups; // Return empty map if no artifacts group is found
  }

  let groups = Array.from(artifactElement.getElementsByTagName('selectionEntryGroup'));
  for (let group of groups) {
    const groupName = group.getAttribute('name') || 'Unknown Artefact Group';

    const artifacts: Ability[] = [];
    let artifactElements = findAllByTagAndAttr(group, 'selectionEntry', 'type', 'upgrade');
    for (let el of artifactElements) {
      let abilities = parseAbilities(el);
      if (!abilities) {
        continue; // Skip if no ability is found
      }

      artifacts.push(abilities[0]); // Assuming each artifact has one ability
    }

    if (artifacts.length > 0) {
      artifactGroups.set(groupName, artifacts);
    }
  }

  return artifactGroups;
}
