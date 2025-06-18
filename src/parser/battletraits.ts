import type { Ability } from '../common/Ability';
import { findFirstByTagAndAttrPrefix } from './utils';
import { parseAbilities } from './abilities';

export function parseBattleTraits(root: Element): Ability[] {
  const traitElement = findFirstByTagAndAttrPrefix(root, 'selectionEntry', 'name', 'Battle Trait');
  if (!traitElement) {
    return []; // Return empty array if no battle trait is found
  }

  return parseAbilities(traitElement);
}
