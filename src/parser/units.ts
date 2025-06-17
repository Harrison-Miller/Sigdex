import { determineUnitCategory, type Unit } from '../common/UnitData';
import { findAllByTagAndAttr } from './utils';
import { parseAbilities } from './abilities';
import { parseKeywords } from './keywords';
import { parseStats } from './stats';
import { parseWeapons } from './weapons';

export function parseUnits(root: Element, pointsMap: Map<string, number>): Unit[] {
  const units: Unit[] = [];
  const unitElements = findAllByTagAndAttr(root, 'selectionEntry', 'type', 'unit');

  for (const element of unitElements) {
    const name = element.getAttribute('name') || '';
    if (!name) {
      continue; // Skip units without a name
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

    const unit: Unit = {
      name: element.getAttribute('name') || '',
      stats: stats,
      melee_weapons: weapons.melee_weapons,
      ranged_weapons: weapons.ranged_weapons,
      abilities: abilities,
      keywords: keywords,
      category: category,
      points: points,
      unit_size: undefined, // TODO: handle unit size
    };

    units.push(unit);
  }

  return units;
}
