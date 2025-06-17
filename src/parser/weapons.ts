import type { Weapon } from '../common/UnitData';
import { findAllByTagAndAttr, findFirstByTagAndAttr } from './utils';

export function parseWeapons(root: Element): { melee_weapons: Weapon[]; ranged_weapons: Weapon[] } {
  const melee_weapons: Weapon[] = [];
  const ranged_weapons: Weapon[] = [];

  const meleeElements = findAllByTagAndAttr(root, 'profile', 'typeName', 'Melee Weapon');
  for (const element of meleeElements) {
    const weapon = parseWeapon(element);
    if (weapon.name) {
      melee_weapons.push(weapon);
    }
  }

  const rangedElements = findAllByTagAndAttr(root, 'profile', 'typeName', 'Ranged Weapon');
  for (const element of rangedElements) {
    const weapon = parseWeapon(element);
    if (weapon.name) {
      ranged_weapons.push(weapon);
    }
  }

  return { melee_weapons, ranged_weapons };
}

function parseWeapon(root: Element): Weapon {
  const weapon: Weapon = {
    name: root.getAttribute('name') || '',
    abilities: [],
    attacks: findFirstByTagAndAttr(root, 'characteristic', 'name', 'Atk')?.textContent || '',
    hit: findFirstByTagAndAttr(root, 'characteristic', 'name', 'Hit')?.textContent || '',
    wound: findFirstByTagAndAttr(root, 'characteristic', 'name', 'Wnd')?.textContent || '',
    rend: findFirstByTagAndAttr(root, 'characteristic', 'name', 'Rnd')?.textContent || '',
    damage: findFirstByTagAndAttr(root, 'characteristic', 'name', 'Dmg')?.textContent || '',
  };

  let abilityText =
    findFirstByTagAndAttr(root, 'characteristic', 'name', 'Ability')?.textContent?.trim() || '';
  if (abilityText) {
    weapon.abilities = abilityText.split(',');
  }

  return weapon;
}
