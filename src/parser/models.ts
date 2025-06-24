import {
  findFirstByTagAndAllAttrs,
  findAllByTagAndAttr,
  getDirectChildByTagName,
  findChildByTagName,
  findAllDirectChildrenByTagAndAttr,
  getChildren,
} from './utils';
import type { WeaponOption, ModelGroup } from '../common/UnitData';

export function parseModelGroups(root: Element): ModelGroup[] {
  const modelGroups: ModelGroup[] = [];

  // get unit id from the root element
  const unitId = root.getAttribute('id');
  if (!unitId) {
    return modelGroups;
  }

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
      const weaponOptions = parseWeaponOptions(weaponGroup, unitId, count);
      if (weaponOptions.length > 0) {
        allWeaponOptions.push(...weaponOptions);
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

    modelGroups.push(modelGroup);
  }

  return modelGroups;
}

function parseWeaponOptions(
  entriesRoot: Element,
  unitId: string,
  groupCount: number
): WeaponOption[] {
  const weaponOptions: WeaponOption[] = [];

  let inSEG = entriesRoot.tagName === 'selectionEntryGroups';
  const weaponsRoot = inSEG ? findChildByTagName(entriesRoot, 'selectionEntries') : entriesRoot;
  if (!weaponsRoot) {
    return weaponOptions;
  }

  const upgradeEntries = findAllDirectChildrenByTagAndAttr(
    weaponsRoot,
    'selectionEntry',
    'type',
    'upgrade'
  );

  for (const upgrade of upgradeEntries) {
    const name = upgrade.getAttribute('name');
    if (!name) {
      continue;
    }

    const weaponOption: WeaponOption = {
      name: name,
    };

    const constraints = getDirectChildByTagName(upgrade, 'constraints');
    if (constraints) {
      const minConstraint = findFirstByTagAndAllAttrs(constraints, 'constraint', {
        type: 'min',
        scope: 'parent',
      });
      if (!minConstraint) {
        const maxConstraint = findFirstByTagAndAllAttrs(constraints, 'constraint', {
          type: 'max',
          scope: unitId,
        });
        if (!minConstraint && maxConstraint) {
          weaponOption.max = Number(maxConstraint.getAttribute('value'));
        }
      }
    }

    weaponOptions.push(weaponOption);
  }

  if (inSEG) {
    // if in seg everything should be mutually exclusive
    weaponOptions[weaponOptions.length - 1].max = groupCount;
  }

  return weaponOptions;
}
