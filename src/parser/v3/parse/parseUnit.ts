import { Stats, type IStats } from '../models/stats';
import { Unit, type IUnit } from '../models/unit';
import { Weapon, type IWeapon } from '../models/weapon';
import { findAllByTagAndAttrs, mapTextNodesByName, nodeArray, toMapByName } from '../util';
import { parseAbilities } from './parseAbility';
import { parseModels } from './parseModels';

export function parseUnits(rootNode: any): IUnit[] {
  const units: IUnit[] = [];
  const unitNodes: any[] = nodeArray(rootNode.selectionEntries?.selectionEntry).filter(
    (node: any) => {
      return node['@_type'] === 'unit';
    }
  );
  unitNodes.forEach((unitNode: any) => {
    const unit = parseUnit(unitNode);
    if (unit.name) {
      units.push(unit);
    } else {
      console.warn(`Failed to parse unit from node: ${JSON.stringify(unitNode)}`);
    }
  });
  return units;
}

export function parseUnit(unitNode: any): IUnit {
  const unit: Partial<IUnit> = {
    name: unitNode['@_name'],
    stats: parseUnitStats(unitNode),
    meleeWeapons: parseMeleeWeapons(unitNode),
    rangedWeapons: parseRangedWeapons(unitNode),
    keywords: parseUnitKeywords(unitNode),
    abilities: parseAbilities(unitNode.profiles),
    models: toMapByName(parseModels(unitNode)),
    summoningSpell: null, // this will be set later if relevant as it requires data outside the unit node
  };

  return new Unit(unit);
}

export function parseRangedWeapons(unitNode: any): IWeapon[] {
  return parseWeapons(unitNode, 'Ranged Weapon');
}

export function parseMeleeWeapons(unitNode: any): IWeapon[] {
  return parseWeapons(unitNode, 'Melee Weapon');
}

export function parseWeapons(unitNode: any, weaponType: string): IWeapon[] {
  const weaponNodes = findAllByTagAndAttrs(unitNode, 'profile', {
    typeName: weaponType,
  });

  return weaponNodes.map((node: any) => parseUnitWeapon(node));
}

export function parseUnitWeapon(weaponNode: any): IWeapon {
  const characteristics = mapTextNodesByName(weaponNode.characteristics, 'characteristic');
  const weapon: Partial<IWeapon> = {
    name: weaponNode['@_name'],
    range: characteristics.get('Rng'),
    attacks: characteristics.get('Atk'),
    hit: characteristics.get('Hit'),
    wound: characteristics.get('Wnd'),
    rend: characteristics.get('Rnd'),
    damage: characteristics.get('Dmg'),
    abilities: splitWeaponAbilities(characteristics.get('Ability') || ''),
  };

  return new Weapon(weapon);
}

export function splitWeaponAbilities(text: string): string[] {
  return (
    text
      ?.split(',')
      .map((ability: string) => ability.trim())
      .filter((ability: string) => ability.length > 0 && ability !== '-') || []
  );
}

export function parseUnitStats(unitNode: any): IStats {
  const statsNode = nodeArray(unitNode.profiles?.profile).find((profile: any) => {
    return profile['@_typeName'] === 'Unit';
  });

  if (!statsNode) {
    console.warn(`No stats found for unit: ${unitNode['@_name']}`);
    return new Stats();
  }

  const characteristics = mapTextNodesByName(statsNode.characteristics, 'characteristic');
  const stats: Partial<IStats> = {
    move: characteristics.get('Move'),
    health: characteristics.get('Health'),
    save: characteristics.get('Save'),
    control: characteristics.get('Control'),
    banishment: characteristics.get('Banishment'),
  };

  return new Stats(stats);
}

export function parseUnitKeywords(unitNode: any): string[] {
  const keywordNodes = nodeArray(unitNode.categoryLinks?.categoryLink);
  const keywords: string[] = [];
  keywordNodes.forEach((keywordNode: any) => {
    if (keywordNode['@_name']) {
      keywords.push(keywordNode['@_name']);
    }
  });
  return keywords;
}
