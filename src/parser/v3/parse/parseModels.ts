import { Model, type IModel } from '../models/model';
import { WeaponOption, type IWeaponOption } from '../models/weaponOption';
import { findFirstByTagAndAttrs, nodeArray } from '../util';

export function parseModels(unitNode: any): IModel[] {
  const modelNodes = nodeArray(unitNode.selectionEntries?.selectionEntry).filter((node: any) => {
    return node['@_type'] === 'model';
  });

  const models: IModel[] = [];
  for (const modelNode of modelNodes) {
    const weapons = parseWeaponOptions(modelNode);

    const model: Partial<IModel> = {
      name: modelNode['@_name'],
      count: parseInt(
        findFirstByTagAndAttrs(modelNode, 'constraint', { type: 'min', scope: 'parent' })?.[
          '@_value'
        ] || '1',
        10
      ),
      weapons: weapons.reduce((map: Map<string, IWeaponOption>, option: IWeaponOption) => {
        if (option.name) {
          map.set(option.name, option);
        }
        return map;
      }, new Map<string, IWeaponOption>()),
    };

    console.log(`parsed model:`, model);
    models.push(new Model(model));
  }
  return models;
}

export function parseWeaponOptions(modelNode: any): IWeaponOption[] {
  const weaponOptions: IWeaponOption[] = [];
  weaponOptions.push(...parseWeaponOptionsFromSelectionEntries(modelNode.selectionEntries));
  weaponOptions.push(
    ...nodeArray(modelNode.selectionEntryGroups?.selectionEntryGroup).flatMap((group: any) => {
      return parseWeaponOptionsFromSelectionEntryGroup(group);
    })
  );
  return weaponOptions;
}

export function parseWeaponOptionsFromSelectionEntries(selectionEntriesNode: any): IWeaponOption[] {
  const weaponNodes = nodeArray(selectionEntriesNode?.selectionEntry).filter((node: any) => {
    return node['@_type'] === 'upgrade';
  });

  const weaponOptions: Map<string, Partial<IWeaponOption>> = new Map();
  const exclusiveWeapons: Map<string, string[]> = new Map();

  for (const weaponNode of weaponNodes) {
    const id = weaponNode['@_id'];

    const weaponOption: Partial<IWeaponOption> = {
      name: weaponNode['@_name'],
    };

    const constraints = nodeArray(weaponNode.constraints?.constraint);
    const maxConstraint = constraints.find((c: any) => c['@_type'] === 'max');
    const minConstraint = constraints.find((c: any) => c['@_type'] === 'min');

    // optional weapon
    if (!minConstraint && maxConstraint) {
      weaponOption.max = parseInt(maxConstraint['@_value'], 10);
    }

    // exclusive modifiers
    const exclusiveModifiers = nodeArray(weaponNode.modifiers?.modifier).filter((m: any) => {
      return m['@_type'] === 'set' && m['@_value'] === '0';
    });

    for (const modifier of exclusiveModifiers) {
      const exclusiveIds = nodeArray(modifier.conditions?.condition)
        .filter((c: any) => {
          return c['@_type'] === 'atLeast' && c['@_value'] === '1';
        })
        .map((c: any) => c['@_childId']);
      exclusiveWeapons.set(id, exclusiveIds);
    }

    weaponOptions.set(id, weaponOption);
  }

  // process exclusive weapon options
  for (const [weaponId, exclusiveIds] of exclusiveWeapons.entries()) {
    const weaponOption = weaponOptions.get(weaponId);
    if (!weaponOption) continue;

    if (weaponOption.max == undefined) {
      // this weapon is a default weapon and will not replace anything.
      // for each exclusive weapon, we will set that weapon's replaces to this weapon's name

      for (const exclusiveId of exclusiveIds) {
        const exclusiveOption = weaponOptions.get(exclusiveId);
        if (exclusiveOption && weaponOption.name) {
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
          if (exclusiveOption && exclusiveOption.name) {
            weaponOption.replaces.push(exclusiveOption.name);
          }
        }
      }
    }
  }

  return Array.from(weaponOptions.values()).map((option) => new WeaponOption(option));
}

export function parseWeaponOptionsFromSelectionEntryGroup(
  selectionEntryGroup: any
): IWeaponOption[] {
  const groupName = selectionEntryGroup['@_name'];
  const weaponNodes = nodeArray(selectionEntryGroup?.selectionEntries?.selectionEntry).filter(
    (node: any) => {
      return node['@_type'] === 'upgrade';
    }
  );

  const weaponOptions: WeaponOption[] = [];
  for (const weaponNode of weaponNodes) {
    const weaponOption: Partial<IWeaponOption> = {
      name: weaponNode['@_name'],
      group: groupName,
    };
    weaponOptions.push(new WeaponOption(weaponOption));
  }

  return weaponOptions;
}
