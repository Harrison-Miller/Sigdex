import { findAllByTagAndAllAttrs, findFirstByTagAndAllAttrs } from './utils';

// parseSubHeroRegimentOptions returns a list of subhero regiment options tags by unit
export function parseSubHeroRegimentOptions(armyInfoRoot: Element): Map<string, string[]> {
  const entries = Array.from(armyInfoRoot.getElementsByTagName('categoryEntry'));

  const tags = new Map<string, string[]>();
  for (const entry of entries) {
    const tagName = entry.getAttribute('name');
    if (!tagName) continue;

    const conditions = findAllByTagAndAllAttrs(entry, 'condition', {
      type: 'instanceOf',
      value: '1',
    });

    for (const condition of conditions) {
      const childId = condition.getAttribute('childId');
      if (!childId) continue;

      // look up the unit by childId
      const unit = findFirstByTagAndAllAttrs(armyInfoRoot, 'entryLink', {
        id: childId,
        type: 'selectionEntry',
      });

      if (!unit) continue;

      const unitName = unit.getAttribute('name');
      if (!unitName) continue;

      if (!tags.has(unitName)) {
        tags.set(unitName, []);
      }
      tags.get(unitName)?.push(tagName);
    }
  }

  return tags;
}

// parseRegimentTags returns a map of unit name to regiment tags (category names)
export function parseRegimentTags(armyInfoRoot: Element): Map<string, string[]> {
  // Build a map of category id to name
  const categoryEntries = Array.from(armyInfoRoot.getElementsByTagName('categoryEntry'));
  const categoryIdToName = new Map<string, string>();
  for (const entry of categoryEntries) {
    const id = entry.getAttribute('id');
    const name = entry.getAttribute('name');
    if (id && name) {
      categoryIdToName.set(id, name);
    }
  }
  console.log(
    `categoryIdToName: ${Array.from(categoryIdToName.entries())
      .map(([id, name]) => `${id}: ${name}`)
      .join(', ')}`
  );

  // For each unit, check for modifiers that add a category
  const unitEntries = Array.from(armyInfoRoot.getElementsByTagName('entryLink'));
  const tags = new Map<string, string[]>();
  for (const unit of unitEntries) {
    const unitName = unit.getAttribute('name');
    if (!unitName) continue;

    for (const [id, name] of categoryIdToName.entries()) {
      const modifier = findFirstByTagAndAllAttrs(unit, 'modifier', {
        type: 'add',
        field: 'category',
        value: id,
      });
      if (modifier) {
        if (!tags.has(unitName)) {
          tags.set(unitName, []);
        }
        tags.get(unitName)?.push(name);
      }
    }
  }
  return tags;
}
