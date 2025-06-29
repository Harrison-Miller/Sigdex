import { findChildByTagName, getAllDirectChildrenByTagName } from './utils';

export function parseCategories(root: Element): Map<string, string> {
  const categories = new Map<string, string>();
  const categoryEntries = Array.from(root.getElementsByTagName('categoryEntry'));
  for (const entry of categoryEntries) {
    const id = entry.getAttribute('id');
    const name = entry.getAttribute('name');
    if (id && name) {
      categories.set(id, name);
    }
  }
  return categories;
}

export function parseUnitsAsCategories(armyInfo: Element): Map<string, string> {
  const categories = new Map<string, string>();
  const entryLinks = findChildByTagName(armyInfo, 'entryLinks');
  if (!entryLinks) return categories;

  const units = getAllDirectChildrenByTagName(entryLinks, 'entryLink');
  for (const unit of units) {
    const id = unit.getAttribute('id');
    const name = unit.getAttribute('name');
    if (!id || !name) continue;

    categories.set(id, name);
  }
  return categories;
}
