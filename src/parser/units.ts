import { determineUnitCategory, type Unit, isDefaultModelGroups } from '../common/UnitData';
import { findAllByTagAndAttr } from './utils';
import { parseAbilities } from './abilities';
import { parseKeywords } from './keywords';
import { parseStats } from './stats';
import { parseWeapons } from './weapons';
import { parseModelGroups } from './models';
import { parseCompanionUnits } from './companionunits';
import { parseReinforceable } from './reinforceable';
import { parseRegimentTags, parseSubHeroRegimentOptions } from './regimentoptions';
import type { RegimentOption } from '../common/UnitData';

function isAlwaysNotReinforceable(unitSize: number, keywords: string[]): boolean {
  if (unitSize == 1) {
    return true; // Single model units are always not reinforceable
  }

  return keywords.some(
    (keyword) =>
      keyword.toLowerCase() === 'hero' ||
      keyword.toLowerCase() === 'unique' ||
      keyword.toLowerCase() === 'manifestation' ||
      keyword.toLowerCase() === 'faction terrain'
  );
}

function isHero(keywords: string[]): boolean {
  return keywords.some((keyword) => keyword.toLowerCase() === 'hero');
}

// parseUnits parses all units from the given root.
// It will also filter out unwanted units based on their category or name.
export function parseUnits(
  root: Element,
  armyInfoRoot: Element | null,
  pointsMap: Map<string, number>
): Unit[] {
  const units: Unit[] = [];
  const unitElements = findAllByTagAndAttr(root, 'selectionEntry', 'type', 'unit');

  const regimentSubHeroOptions = armyInfoRoot
    ? parseSubHeroRegimentOptions(armyInfoRoot)
    : new Map<string, string[]>();
  const regimentTags = armyInfoRoot ? parseRegimentTags(armyInfoRoot) : new Map<string, string[]>();
  console.log(
    `regiment tags found: ${regimentTags.size}: ${Array.from(regimentTags.keys()).join(', ')}`
  );

  for (const element of unitElements) {
    const name = element.getAttribute('name') || '';
    if (!name) {
      continue; // Skip units without a name
    }
    // Filter out units with 'Apotheosis' in the name
    if (name.toLowerCase().includes('apotheosis')) {
      console.warn(`Skipping unit "${name}" due to 'Apotheosis' in the name`);
      continue;
    }

    // athol khul is not a real unit, I'm not sure why it's in the data
    if (name.toLowerCase().includes('athol khul')) {
      continue;
    }

    const keywords = parseKeywords(element);
    const category = determineUnitCategory(keywords);

    if (category === 'Other' || category === 'Legends') {
      // Skip units that are categorized as 'Other' or 'Legends'
      console.warn(`Skipping unit "${name}" categorized as "${category}"`);
      continue;
    }

    const points = pointsMap.get(name) || 0;
    const stats = parseStats(element);
    const weapons = parseWeapons(element);
    const abilities = parseAbilities(element);
    const models = parseModelGroups(element);
    const unitSize = models.reduce((sum, model) => sum + model.count, 0) || 1;
    const companionUnits = armyInfoRoot ? parseCompanionUnits(armyInfoRoot, name) : [];
    const reinforceable = armyInfoRoot ? parseReinforceable(armyInfoRoot, name) : true;

    const regimentOptions: RegimentOption[] | undefined = isHero(keywords) ? [] : undefined;
    if (isHero(keywords) && regimentSubHeroOptions.has(name)) {
      regimentSubHeroOptions.get(name)?.forEach((tag) => {
        regimentOptions?.push({
          name: tag,
          max: 1, // Sub-hero options are typically single selections
        });
      });
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
      unit_size: unitSize,
      models: isDefaultModelGroups(models) ? undefined : models,
      companion_units: companionUnits.length > 0 ? companionUnits : undefined,
      notReinforcable: isAlwaysNotReinforceable(unitSize, keywords) ? undefined : !reinforceable, // leave hero unique undefined so it shows nothing - since that's just a core rule
      regiment_options: regimentOptions,
      regiment_tags: regimentTags.get(name) || undefined,
    };

    units.push(unit);
  }

  return units;
}
