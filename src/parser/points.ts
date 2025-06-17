import { findFirstByTagAndAttr } from './utils';

export function parsePoints(root: Element): Map<string, number> {
  const map = new Map<string, number>();
  const entryLinks = root.getElementsByTagName('entryLink');

  for (const el of Array.from(entryLinks)) {
    const name = el.getAttribute('name');
    if (!name) continue;

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
