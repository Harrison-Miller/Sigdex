import { findFirstByTagAndAttr, findAllByTagAndAllAttrs, closestByTagName } from './utils';

export function parseCompanionUnits(root: Element, unitName: string): string[] {
  const companions: string[] = [];
  const unitEntry = findFirstByTagAndAttr(root, 'entryLink', 'name', unitName);
  if (!unitEntry) {
    return companions;
  }

  const id = unitEntry.getAttribute('id');
  if (!id) {
    return companions;
  }

  const companionConditions = findAllByTagAndAllAttrs(root, 'condition', {
    type: 'atLeast',
    value: '1',
    childId: id,
  });

  for (const condition of companionConditions) {
    const ancestor = closestByTagName(condition, 'entryLink');
    if (ancestor) {
      const name = ancestor.getAttribute('name');
      if (name) {
        companions.push(name);
      }
    }
  }

  // under the unitEntry look for conditions
  const unitConditions = findAllByTagAndAllAttrs(unitEntry, 'condition', {
    type: 'atLeast',
    value: '1',
  });

  for (const condition of unitConditions) {
    const id = condition.getAttribute('childId');
    if (id) {
      const companion = findFirstByTagAndAttr(root, 'entryLink', 'id', id);

      if (companion) {
        const name = companion.getAttribute('name');
        if (name) {
          companions.push(name);
        }
      }
    }
  }

  return companions;
}
