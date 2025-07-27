import { Ability } from '../models/ability';
import type { Model } from '../models/model';
import { Stats, type IStats } from '../models/stats';
import { Unit, type IUnit } from '../models/unit';
import { Weapon, type IWeapon } from '../models/weapon';
import { findAllByTagAndAttrs, mapTextNodesByName } from '../util';
import { parseAbilities, parseAbility } from './parseAbility';
import { parseModels } from './parseModels';

export function parseUnits(rootNode: any): Unit[] {
  const sharedAbilities = parseSharedAbilities(rootNode);

  const units: Unit[] = [];
  const unitNodes =
    rootNode?.sharedSelectionEntries?.selectionEntry.filter((node: any) => {
      return node['@_type'] === 'unit';
    }) || [];
  unitNodes.forEach((unitNode: any) => {
    const unit = parseUnit(unitNode, sharedAbilities);
    if (unit.name) {
      units.push(unit);
    } else {
      console.warn(`Failed to parse unit from node: ${JSON.stringify(unitNode)}`);
    }
  });
  return units;
}

export function parseSharedAbilities(rootNode: any): Map<string, Ability> {
  const abilityNodes = rootNode?.sharedProfiles?.profile || [];
  const abilitiesMap = new Map<string, Ability>();
  abilityNodes.forEach((abilityNode: any) => {
    const ability = parseAbility(abilityNode);
    if (ability.name) {
      abilitiesMap.set(ability.name, ability);
    }
  });
  return abilitiesMap;
}

export function parseUnit(unitNode: any, sharedAbilities: Map<string, Ability>): Unit {
  const id = unitNode['@_id'] || '';
  const unit: Partial<IUnit> = {
    name: unitNode['@_name'],
    stats: parseUnitStats(unitNode),
    meleeWeapons: parseMeleeWeapons(unitNode),
    rangedWeapons: parseRangedWeapons(unitNode),
    keywords: parseUnitKeywords(unitNode),
    abilities: parseAbilities(unitNode.profiles),
    models: parseModels(unitNode),
    descriptions: parseDescriptions(unitNode),
  };

  // add shared abilities
  const abilityLinks =
    unitNode?.infoLinks?.infoLink?.filter((link: any) => link['@_type'] === 'profile') || [];
  unit.abilities = (unit?.abilities || []).concat(
    abilityLinks
      .map((link: any) => {
        const abilityName = link['@_name'];
        return sharedAbilities.get(abilityName) || null;
      })
      .filter((ability: Ability | null) => ability !== null)
  );

  // calculate unit size based on models
  if (unit.models && unit.models.size > 0) {
    unit.unitSize = Array.from(unit.models.values()).reduce((sum: number, model: any) => {
      return sum + (model.count || 1); // default count to 1 if not specified
    }, 0);
  } else {
    unit.unitSize = 1; // default to 1 if no models are present
  }

  // remove models if it's only default models
  if (unit.models && isDefaultModels(Array.from(unit.models.values()))) {
    unit.models = new Map<string, Model>(); // return empty map if all models are default
  }

  // if manifestation create a placeholder summoning spell
  if (unit.keywords?.includes('MANIFESTATION')) {
    unit.summoningSpell = new Ability({
      name: id
    });
  }

  return new Unit(unit);
}

export function parseRangedWeapons(unitNode: any): Weapon[] {
  return parseWeapons(unitNode, 'Ranged Weapon');
}

export function parseMeleeWeapons(unitNode: any): Weapon[] {
  return parseWeapons(unitNode, 'Melee Weapon');
}

export function parseWeapons(unitNode: any, weaponType: string): Weapon[] {
  const weaponNodes = findAllByTagAndAttrs(unitNode, 'profile', {
    typeName: weaponType,
  }); // this is causing issues

  const weapons = weaponNodes.map((node: any) => parseUnitWeapon(node));

  // remove duplicates by name
  const uniqueWeapons: Map<string, Weapon> = new Map();
  for (const weapon of weapons) {
    if (!uniqueWeapons.has(weapon.name.trim())) {
      uniqueWeapons.set(weapon.name.trim(), weapon);
    }
  }
  return Array.from(uniqueWeapons.values());
}

export function parseUnitWeapon(weaponNode: any): Weapon {
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

export function parseUnitStats(unitNode: any): Stats {
  const statsNode = unitNode.profiles?.profile.find((profile: any) => {
    return profile['@_typeName'] === 'Unit' || profile['@_typeName'] === 'Manifestation';
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
  const keywordNodes = unitNode.categoryLinks?.categoryLink;
  const keywords: string[] = [];
  keywordNodes.forEach((keywordNode: any) => {
    if (keywordNode['@_name']) {
      keywords.push(keywordNode['@_name'].toUpperCase());
    }
  });
  return keywords;
}

export function isDefaultModels(modelGroups: Model[]): boolean {
  if (modelGroups.length > 1) return false;
  if (modelGroups.length === 0) return true;
  const group = modelGroups[0];
  return Array.from(group.weapons.values()).every((w) => w.type === 'default');
}

export function parseDescriptions(unitNode: any): string[] {
  const ruleNodes = findAllByTagAndAttrs(unitNode, 'rule', {
    hidden: 'false',
  });
  const descriptions: string[] = [];
  ruleNodes.forEach((node: any) => {
    const description = (typeof node?.description === 'string' ? node.description : node?.description?.['#text']) || '';
    const hasMod = node?.modifiers;
    if (!hasMod && description) {
      descriptions.push(description);
    }
  });
  return descriptions;
}