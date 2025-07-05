import { findFirstByTagAndAttr } from './utils';

export function parsePoints(root: Element): Map<string, number> {
  const map = new Map<string, number>();
  const entryLinks = root.getElementsByTagName('entryLink');

  for (const el of Array.from(entryLinks)) {
    let name = el.getAttribute('name');
    if (!name) continue;

    // check this isn't an undersized unit variant
    const undersized = findFirstByTagAndAttr(el, 'categoryLink', 'name', 'Undersize Unit');
    if (undersized) {
      name = name + ` (1 model)`;
    }

    const cost = findFirstByTagAndAttr(el, 'cost', 'typeId', 'points');
    if (cost) {
      const value = Number(cost.getAttribute('value'));
      if (!isNaN(value)) {
        map.set(name, value);
      }
    }
  }

  return map;
}
