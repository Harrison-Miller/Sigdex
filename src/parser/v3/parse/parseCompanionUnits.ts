// import {
//   findFirstByTagAndAttr,
//   findAllByTagAndAllAttrs,
//   closestAncestorByTagName,
//   findFirstByTagAndAllAttrs,
// } from './utils';

// // Companion units are units that MUST be taken alongside specific other units and vice versa.
// // The companions don't have points cost, because the owner of the companion bond has the points for all units include in the set
// export function parseCompanionUnits(root: Element, unitName: string): string[] {
//   const companions: string[] = [];

//   companions.push(...parseCompanionUnitsByCondition(root, unitName));
//   companions.push(...parseCompanionByRecursiveModifier(root, unitName, companions));

//   // remove self
//   if (companions.includes(unitName)) {
// 	companions.splice(companions.indexOf(unitName), 1);
//   }

//   return Array.from(new Set(companions));
// }

// function parseCompanionByRecursiveModifier(
//   root: Element,
//   unitName: string,
//   found: string[] = []
// ): string[] {
//   const companions: string[] = [];
//   const unitEntry = findFirstByTagAndAttr(root, 'entryLink', 'name', unitName);
//   if (!unitEntry) {
// 	return companions;
//   }

//   const id = unitEntry.getAttribute('id');
//   if (!id) {
// 	return companions;
//   }

//   // check if this unit has a cost
//   const cost = findFirstByTagAndAttr(unitEntry, 'cost', 'typeId', 'points');

//   if (cost) {
// 	const modifiers = findAllByTagAndAllAttrs(unitEntry, 'modifier', {
// 	  type: 'add',
// 	  scope: 'force',
// 	});

// 	for (const modifier of modifiers) {
// 	  const affects = modifier.getAttribute('affects');
// 	  if (!affects) continue;

// 	  const id = affects.split('.').pop();
// 	  if (!id) continue;

// 	  // find the companion unit by id
// 	  const companionUnit = findFirstByTagAndAttr(root, 'entryLink', 'id', id);
// 	  if (!companionUnit) continue;

// 	  const companionCost = findFirstByTagAndAttr(companionUnit, 'cost', 'typeId', 'points');
// 	  if (companionCost) continue; // skip if the companion unit has its own cost (e.g. it is not a companion unit)

// 	  const name = companionUnit.getAttribute('name');
// 	  if (!name) continue;

// 	  if (found.includes(name)) continue; // prevent recursion if already found

// 	  console.log(`Found companion by recursive modifier: ${name} with ID: ${id}`);
// 	  companions.push(name);
// 	}
//   } else {
// 	// reverse search for the companion unit
// 	// look for modifiers that reference the unitEntry id
// 	const reverseModifiers = findAllByTagAndAllAttrs(root, 'modifier', {
// 	  type: 'add',
// 	  scope: 'force',
// 	  affects: `self.entries.recursive.${id}`,
// 	});

// 	for (const modifier of reverseModifiers) {
// 	  // get the ancestor unitEntry
// 	  const ancestor = closestAncestorByTagName(modifier, 'entryLink');
// 	  if (!ancestor) continue;

// 	  const name = ancestor.getAttribute('name');
// 	  if (!name) continue;

// 	  if (found.includes(name)) continue; // prevent recursion if already found

// 	  console.log(
// 		`Found companion by reverse recursive modifier: ${name} with ID: ${ancestor.getAttribute('id')}`
// 	  );
// 	  companions.push(name);

// 	  // recursively find companions from the parent, passing updated found list
// 	  companions.push(...parseCompanionByRecursiveModifier(root, name, [...found, unitName]));
// 	}
//   }

//   return Array.from(new Set(companions));
// }

// function parseCompanionUnitsByCondition(root: Element, unitName: string): string[] {
//   const companions: string[] = [];
//   const unitEntry = findFirstByTagAndAttr(root, 'entryLink', 'name', unitName);
//   if (!unitEntry) {
// 	return companions;
//   }

//   const id = unitEntry.getAttribute('id');
//   if (!id) {
// 	return companions;
//   }

//   // check if this unit has a cost
//   const cost = findFirstByTagAndAttr(unitEntry, 'cost', 'typeId', 'points');

//   if (cost) {
// 	const companionConditions = findAllByTagAndAllAttrs(root, 'condition', {
// 	  type: 'atLeast',
// 	  value: '1',
// 	  scope: 'force',
// 	  childId: id,
// 	});

// 	for (const condition of companionConditions) {
// 	  const modifier = closestAncestorByTagName(condition, 'modifier');
// 	  if (!modifier) continue;

// 	  const type = modifier.getAttribute('type');
// 	  const value = modifier.getAttribute('value');
// 	  const constraintId = modifier.getAttribute('field');
// 	  if (!constraintId) continue;

// 	  if (type != 'set' || value != '1') continue;

// 	  const companionUnit = closestAncestorByTagName(condition, 'entryLink');
// 	  if (!companionUnit) continue;

// 	  const name = companionUnit.getAttribute('name');
// 	  if (!name) continue;

// 	  const companionCost = findFirstByTagAndAttr(companionUnit, 'cost', 'typeId', 'points');
// 	  if (companionCost) continue; // skip if the companion unit has its own cost (e.g. it is not a companion unit)

// 	  // look for the constraint
// 	  const constraint = findFirstByTagAndAllAttrs(companionUnit, 'constraint', {
// 		type: 'min',
// 		value: '-1',
// 		scope: 'force',
// 		id: constraintId,
// 	  });
// 	  if (!constraint) continue;

// 	  console.log(`Found companion: ${name} with constraint ID: ${constraintId}`);
// 	  companions.push(name);
// 	}
//   } else {
// 	// under the unitEntry look for conditions
// 	const unitConstraints = findAllByTagAndAllAttrs(unitEntry, 'constraint', {
// 	  type: 'min',
// 	  value: '-1',
// 	  scope: 'force',
// 	});

// 	for (const constraint of unitConstraints) {
// 	  const constraintId = constraint.getAttribute('id');
// 	  if (!constraintId) continue;

// 	  // find the modifier with field=constraintId
// 	  const modifier = findFirstByTagAndAllAttrs(unitEntry, 'modifier', {
// 		type: 'set',
// 		value: '1',
// 		field: constraintId,
// 	  });
// 	  if (!modifier) continue;

// 	  // find the condition under the modifier
// 	  const condition = findFirstByTagAndAllAttrs(modifier, 'condition', {
// 		type: 'atLeast',
// 		value: '1',
// 		scope: 'force',
// 	  });
// 	  if (!condition) continue;

// 	  const id = condition.getAttribute('childId');
// 	  if (!id) continue;

// 	  // find the companion unit by id
// 	  const companionUnit = findFirstByTagAndAttr(root, 'entryLink', 'id', id);
// 	  if (!companionUnit) continue;

// 	  const name = companionUnit.getAttribute('name');
// 	  if (!name) continue;

// 	  console.log(
// 		`Found companion from unit constraints: ${name} with constraint ID: ${constraintId}`
// 	  );
// 	  companions.push(name);
// 	}
//   }

//   return Array.from(new Set(companions));
// }
