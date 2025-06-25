import type { Ability } from '../common/Ability';
import { findAllByTagAndAttrPrefix, findFirstByTagAndAttr } from './utils';

export function parseAbilities(root: Element): Ability[] {
  const abilities: Ability[] = [];

  const points = Number(
    findFirstByTagAndAttr(root, 'cost', 'typeId', 'points')?.getAttribute('value')
  );
  const abilityElements = findAllByTagAndAttrPrefix(root, 'profile', 'typeName', 'Ability');
  for (const element of abilityElements) {
    let timing =
      findFirstByTagAndAttr(element, 'characteristic', 'name', 'Timing')?.textContent || '';
    // If timing is empty and typeName contains 'passive', set timing to 'Passive'
    if (!timing) {
      const typeName = element.getAttribute('typeName') || '';
      if (typeName.toLowerCase().includes('passive')) {
        timing = 'Passive';
      }
    }
    const ability: Ability = {
      name: element.getAttribute('name') || '',
      timing,
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
      chantingValue:
        findFirstByTagAndAttr(element, 'characteristic', 'name', 'Chanting Value')?.textContent ||
        '',
      points: isNaN(points) || points === 0 ? undefined : points,
    };
    if (ability.name) {
      abilities.push(ability);
    }
  }
  return abilities;
}
