import type { Ability } from '../common/Ability';
import { findAllByTagAndAttrPrefix, findFirstByTagAndAttr } from './utils';

export function parseAbilities(root: Element): Ability[] {
  const abilities: Ability[] = [];

  const abilityElements = findAllByTagAndAttrPrefix(root, 'profile', 'typeName', 'Ability');
  for (const element of abilityElements) {
    const ability: Ability = {
      name: element.getAttribute('name') || '',
      timing: findFirstByTagAndAttr(element, 'characteristic', 'name', 'Timing')?.textContent || '',
      text: findFirstByTagAndAttr(element, 'characteristic', 'name', 'Effect')?.textContent || '',
      keywords: (
        findFirstByTagAndAttr(element, 'characteristic', 'name', 'Keywords')?.textContent || ''
      )
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k),
      color: findFirstByTagAndAttr(element, 'attribute', 'name', 'Color')?.textContent || '',
      type: findFirstByTagAndAttr(element, 'attribute', 'name', 'Type')?.textContent || '',
      cost: findFirstByTagAndAttr(element, 'characteristic', 'name', 'Cost')?.textContent || '',
      castingValue:
        findFirstByTagAndAttr(element, 'characteristic', 'name', 'Casting Value')?.textContent ||
        '',
      declare:
        findFirstByTagAndAttr(element, 'characteristic', 'name', 'Declare')?.textContent || '',
    };
    if (ability.name) {
      abilities.push(ability);
    }
  }
  return abilities;
}
