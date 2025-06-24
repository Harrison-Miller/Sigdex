import { findFirstByTagAndAttr } from './utils';

export function parseReinforceable(root: Element, unitName: string): boolean {
  const unitEntry = findFirstByTagAndAttr(root, 'entryLink', 'name', unitName);
  if (!unitEntry) return false;

  const reinforcedLink = findFirstByTagAndAttr(unitEntry, 'entryLink', 'name', 'Reinforced');
  if (!reinforcedLink) return false;

  return true;
}
