import { Model, type IModel } from '../models/model';
import { WeaponOption, type IWeaponOption } from '../models/weaponOption';
import { findAllByTagAndAttrs, findFirstByTagAndAttrs } from '../util';

export function parseModels(unitNode: any): Map<string, Model> {
  const modelNodes =
    unitNode?.selectionEntries?.selectionEntry?.filter((node: any) => {
      return node['@_type'] === 'model';
    }) || [];

  const models: Map<string, Model> = new Map<string, Model>();
  const nameCounts: Record<string, number> = {};

  for (const modelNode of modelNodes) {
    const weapons = parseWeaponOptions(modelNode);

    const baseName = modelNode['@_name'];
    nameCounts[baseName] = (nameCounts[baseName] || 0) + 1;
    let modelName = baseName;
    if (
      nameCounts[baseName] === 1 &&
      modelNodes.filter((n: any) => n['@_name'] === baseName).length > 1
    ) {
      // First occurrence of a duplicate, rename as {name} A
      modelName = `${baseName} A`;
    } else if (nameCounts[baseName] > 1) {
      // Subsequent duplicates: {name} B, {name} C, etc.
      const suffix = String.fromCharCode(64 + nameCounts[baseName]);
      modelName = `${baseName} ${suffix}`;
    }

    const model: Partial<IModel> = {
      name: modelName,
      count: parseInt(
        findFirstByTagAndAttrs(modelNode, 'constraint', { type: 'min', scope: 'parent' })?.[
          '@_value'
        ] || '1',
        10
      ),
      weapons: weapons.reduce((map: Map<string, WeaponOption>, option: WeaponOption) => {
        if (option.name) {
          map.set(option.name, option);
        }
        return map;
      }, new Map<string, WeaponOption>()),
    };

    models.set(modelName, new Model(model));
  }

  return models;
}

export function parseWeaponOptions(modelNode: any): WeaponOption[] {
  const weaponOptions: WeaponOption[] = [];
  weaponOptions.push(...parseWeaponOptionsFromSelectionEntries(modelNode.selectionEntries));
  weaponOptions.push(
    ...(modelNode?.selectionEntryGroups?.selectionEntryGroup?.flatMap((group: any) => {
      return parseWeaponOptionsFromSelectionEntryGroup(group);
    }) || [])
  );
  return weaponOptions;
}

export function parseWeaponOptionsFromSelectionEntries(selectionEntriesNode: any): WeaponOption[] {
  const weaponNodes =
    selectionEntriesNode?.selectionEntry.filter((node: any) => {
      return node['@_type'] === 'upgrade';
    }) || [];

  const weaponOptions: Map<string, Partial<IWeaponOption>> = new Map();
  const exclusiveWeapons: Map<string, string[]> = new Map();

  for (const weaponNode of weaponNodes) {
    const id = weaponNode['@_id'];

    const weaponOption: Partial<IWeaponOption> = {
      name: weaponNode['@_name'],
    };

    // NOTE: we don't add weaponOptions here like in original

    const constraints = weaponNode.constraints?.constraint;
    const maxConstraint = constraints.find((c: any) => c['@_type'] === 'max');
    const minConstraint = constraints.find(
      (c: any) => c['@_type'] === 'min' && c['@_scope'] === 'parent'
    );

    // optional weapon
    if (!minConstraint && maxConstraint) {
      weaponOption.max = parseInt(maxConstraint['@_value'], 10);
    }

    // exclusive modifiers

    const exclusiveModifiers =
      weaponNode?.modifiers?.modifier?.filter((m: any) => {
        return m['@_type'] === 'set' && m['@_value'] === '0';
      }) || [];

    for (const modifier of exclusiveModifiers) {
      const exclusiveIds =
        findAllByTagAndAttrs(modifier, 'condition', {
          type: 'atLeast',
          value: '1',
        }).map((c: any) => c['@_childId']) || [];
      exclusiveWeapons.set(id, exclusiveIds);
    }

    weaponOptions.set(id, weaponOption);
  }

  // process exclusive weapon options
  for (const [weaponId, exclusiveIds] of exclusiveWeapons.entries()) {
    const weaponOption = weaponOptions.get(weaponId);
    if (!weaponOption) continue;

    if (weaponOption.max == undefined || weaponOption.max === 0) {
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
): WeaponOption[] {
  const groupName = selectionEntryGroup['@_name'];
  const weaponNodes =
    selectionEntryGroup?.selectionEntries?.selectionEntry.filter((node: any) => {
      return node['@_type'] === 'upgrade';
    }) || [];

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
