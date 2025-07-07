import { Ability, type IAbility } from '../models/ability';
import { nodeArray, mapTextNodesByName } from '../util';

export function parseAbility(abilityNode: any): IAbility {
  const typeName = abilityNode['@_typeName'] || '';
  const characteristics = mapTextNodesByName(abilityNode.characteristics, 'characteristic');
  const attributes = mapTextNodesByName(abilityNode.attributes, 'attribute');

  const ability: Partial<IAbility> = {
    name: abilityNode['@_name'],
    timing: attributes.get('timing'),
    color: attributes.get('color'),
    effect: characteristics.get('effect'),
    declare: characteristics.get('declare'),
    castingValue: characteristics.get('casting value'),
    chantingValue: characteristics.get('chanting value'),
    commandPoints: characteristics.get('command points'),
    points: parseInt(characteristics.get('points') || '0', 10),
    keywords: (characteristics.get('keywords') || '')
      .split(',')
      .map((keyword: string) => keyword.trim()),
  };

  if (typeName.toLowerCase().includes('passive')) {
    ability.timing = 'Passive';
  }

  return new Ability(ability);
}

export function parseAbilities(profilesNode: any): IAbility[] {
  return nodeArray(profilesNode?.profile)
    .filter((profile: any) => {
      const typeName = profile['@_typeName'] || '';
      return typeName.startsWith('Ability');
    })
    .map((profile: any) => parseAbility(profile));
}
