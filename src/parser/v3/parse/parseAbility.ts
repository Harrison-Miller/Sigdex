import { Ability, type IAbility } from '../models/ability';
import { mapTextNodesByName } from '../util';

export function parseAbility(abilityNode: any): IAbility {
  if (!abilityNode) return new Ability();

  const typeName = abilityNode['@_typeName'] || '';
  const characteristics = mapTextNodesByName(abilityNode.characteristics, 'characteristic');
  const attributes = mapTextNodesByName(abilityNode.attributes, 'attribute');

  const ability: Partial<IAbility> = {
    name: abilityNode['@_name'],
    timing: characteristics.get('Timing'),
    color: attributes.get('Color'),
    type: attributes.get('Type'),
    effect: characteristics.get('Effect'),
    declare: characteristics.get('Declare'),
    castingValue: characteristics.get('Casting Value'),
    chantingValue: characteristics.get('Chanting Value'),
    commandPoints: characteristics.get('Cost'),
    keywords: splitAbilityKeywords(characteristics.get('Keywords') || ''),
  };

  // TODO: handle points cost, might just move it up to an enhancement class

  if (typeName.toLowerCase().includes('passive')) {
    ability.timing = 'Passive';
  }

  return new Ability(ability);
}

export function parseAbilities(profilesNode: any): IAbility[] {
  return profilesNode?.profile
    .filter((profile: any) => {
      const typeName = profile['@_typeName'] || '';
      return typeName.startsWith('Ability');
    })
    .map((profile: any) => parseAbility(profile));
}

export function splitAbilityKeywords(text: string): string[] {
  return (
    text
      ?.split(',')
      .map((keyword: string) => keyword.trim())
      .filter((keyword: string) => keyword.length > 0 && keyword !== '-') || []
  );
}
