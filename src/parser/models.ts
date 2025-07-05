import {
  findFirstByTagAndAllAttrs,
  findAllByTagAndAttr,
  getDirectChildByTagName,
  findChildByTagName,
  findAllDirectChildrenByTagAndAttr,
  getChildren,
  findAllByTagAndAllAttrs,
} from './utils';
import type { WeaponOption, ModelGroup } from '../common/UnitData';

export function parseModelGroups(root: Element): ModelGroup[] {
  const modelGroups: ModelGroup[] = [];

  // get unit id from the root element
  const unitId = root.getAttribute('id');
  if (!unitId) {
    return modelGroups;
  }

  const nameCount: Map<string, number> = new Map();
  const modelEntries = findAllByTagAndAttr(root, 'selectionEntry', 'type', 'model');
  for (const entry of modelEntries) {
    const name = entry.getAttribute('name');
    if (!name) {
      continue;
    }

    let count = 1; // default count to 1 if not specified

    // get the constraints tag directly under the model entry
    const modelConstraints = getDirectChildByTagName(entry, 'constraints');
    if (modelConstraints) {
      // get the model count for this model group
      const minConstraint = findFirstByTagAndAllAttrs(modelConstraints, 'constraint', {
        type: 'min',
        scope: 'parent',
      });
      count = minConstraint ? Number(minConstraint.getAttribute('value')) : 1;
    }

    // find all selectionEntries or selectionEntryGroups directly under this model entry
    const weaponGroups = getChildren(entry).filter((child) => {
      return child.tagName === 'selectionEntries' || child.tagName === 'selectionEntryGroups';
    });
    const allWeaponOptions: WeaponOption[] = [];
    for (const weaponGroup of weaponGroups) {
      if (weaponGroup.tagName === 'selectionEntries') {
        const weaponOptions = parseWeaponOptionsFromSelectionEntries(weaponGroup);
        allWeaponOptions.push(...weaponOptions);
      } else if (weaponGroup.tagName === 'selectionEntryGroups') {
        // get all selectionEntryGroup elements
        const groups = Array.from(weaponGroup.getElementsByTagName('selectionEntryGroup'));
        for (const group of groups) {
          const weaponOptions = parseWeaponOptionsFromSelectionEntryGroup(group);
          allWeaponOptions.push(...weaponOptions);
        }
      }
    }

    const modelGroup: ModelGroup = {
      name: name,
      count: count,
      weapons: allWeaponOptions,
    };

    if (!modelGroup.name) {
      continue;
    }

    nameCount.set(modelGroup.name, (nameCount.get(modelGroup.name) || 0) + 1);

    modelGroups.push(modelGroup);
  }

  // deduplicate model group names with the same name. i.e) Stormfiend, Stormfiend, Stormfiend becomes: Stormfiend A, Stormfiend B, Stormfiend C
  const usedNameCount: Map<string, number> = new Map();
  for (const modelGroup of modelGroups) {
    const name = modelGroup.name;
    const count = nameCount.get(name) || 0;
    if (count > 1) {
      const currentCount = usedNameCount.get(name) || 0;
      modelGroup.name += ` ${String.fromCharCode(65 + currentCount)}`; // A, B, C, etc.
      usedNameCount.set(name, currentCount + 1);
    }
  }

  return modelGroups;
}

function parseWeaponOptionsFromSelectionEntries(weaponsRoot: Element): WeaponOption[] {
  const weaponOptions: Map<String, WeaponOption> = new Map();
  const exclusiveWeapons: Map<string, string[]> = new Map(); // weaponId to exclusive weaponIds

  const weaponEntries = findAllDirectChildrenByTagAndAttr(
    weaponsRoot,
    'selectionEntry',
    'type',
    'upgrade'
  );

  for (const weapon of weaponEntries) {
    const name = weapon.getAttribute('name');
    if (!name) continue;

    const id = weapon.getAttribute('id');
    if (!id) continue;

    // add the weapon option to the map
    weaponOptions.set(id, {
      name: name,
    });

    // get the constraint directly under the weapon entry
    const constraints = getDirectChildByTagName(weapon, 'constraints');
    if (!constraints) continue;

    const constraintEntries = Array.from(constraints.getElementsByTagName('constraint'));
    const max =
      constraintEntries.find((c) => c.getAttribute('type') === 'max')?.getAttribute('value') ||
      undefined;
    const min =
      constraintEntries
        .find((c) => c.getAttribute('type') === 'min' && c.getAttribute('scope') === 'parent')
        ?.getAttribute('value') || undefined;

    // optional weapon
    const weaponOption = weaponOptions.get(id);
    if (!min && max && weaponOption) {
      weaponOption.max = Number(max);
    }

    // parse modifiers
    const modifiers = getDirectChildByTagName(weapon, 'modifiers');
    if (!modifiers) continue;

    const exclusiveModifiers = findAllByTagAndAllAttrs(modifiers, 'modifier', {
      type: 'set',
      value: '0',
    });

    // for each exclusive modifier gather all conditions
    for (const modifier of exclusiveModifiers) {
      const atLeastConditions = findAllByTagAndAllAttrs(modifier, 'condition', {
        type: 'atLeast',
        value: '1',
        scope: 'parent',
      });

      const childIds = atLeastConditions
        .map((c) => c.getAttribute('childId'))
        .filter((id): id is string => id !== null);
      if (childIds.length === 0) continue;

      // store exclusive weapons
      if (!exclusiveWeapons.has(id)) {
        exclusiveWeapons.set(id, childIds);
      }
    }
  }

  // now we need to process the exclusive weapons
  for (const [weaponId, exclusiveIds] of exclusiveWeapons.entries()) {
    const weaponOption = weaponOptions.get(weaponId);
    if (!weaponOption) continue;

    if (weaponOption.max == undefined) {
      // this weapon is a default weapon and will not replace anything.
      // for each exclusive weapon, we will set that weapon's replaces to this weapon's name

      for (const exclusiveId of exclusiveIds) {
        const exclusiveOption = weaponOptions.get(exclusiveId);
        if (exclusiveOption) {
          exclusiveOption.replaces = exclusiveOption.replaces || [];
          exclusiveOption.replaces.push(weaponOption.name);
        }
      }
    } else {
      // this weapon is an exclusive weapon, so we will set its replaces to the names of all other exclusive weapons
      weaponOption.replaces = weaponOption.replaces || [];
      for (const exclusiveId of exclusiveIds) {
        if (exclusiveId !== weaponId) {
          const exclusiveOption = weaponOptions.get(exclusiveId);
          if (exclusiveOption) {
            weaponOption.replaces.push(exclusiveOption.name);
          }
        }
      }
    }
  }

  return Array.from(weaponOptions.values());
}

// weapon options in selectionEntryGroups are inherently mutually exclusive
function parseWeaponOptionsFromSelectionEntryGroup(root: Element): WeaponOption[] {
  const groupName = root.getAttribute('name');
  if (!groupName) return [];

  const weaponOptions: WeaponOption[] = [];

  const weaponsRoot = findChildByTagName(root, 'selectionEntries');
  if (!weaponsRoot) return weaponOptions;

  const weaponEntries = findAllDirectChildrenByTagAndAttr(
    weaponsRoot,
    'selectionEntry',
    'type',
    'upgrade'
  );

  // I think segs are only ever max 1 selection. But they do have a constraint at seg level (1 level down) that might be the number of times the selection can be made.
  // I'd need find an example of a seg with more than 1 selection to be sure. For now we'll assum it's always 1.

  for (const weapon of weaponEntries) {
    const name = weapon.getAttribute('name');
    if (!name) continue;

    const weaponOption: WeaponOption = {
      name: name,
      group: groupName,
    };

    weaponOptions.push(weaponOption);
  }

  return weaponOptions;
}
