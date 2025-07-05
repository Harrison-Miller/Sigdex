import { determineUnitCategory, type Unit, isDefaultModelGroups } from '../common/UnitData';
import {
  closestAncestorByTagName,
  findAllByTagAndAllAttrs,
  findAllByTagAndAttr,
  findFirstByTagAndAllAttrs,
  getChildren,
} from './utils';
import { parseAbilities } from './abilities';
import { parseKeywords } from './keywords';
import { parseStats } from './stats';
import { parseWeapons } from './weapons';
import { parseModelGroups } from './models';
import { parseCompanionUnits } from './companionunits';
import { parseReinforceable } from './reinforceable';
import {
  parseRegimentOptionCategories,
  parseRegimentTags,
  parseSubHeroRegimentOptions,
} from './regimentoptions';
import type { ModelGroup, RegimentOption } from '../common/UnitData';
import { parseUnitsAsCategories } from './categories';
import { parseUnitEnhancementTables } from './enhancementtables';
import { parseUndersizeUnits } from './undersize';

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
  pointsMap: Map<string, number>,
  categories: Map<string, string> = new Map<string, string>()
): Unit[] {
  const errorConditions: ErrorCondition[] = [];
  if (armyInfoRoot) {
    const unitCategories = parseUnitsAsCategories(armyInfoRoot);
    for (const [id, name] of unitCategories) {
      if (!categories.has(id)) {
        categories.set(id, name);
      }
    }

    const errors = parseErrors(armyInfoRoot, categories);
    errorConditions.push(...errors);
  }

  const units: Unit[] = [];
  const unitElements = findAllByTagAndAttr(root, 'selectionEntry', 'type', 'unit');

  const regimentSubHeroOptions = armyInfoRoot
    ? parseSubHeroRegimentOptions(armyInfoRoot)
    : new Map<string, string[]>();
  const regimentTags = armyInfoRoot ? parseRegimentTags(armyInfoRoot) : new Map<string, string[]>();

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
    const enhancementTables = armyInfoRoot ? parseUnitEnhancementTables(armyInfoRoot, name) : [];

    const suberHeroOptions: RegimentOption[] | undefined = isHero(keywords) ? [] : undefined;
    const regimentOptions: RegimentOption[] | undefined = isHero(keywords) ? [] : undefined;
    if (isHero(keywords)) {
      if (regimentSubHeroOptions.has(name)) {
        regimentSubHeroOptions.get(name)?.forEach((tag) => {
          suberHeroOptions?.push({
            name: tag,
            max: 1, // Sub-hero options are typically single selections
          });
        });
      }

      if (armyInfoRoot) {
        const optionsByCategory = parseRegimentOptionCategories(
          name,
          armyInfoRoot,
          categories,
          errorConditions
        );
        // only add options that aren't covered by sub-hero options
        for (const option of optionsByCategory) {
          if (!regimentSubHeroOptions.get(name)?.includes(option.name)) {
            regimentOptions?.push(option);
          }
        }
      }
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
      sub_hero_options: suberHeroOptions,
      sub_hero_tags: regimentTags.get(name) || undefined,
      regiment_options: regimentOptions,
      enhancement_tables: enhancementTables.length > 0 ? enhancementTables : undefined,
    };

    units.push(unit);
  }

  if (armyInfoRoot) {
    const underSizeUnits = parseUndersizeUnits(armyInfoRoot);
    for (const underSizeUnit of underSizeUnits) {
      // find the unit by name
      const unit = units.find((u) => u.name === underSizeUnit.name);
      if (unit) {
        const modelGroups: ModelGroup[] = [];
        if (unit.models) {
          for (const modelGroup of unit.models) {
            // make copy of each modelGroup and set the count to 1
            const newModelGroup: ModelGroup = {
              ...modelGroup,
              count: 1, // Set the count to 1 for undersize units
            };
            modelGroups.push(newModelGroup);
          }
        }

        // create a copy of the unit with the undersize condition
        const undersizeUnit: Unit = {
          ...unit,
          name: `${unit.name} (1 model)`, // Append (1 model) to the name
          points: underSizeUnit.points, // Use the undersize points
          undersize_condition: underSizeUnit.condition, // Add the condition if it exists
          unit_size: 1, // Set the unit size to 1
          notReinforcable: true, // Undersize units are not reinforceable
          models: modelGroups.length > 0 ? modelGroups : undefined, // Use the modified model groups
        };

        units.push(undersizeUnit);
      }
    }
  }

  return units;
}

export interface ErrorCondition {
  errorCategory: string;
  max: number;
  conditionUnitName?: string;
}

function parseErrors(root: Element, categories: Map<string, string>): ErrorCondition[] {
  const errors: ErrorCondition[] = [];
  const errorElements = findAllByTagAndAllAttrs(root, 'modifier', {
    type: 'add',
    field: 'error',
  });

  for (const error of errorElements) {
    const value = error.getAttribute('value');
    if (!value) continue;

    let category: string | undefined;
    for (const name of categories.values()) {
      if (value.toLowerCase().includes(name.toLowerCase())) {
        category = name;
        break;
      }
    }

    if (!category) continue; // Skip if no category found

    // get the max value from the condition below the error
    const condition = findFirstByTagAndAllAttrs(error, 'condition', {
      type: 'atLeast',
      field: 'selections',
      scope: 'force',
    });
    if (!condition) continue; // Skip if no condition found
    const maxValue = condition.getAttribute('value');
    if (!maxValue) continue; // Skip if no max value found

    // go up to the modifier group level, then conditions
    const modifierGroup = closestAncestorByTagName(error, 'modifierGroup');
    if (modifierGroup) {
      // if the error has a condition, then it only applies for certain leaders
      // could be one of conditions, conditionGroups or localConditionGroups
      const children = getChildren(modifierGroup).filter(
        (child) =>
          child.tagName.toLowerCase() === 'conditions' ||
          child.tagName.toLowerCase() === 'conditiongroups' ||
          child.tagName.toLowerCase() === 'localconditiongroups'
      );

      for (const child of children) {
        // look for condition: <condition type="instanceOf" value="1" field="selections" scope="self" childId="80c1-4ede-22b8-b215" shared="true"/>
        const instanceOfCondition = findAllByTagAndAllAttrs(child, 'condition', {
          type: 'instanceOf',
          value: '1',
          field: 'selections',
          scope: 'self',
        });

        for (const condition of instanceOfCondition) {
          const childId = condition.getAttribute('childId');
          if (!childId) continue; // Skip if no childId found

          // get condition category by childId
          const conditionCategory = categories.get(childId);
          if (!conditionCategory) continue; // Skip if no category found

          // if condition is leader skip, we only care about the unit itself
          if (conditionCategory.toLowerCase().includes('leader')) continue;

          // add the error condition
          errors.push({
            errorCategory: category,
            max: parseInt(maxValue, 10) - 1, // the condition is to trigger the error at atLeast X so -1 is the real max
            conditionUnitName: conditionCategory,
          });
        }
      }
    } else {
      // this just condition always applies to the unit i.e) 0-1 skyvessel
      errors.push({
        errorCategory: category,
        max: parseInt(maxValue, 10), // the condition is to trigger the error at atLeast X so -1 is the real max
      });
    }
  }

  return errors;
}
