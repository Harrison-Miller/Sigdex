import type { RegimentOption } from '../common/UnitData';
import type { ErrorCondition } from './units';
import { findAllByTagAndAllAttrs, findFirstByTagAndAllAttrs, findFirstByTagAndAttr } from './utils';

// parseSubHeroRegimentOptions returns a list of subhero regiment options tags by unit
export function parseSubHeroRegimentOptions(armyInfoRoot: Element): Map<string, string[]> {
  const entries = Array.from(armyInfoRoot.getElementsByTagName('categoryEntry'));

  const tags = new Map<string, string[]>();
  for (const entry of entries) {
    const tagName = entry.getAttribute('name');
    if (!tagName) continue;

    const conditions = findAllByTagAndAllAttrs(entry, 'condition', {
      type: 'instanceOf',
      value: '1',
    });

    for (const condition of conditions) {
      const childId = condition.getAttribute('childId');
      if (!childId) continue;

      // look up the unit by childId
      const unit = findFirstByTagAndAllAttrs(armyInfoRoot, 'entryLink', {
        id: childId,
        type: 'selectionEntry',
      });

      if (!unit) continue;

      const unitName = unit.getAttribute('name');
      if (!unitName) continue;

      if (!tags.has(unitName)) {
        tags.set(unitName, []);
      }
      tags.get(unitName)?.push(tagName);
    }
  }

  return tags;
}

// parseRegimentTags returns a map of unit name to regiment tags (category names)
export function parseRegimentTags(armyInfoRoot: Element): Map<string, string[]> {
  // Build a map of category id to name
  const categoryEntries = Array.from(armyInfoRoot.getElementsByTagName('categoryEntry'));
  const categoryIdToName = new Map<string, string>();
  for (const entry of categoryEntries) {
    const id = entry.getAttribute('id');
    const name = entry.getAttribute('name');
    if (id && name) {
      categoryIdToName.set(id, name);
    }
  }

  // For each unit, check for modifiers that add a category
  const unitEntries = Array.from(armyInfoRoot.getElementsByTagName('entryLink'));
  const tags = new Map<string, string[]>();
  for (const unit of unitEntries) {
    const unitName = unit.getAttribute('name');
    if (!unitName) continue;

    for (const [id, name] of categoryIdToName.entries()) {
      const modifier = findFirstByTagAndAllAttrs(unit, 'modifier', {
        type: 'add',
        field: 'category',
        value: id,
      });
      if (modifier) {
        if (!tags.has(unitName)) {
          tags.set(unitName, []);
        }
        tags.get(unitName)?.push(name);
      }
    }
  }
  return tags;
}

export function parseRegimentOptionCategories(
  unitName: string,
  armyInfoRoot: Element,
  categories: Map<string, string>,
  errorConditions: ErrorCondition[] = []
): RegimentOption[] {
  const options: RegimentOption[] = [];

  const unitEntry = findFirstByTagAndAttr(armyInfoRoot, 'entryLink', 'name', unitName);
  if (!unitEntry) return options;

  const categoryModifiers = findAllByTagAndAllAttrs(unitEntry, 'modifier', {
    type: 'add',
    field: 'category',
    scope: 'force',
  });

  // looking for modifiers with this: self.entries.recursive.9c8d-276-b7d2-f1fd
  for (const modifier of categoryModifiers) {
    const affects = modifier.getAttribute('affects');
    if (!affects) continue;

    const categoryId = affects.split('.').pop();
    if (!categoryId) continue;

    const categoryName = categories.get(categoryId);
    if (!categoryName) continue;

    // Check for error conditions
    let condition: ErrorCondition | undefined;
    for (const error of errorConditions) {
      if (error.errorCategory === categoryName) {
        if (error.conditionUnitName && error.conditionUnitName !== unitName) {
          continue; // skip if the error condition is for a different unit
        }

        condition = error; // found a matching error condition, (this could just be the default though)
        if (error.conditionUnitName && error.conditionUnitName === unitName) {
          break; // stop checking if we found a specific condition for this unit
        }
      }
    }

    const option: RegimentOption = {
      name: categoryName,
      max: condition ? condition.max : 0, // use maxValue from error condition if available
    };
    options.push(option);
  }

  return options;
}
