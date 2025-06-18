import type { Ability } from '../common/Ability';
import { findFirstByTagAndAttr, findAllByTagAndAttr } from './utils';
import { parseAbilities } from './abilities';

export function parseLores(root: Element): Map<string, Ability[]> {
  const loreGroups: Map<string, Ability[]> = new Map();

  const loreElements = Array.from(root.getElementsByTagName('selectionEntryGroup'));
  for (const element of loreElements) {
    const groupName = element.getAttribute('name');
    if (!groupName) {
      continue; // Skip if group name is not defined
    }

    const spells: Ability[] = [];
    const loreEntries = findAllByTagAndAttr(element, 'selectionEntry', 'type', 'upgrade');
    for (const entry of loreEntries) {
      const abilities = parseAbilities(entry);
      if (!abilities || abilities.length === 0) {
        continue; // Skip if no ability is found
      }

      spells.push(abilities[0]); // Assuming each spell has one ability
    }

    if (spells.length > 0) {
      loreGroups.set(groupName, spells);
    }
  }

  return loreGroups;
}

export function parseLoresByGroup(root: Element, group: string): string[] {
  const lores: string[] = [];

  const mlRoot = findFirstByTagAndAttr(root, 'selectionEntryGroup', 'name', group);
  if (!mlRoot) {
    return lores; // Return empty array if no Manifestation Lores group is found
  }

  const loreElements = findAllByTagAndAttr(mlRoot, 'selectionEntry', 'type', 'upgrade');
  for (const element of loreElements) {
    const name = element.getAttribute('name');
    if (name) {
      lores.push(name);
    }
  }

  return lores;
}

export function parseArmyManifestationLores(root: Element): string[] {
  return parseLoresByGroup(root, 'Manifestation Lores');
}

export function parseArmySpellLores(root: Element): string[] {
  return parseLoresByGroup(root, 'Spell Lores');
}

export function parseArmyPrayerLores(root: Element): string[] {
  return parseLoresByGroup(root, 'Prayer Lores');
}
