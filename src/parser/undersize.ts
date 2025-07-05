import {
  closestAncestorByTagName,
  findAllByTagAndAttr,
  findFirstByTagAndAllAttrs,
  findFirstByTagAndAttr,
} from './utils';

export interface UndersizeUnit {
  name: string;
  points: number;
  condition?: string;
}

export function parseUndersizeUnits(armyRoot: Element): UndersizeUnit[] {
  const undersizeUnits: UndersizeUnit[] = [];

  const undersizeCategoryLink = findAllByTagAndAttr(
    armyRoot,
    'categoryLink',
    'name',
    'Undersize Unit'
  );
  for (const link of undersizeCategoryLink) {
    const entryLink = closestAncestorByTagName(link, 'entryLink');
    if (!entryLink) continue;

    const unitName = entryLink.getAttribute('name');
    if (!unitName) continue;

    const costEntry = findFirstByTagAndAttr(entryLink, 'cost', 'typeId', 'points');
    if (!costEntry) continue;

    const cost = costEntry.getAttribute('value');
    if (!cost) continue;

    // condition id
    const condition = findFirstByTagAndAllAttrs(entryLink, 'repeat', {
      value: '1',
      scope: 'roster',
    });
    let conditionName: string | null = null;
    if (condition) {
      const conditionId = condition.getAttribute('childId');
      if (conditionId) {
        // look up unit with this id
        const conditionUnit = findFirstByTagAndAttr(armyRoot, 'entryLink', 'id', conditionId);
        if (conditionUnit) {
          conditionName = conditionUnit.getAttribute('name');
        }
      }
    }

    undersizeUnits.push({
      name: unitName,
      points: Number(cost),
      condition: conditionName || undefined,
    });
  }

  return undersizeUnits;
}
