import {
  findFirstByTagAndAllAttrs,
  findAllByTagAndAttr,
  getDirectChildByTagName,
  findChildByTagName,
  findAllDirectChildrenByTagAndAttr,
} from './utils';
import type { WeaponOption, ModelGroup } from '../common/UnitData';

export function parseModelGroups(root: Element): ModelGroup[] {
  const modelGroups: ModelGroup[] = [];

  // get unit id from the root element
  const unitId = root.getAttribute('id');
  if (!unitId) {
    return modelGroups;
  }
  console.log(`Parsing model groups for unit ID: ${unitId}`);

  const modelEntries = findAllByTagAndAttr(root, 'selectionEntry', 'type', 'model');
  console.log(`Found ${modelEntries.length} model entries for unit ID: ${unitId}`);
  for (const entry of modelEntries) {
    const name = entry.getAttribute('name');
    if (!name) {
      continue;
    }

    console.log(`Processing model entry: ${name} (ID: ${entry.getAttribute('id')})`);

    let count = 1; // default count to 1 if not specified

    // get the constraints tag directly under the model entry
    const modelConstraints = getDirectChildByTagName(entry, 'constraints');
    if (modelConstraints) {
      // get the model count for this model group
      const minConstraint = findFirstByTagAndAllAttrs(modelConstraints, 'constraint', {
        type: 'min',
        scope: 'parent',
      });
      console.log('found min constraints for model group:', minConstraint?.getAttribute('id'));
      count = minConstraint ? Number(minConstraint.getAttribute('value')) : 1;
      console.log(`Model group count for unit ID ${unitId}: ${count}`);
    }

    const weaponOptions = parseWeaponOptions(entry, unitId, count);

    const modelGroup: ModelGroup = {
      name: name,
      count: count,
      weapons: weaponOptions,
    };

    console.log(`Model Group: ${modelGroup.name}, Count: ${modelGroup.count}`);

    if (!modelGroup.name) {
      console.warn(`Model group name is empty for unit ID: ${unitId}`);
      continue;
    }

    console.log('pushing model group:', modelGroup);
    modelGroups.push(modelGroup);
  }

  return modelGroups;
}

function parseWeaponOptions(
  modelEntry: Element,
  unitId: string,
  groupCount: number
): WeaponOption[] {
  const weaponOptions: WeaponOption[] = [];

  // find nearest selectionEntries
  const weaponsRoot = findChildByTagName(modelEntry, 'selectionEntries');
  if (!weaponsRoot) {
    return weaponOptions;
  }

  let inSEG = false;
  if (weaponsRoot.parentNode?.nodeType == 1) {
    // Node.ELEMENT_NODE
    let parent = weaponsRoot.parentNode as Element;
    if (parent.tagName == 'selectionEntryGroup') {
      inSEG = true;
      console.log('Model entry is in a selectionEntryGroup.');
    }
  }

  const upgradeEntries = findAllDirectChildrenByTagAndAttr(
    weaponsRoot,
    'selectionEntry',
    'type',
    'upgrade'
  );

  console.log(
    `Found ${upgradeEntries.length} upgrade entries for model: ${modelEntry.getAttribute('name')}`
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
      console.log('found min constraints for weapon option:', minConstraint?.getAttribute('id'));
      if (!minConstraint) {
        const maxConstraint = findFirstByTagAndAllAttrs(constraints, 'constraint', {
          type: 'max',
          scope: unitId,
        });
        console.log('found max constraints for weapon option:', maxConstraint?.getAttribute('id'));
        if (!minConstraint && maxConstraint) {
          weaponOption.max = Number(maxConstraint.getAttribute('value'));
          console.log(`Weapon option ${name} has max constraint: ${weaponOption.max}`);
        }
      }
    }

    weaponOptions.push(weaponOption);
  }

  if (inSEG) {
    // if in seg everything should be mutually exclusive
    weaponOptions[weaponOptions.length - 1].max = groupCount;
    console.log(
      `Setting max for weapon option ${weaponOptions[weaponOptions.length - 1].name} to group count: ${groupCount}`
    );
  }

  return weaponOptions;
}

/*
<selectionEntry type="unit" name="Unit Name", id="unitId">
	<selectionEntries>
		<selectionEntry type="model" name="Model Name" id="modelId">
			<constraints>
				<constraint type="min" value="1" scope="parent>
			</constraint>
		</selectionEntry>
		<selectionEntry type="model" name="Another Model Name" id="anotherModelId">
		<selectionEntries>
	</selectionEntries>
</selectionEntry>
*/
