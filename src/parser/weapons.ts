import type { Weapon } from '../common/UnitData';
import { findAllByTagAndAttr, findFirstByTagAndAttr } from './utils';

export function parseWeapons(root: Element): {
  melee_weapons: Weapon[];
  ranged_weapons: Weapon[];
} {
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

  // Remove duplicates by name
  const uniqueMelee = new Map<string, Weapon>();
  for (const w of melee_weapons) {
    if (!uniqueMelee.has(w.name)) uniqueMelee.set(w.name, w);
  }
  const uniqueRanged = new Map<string, Weapon>();
  for (const w of ranged_weapons) {
    if (!uniqueRanged.has(w.name)) uniqueRanged.set(w.name, w);
  }

  return {
    melee_weapons: Array.from(uniqueMelee.values()),
    ranged_weapons: Array.from(uniqueRanged.values()),
  };
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
    range: findFirstByTagAndAttr(root, 'characteristic', 'name', 'Rng')?.textContent || undefined,
  };

  let abilityText =
    findFirstByTagAndAttr(root, 'characteristic', 'name', 'Ability')?.textContent?.trim() || '';
  if (abilityText) {
    weapon.abilities = abilityText.split(',');
  }

  return weapon;
}
