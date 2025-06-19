import type { Weapon, WeaponConstraint } from '../common/UnitData';
import { findAllByTagAndAttr, findFirstByTagAndAttr } from './utils';

export function parseWeapons(root: Element): {
  melee_weapons: Weapon[];
  ranged_weapons: Weapon[];
  constraints?: WeaponConstraint[];
} {
  const melee_weapons: Weapon[] = [];
  const ranged_weapons: Weapon[] = [];
  let constraints: WeaponConstraint[] = [];

  // TODO: fix this logic to parse weapon constraints correctly
  // If this is a model selectionEntry, try to parse constraints
  // if (root.tagName === 'selectionEntry' && root.getAttribute('type') === 'model') {
  //   constraints = parseWeaponConstraints(root);
  // }

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

  return {
    melee_weapons,
    ranged_weapons,
    constraints: constraints.length ? constraints : undefined,
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
  };

  let abilityText =
    findFirstByTagAndAttr(root, 'characteristic', 'name', 'Ability')?.textContent?.trim() || '';
  if (abilityText) {
    weapon.abilities = abilityText.split(',');
  }

  return weapon;
}

// Disabled for now until we fix this logic
// function parseWeaponConstraints(selectionEntry: Element): WeaponConstraint[] {
//   const constraints: WeaponConstraint[] = [];
//   // 1-in-X constraints (existing logic)
//   const upgradeEntries = findAllByTagAndAttr(selectionEntry, 'selectionEntry', 'type', 'upgrade');
//   for (const upgrade of upgradeEntries) {
//     const name = upgrade.getAttribute('name') || '';
//     const constraintEls = findAllByTagAndAttr(upgrade, 'constraint', 'type', 'max');
//     for (const constraintEl of constraintEls) {
//       const value = Number(constraintEl.getAttribute('value'));
//       const scope = constraintEl.getAttribute('scope') || '';
//       if (value === 1 && scope && selectionEntry.getAttribute('type') === 'model') {
//         // Find increment modifier for X
//         const modifiers = upgrade.getElementsByTagName('modifier');
//         for (const modifier of Array.from(modifiers)) {
//           if (modifier.getAttribute('type') === 'increment') {
//             const incValue = Number(modifier.getAttribute('value'));
//             if (incValue > 1) {
//               constraints.push({
//                 type: 'one-in-x',
//                 value: incValue,
//                 weaponNames: [name],
//               });
//             }
//           }
//         }
//       }
//     }
//   }
//   // either-or constraints: look for selectionEntryGroups with max 1 and multiple upgrades
//   const entryGroups = selectionEntry.getElementsByTagName('selectionEntryGroup');
//   for (const group of Array.from(entryGroups)) {
//     // Only consider groups with constraints max=1
//     const groupConstraints = findAllByTagAndAttr(group, 'constraint', 'type', 'max');
//     if (groupConstraints.some(c => Number(c.getAttribute('value')) === 1)) {
//       // Get all upgrade names in this group
//       const groupUpgrades = findAllByTagAndAttr(group, 'selectionEntry', 'type', 'upgrade');
//       const weaponNames = groupUpgrades.map(e => e.getAttribute('name')).filter(Boolean) as string[];
//       if (weaponNames.length > 1) {
//         constraints.push({
//           type: 'either-or',
//           value: 1,
//           weaponNames,
//         });
//       }
//     }
//   }
//   return constraints;
// }
