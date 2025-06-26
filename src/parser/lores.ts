import type { Ability } from '../common/Ability';
import { findFirstByTagAndAttr, findAllByTagAndAttr, findFirstByTagAndAllAttrs } from './utils';
import { parseAbilities } from './abilities';
import type { ArmyLore } from '../common/ArmyData';
import type { Lore } from '../common/ManifestationData';

export function parseLores(root: Element): Map<string, Lore> {
  const loreGroups: Map<string, Lore> = new Map();

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

    // from the root look for <selectionEntry type="upgrade" import="true" name="Morbid Conjuration" hidden="false" id="b4d2-4178-ff43-a44b">
    // then look for the cost within the selectionEntry
    const upgradeEntry = findFirstByTagAndAllAttrs(root, 'selectionEntry', {
      type: 'upgrade',
      name: groupName,
    });

    let points: number | undefined = undefined;

    if (upgradeEntry) {
      const pointsElement = findFirstByTagAndAttr(upgradeEntry, 'cost', 'typeId', 'points');
      if (pointsElement) {
        points = parseInt(pointsElement.getAttribute('value') || '0', 10) || undefined;
      }
    }

    if (spells.length > 0) {
      loreGroups.set(groupName, {
        abilities: spells,
        points: points,
      });
    }
  }

  return loreGroups;
}

export function parseLoresByGroup(root: Element, group: string): ArmyLore[] {
  const lores: ArmyLore[] = [];

  const mlRoot = findFirstByTagAndAttr(root, 'selectionEntryGroup', 'name', group);
  if (!mlRoot) {
    return lores; // Return empty array if no Manifestation Lores group is found
  }

  const loreElements = findAllByTagAndAttr(mlRoot, 'selectionEntry', 'type', 'upgrade');
  for (const element of loreElements) {
    const name = element.getAttribute('name');
    if (!name) continue;

    // parse points cost if available
    const pointsElement = findFirstByTagAndAttr(element, 'cost', 'typeId', 'points');

    lores.push({
      name: name,
      points: pointsElement ? parseInt(pointsElement.getAttribute('value') || '0', 10) : undefined,
    });
  }

  return lores;
}

export function parseArmyManifestationLores(root: Element): ArmyLore[] {
  return parseLoresByGroup(root, 'Manifestation Lores');
}

export function parseArmySpellLores(root: Element): ArmyLore[] {
  return parseLoresByGroup(root, 'Spell Lores');
}

export function parseArmyPrayerLores(root: Element): ArmyLore[] {
  return parseLoresByGroup(root, 'Prayer Lores');
}
