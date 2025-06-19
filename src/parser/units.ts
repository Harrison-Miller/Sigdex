import { determineUnitCategory, type Unit } from '../common/UnitData';
import { findAllByTagAndAttr } from './utils';
import { parseAbilities } from './abilities';
import { parseKeywords } from './keywords';
import { parseStats } from './stats';
import { parseWeapons } from './weapons';

// parseUnitSize parses the unit size from a unit's selectionEntry element.
// It looks for a model selectionEntry directly under the unit, and reads min/max constraints with scope="parent".
export function parseUnitSize(unitElement: Element): number | undefined {
  // Find a <selectionEntries> child
  const selectionEntries = Array.from(unitElement.childNodes).find(
    (n): n is Element => n.nodeType === 1 && (n as Element).tagName === 'selectionEntries'
  ) as Element | undefined;
  if (!selectionEntries) return undefined;
  // Find all model selectionEntry inside <selectionEntries>
  const models = Array.from(selectionEntries.childNodes).filter(
    (n): n is Element =>
      n.nodeType === 1 &&
      (n as Element).tagName === 'selectionEntry' &&
      (n as Element).getAttribute('type') === 'model'
  ) as Element[];
  if (models.length === 0) return undefined;
  // For each model, find its <constraints> child and the min constraint with scope="parent"
  let total = 0;
  for (const model of models) {
    const constraintsNode = Array.from(model.childNodes).find(
      (n): n is Element => n.nodeType === 1 && (n as Element).tagName === 'constraints'
    ) as Element | undefined;
    if (!constraintsNode) continue;
    const minConstraint = Array.from(constraintsNode.childNodes).find(
      (c): c is Element =>
        c.nodeType === 1 &&
        (c as Element).tagName === 'constraint' &&
        (c as Element).getAttribute('type') === 'min' &&
        (c as Element).getAttribute('scope') === 'parent'
    ) as Element | undefined;
    if (!minConstraint) continue;
    const value = Number(minConstraint.getAttribute('value'));
    if (!isNaN(value)) total += value;
  }
  return total > 0 ? total : undefined;
}

// parseUnits parses all units from the given root.
// It will also filter out unwanted units based on their category or name.
export function parseUnits(root: Element, pointsMap: Map<string, number>): Unit[] {
  const units: Unit[] = [];
  const unitElements = findAllByTagAndAttr(root, 'selectionEntry', 'type', 'unit');

  for (const element of unitElements) {
    const name = element.getAttribute('name') || '';
    if (!name) {
      continue; // Skip units without a name
    }
    // Filter out units with 'Apotheosis' in the name
    if (name.toLowerCase().includes('apotheosis')) {
      continue;
    }

    const points = pointsMap.get(name) || 0;

    const stats = parseStats(element);
    const weapons = parseWeapons(element);
    const abilities = parseAbilities(element);
    const keywords = parseKeywords(element);
    const category = determineUnitCategory(keywords);

    if (category === 'Other' || category === 'Legends') {
      // Skip units that are categorized as 'Other' or 'Legends'
      continue;
    }

    const unit_size = parseUnitSize(element);

    const unit: Unit = {
      name: element.getAttribute('name') || '',
      stats: stats,
      melee_weapons: weapons.melee_weapons,
      ranged_weapons: weapons.ranged_weapons,
      abilities: abilities,
      keywords: keywords,
      category: category,
      points: points,
      unit_size: unit_size,
      constraints: weapons.constraints,
    };

    units.push(unit);
  }

  return units;
}
