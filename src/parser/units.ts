import { determineUnitCategory, type Unit } from '../common/UnitData';
import { findAllByTagAndAttr } from './utils';
import { parseAbilities } from './abilities';
import { parseKeywords } from './keywords';
import { parseStats } from './stats';
import { parseWeapons } from './weapons';
import { parseModelGroups } from './models';

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
    const models = parseModelGroups(element);

    if (category === 'Other' || category === 'Legends') {
      // Skip units that are categorized as 'Other' or 'Legends'
      continue;
    }

    const unit: Unit = {
      name: element.getAttribute('name') || '',
      stats: stats,
      melee_weapons: weapons.melee_weapons,
      ranged_weapons: weapons.ranged_weapons,
      abilities: abilities,
      keywords: keywords,
      category: category,
      points: points,
      unit_size: models.reduce((sum, model) => sum + model.count, 0) || 1,
      models: models.length > 0 ? models : undefined,
    };

    units.push(unit);
  }

  return units;
}
