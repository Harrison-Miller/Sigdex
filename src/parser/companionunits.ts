import {
  findFirstByTagAndAttr,
  findAllByTagAndAllAttrs,
  closestByTagName,
  findFirstByTagAndAllAttrs,
} from './utils';

export function parseCompanionUnits(root: Element, unitName: string): string[] {
  const companions: string[] = [];

  companions.push(...parseCompanionUnitsByCondition(root, unitName));
  companions.push(...parseCompanionByRecursiveModifier(root, unitName));

  // remove self
  if (companions.includes(unitName)) {
    console.log(`Removing self from companions: ${unitName}`);
    companions.splice(companions.indexOf(unitName), 1);
  }

  return Array.from(new Set(companions));
}

function parseCompanionByRecursiveModifier(root: Element, unitName: string): string[] {
  const companions: string[] = [];
  const unitEntry = findFirstByTagAndAttr(root, 'entryLink', 'name', unitName);
  if (!unitEntry) {
    return companions;
  }

  const id = unitEntry.getAttribute('id');
  if (!id) {
    return companions;
  }

  console.log(`Finding companions for unit by recursive modifier search: ${unitName} (ID: ${id})`);

  // turns out this constraint isn't always present
  // has -1 constraint
  // const constraint = findFirstByTagAndAllAttrs(unitEntry, 'constraint', {
  // 	type: 'min',
  // 	value: '-1',
  // 	scope: 'force',
  // });

  // if (constraint) {
  // find all recursive modifiers
  const modifiers = findAllByTagAndAllAttrs(unitEntry, 'modifier', {
    type: 'add',
    scope: 'force',
  });

  for (const modifier of modifiers) {
    const affects = modifier.getAttribute('affects');
    if (!affects) continue;

    const id = affects.split('.').pop();
    if (!id) continue;

    // find the companion unit by id
    const companionUnit = findFirstByTagAndAttr(root, 'entryLink', 'id', id);
    if (!companionUnit) continue;

    const name = companionUnit.getAttribute('name');
    if (!name) continue;

    console.log(`Found companion by recursive modifier: ${name} with ID: ${id}`);
    companions.push(name);
  }
  // }

  // reverse search for the companion unit
  // look for modifiers that reference the unitEntry id
  const reverseModifiers = findAllByTagAndAllAttrs(root, 'modifier', {
    type: 'add',
    scope: 'force',
    affects: `self.entries.recursive.${id}`,
  });

  for (const modifier of reverseModifiers) {
    // get the ancestor unitEntry
    const ancestor = closestByTagName(modifier, 'entryLink');
    if (!ancestor) continue;

    const name = ancestor.getAttribute('name');
    if (!name) continue;

    // turns out this constraint isn't always present
    // check if the ancestor is a companion unit
    // const companionConstraint = findFirstByTagAndAllAttrs(ancestor, 'constraint', {
    // 	type: 'min',
    // 	value: '-1',
    // 	scope: 'force',
    // });

    // if (!companionConstraint) continue;

    console.log(
      `Found companion by reverse recursive modifier: ${name} with ID: ${ancestor.getAttribute('id')}`
    );
    companions.push(name);

    // recursively find companions from the parent
    companions.push(...parseCompanionByRecursiveModifier(root, name));
  }

  return Array.from(new Set(companions));
}

function parseCompanionUnitsByCondition(root: Element, unitName: string): string[] {
  const companions: string[] = [];
  const unitEntry = findFirstByTagAndAttr(root, 'entryLink', 'name', unitName);
  if (!unitEntry) {
    return companions;
  }

  const id = unitEntry.getAttribute('id');
  if (!id) {
    return companions;
  }

  console.log(`Finding companions for unit: ${unitName} (ID: ${id})`);

  const companionConditions = findAllByTagAndAllAttrs(root, 'condition', {
    type: 'atLeast',
    value: '1',
    scope: 'force',
    childId: id,
  });

  for (const condition of companionConditions) {
    const modifier = closestByTagName(condition, 'modifier');
    if (!modifier) continue;

    const type = modifier.getAttribute('type');
    const value = modifier.getAttribute('value');
    const constraintId = modifier.getAttribute('field');
    if (!constraintId) continue;

    if (type != 'set' || value != '1') continue;

    const companionUnit = closestByTagName(condition, 'entryLink');
    if (!companionUnit) continue;

    const name = companionUnit.getAttribute('name');
    if (!name) continue;

    // look for the constraint
    const constraint = findFirstByTagAndAllAttrs(companionUnit, 'constraint', {
      type: 'min',
      value: '-1',
      scope: 'force',
      id: constraintId,
    });
    if (!constraint) continue;

    console.log(`Found companion: ${name} with constraint ID: ${constraintId}`);
    companions.push(name);
  }

  // under the unitEntry look for conditions
  console.log(`Searching for companions in conditions of unit: ${unitName}`);
  const unitConstraints = findAllByTagAndAllAttrs(unitEntry, 'constraint', {
    type: 'min',
    value: '-1',
    scope: 'force',
  });

  for (const constraint of unitConstraints) {
    const constraintId = constraint.getAttribute('id');
    if (!constraintId) continue;

    // find the modifier with field=constraintId
    const modifier = findFirstByTagAndAllAttrs(unitEntry, 'modifier', {
      type: 'set',
      value: '1',
      field: constraintId,
    });
    if (!modifier) continue;

    // find the condition under the modifier
    const condition = findFirstByTagAndAllAttrs(modifier, 'condition', {
      type: 'atLeast',
      value: '1',
      scope: 'force',
    });
    if (!condition) continue;

    const id = condition.getAttribute('childId');
    if (!id) continue;

    // find the companion unit by id
    const companionUnit = findFirstByTagAndAttr(root, 'entryLink', 'id', id);
    if (!companionUnit) continue;

    const name = companionUnit.getAttribute('name');
    if (!name) continue;

    console.log(
      `Found companion from unit constraints: ${name} with constraint ID: ${constraintId}`
    );
    companions.push(name);
  }

  return Array.from(new Set(companions));
}
