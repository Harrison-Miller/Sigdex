import { BattleProfile, type IBattleProfile, type IRegimentOption } from '../models/battleProfile';
import { Model, type IModel } from '../models/model';
import type { IUnit } from '../models/unit';
import { WeaponOption } from '../models/weaponOption';
import { findAllByTagAndAttrs, findFirstByTagAndAttrs } from '../util';
import {
  filterIgnoredEnhancementTables,
  parseCategories,
  parsePoints,
  type ICategory,
} from './parseCommon';

export function parseBattleProfiles(
  root: any,
  units: Map<string, IUnit>,
  categories: Map<string, ICategory>
): Map<string, IBattleProfile> {
  const bpCategories = parseBattleProfileCategories(root);
  // add bp categories to the main categories map
  const allCategories = new Map<string, ICategory>(categories);
  for (const [id, category] of bpCategories.entries()) {
    if (!allCategories.has(id)) {
      allCategories.set(id, category);
    }
  }
  const armyCategories = parseCategories(root);
  const errorConditions = parseErrorConditions(root, allCategories);

  const battleProfileNodes = root.entryLinks?.entryLink || [];
  const bpMap = new Map<string, IBattleProfile>();
  for (const node of battleProfileNodes) {
    const name = node['@_name']?.toLowerCase() || '';
    // I'm not sure why there's an entryLink for battle traits with the bps - but there is sometimes.
    if (
      name == '' ||
      name.includes('battle traits') ||
      name.includes('apotheosis') ||
      name.includes('khul')
    )
      continue;

    const profile = parseBattleProfile(node, units, allCategories, armyCategories, errorConditions);
    if (profile.category === 'OTHER' || profile.category === 'LEGENDS') continue; // skip other and legends categories

    bpMap.set(profile.name, profile);
  }
  return bpMap;
}

export function parseBattleProfileCategories(root: any): Map<string, ICategory> {
  const categories: Map<string, ICategory> = new Map();

  // create a category for each bp
  const bpNodes = root.entryLinks?.entryLink || [];
  for (const bpNode of bpNodes) {
    const id = bpNode['@_id'];
    const name = bpNode['@_name'] || '';
    if (id && name && !categories.has(id)) {
      categories.set(id, {
        name,
        id,
        childConditionIds: [], // no child conditions by default
      });
    }
  }

  return categories;
}

export function parseBattleProfile(
  bpNode: any,
  units: Map<string, IUnit>,
  allCategories: Map<string, ICategory>,
  armyCategories: Map<string, ICategory>,
  errorConditions: IErrorCondition[]
): IBattleProfile {
  const battleProfile: Partial<IBattleProfile> = {
    name: bpNode['@_name'],
    points: parsePoints(bpNode),
    reinforceable: parseReinforceable(bpNode),
    enhancementTables: parseAllowedEnhancementTables(bpNode),
    // TODO: companion unit stuff
    regimentTags: parseRegimentTags(bpNode, armyCategories),
    regimentOptions: parseRegimentOptions(bpNode, allCategories, armyCategories, errorConditions),
  };

  // category and keywords is derived from the unit
  const unit = units.get(battleProfile.name || '');
  if (unit) {
    battleProfile.category = unit.category;
    battleProfile.keywords = unit.keywords;
  }

  const undersizeInfo = parseUndersizeUnitCondition(bpNode, allCategories);
  if (undersizeInfo) {
    console.log(`Found undersize unit condition for ${battleProfile.name}:`, undersizeInfo);
    battleProfile.isUndersize = true;
    battleProfile.name = battleProfile.name + ` (1 model)`;
    battleProfile.undersizeCondition = undersizeInfo.condition;
    battleProfile.reinforceable = false; // undersize units are not reinforceable
    if (unit && !units.has(battleProfile.name)) {
      // create a new unit for this bp
      const undersizeUnit = {
        ...unit,
        name: battleProfile.name,
        unitSize: 1, // undersize units are always 1 model
        models: new Map<string, IModel>(), // create a new models map
      };
      for (const [_, model] of unit.models) {
        undersizeUnit.models.set(
          model.name,
          new Model({
            ...model,
            count: 1,
          })
        );
        for (const [_, w] of model.weapons) {
          let wp = new WeaponOption({
            ...w,
          });
          if (wp.max > 0) {
            wp.max = 1; // undersize units can only take 1 of each weapon
          }
          undersizeUnit.models.get(model.name)?.weapons.set(w.name, wp);
        }
      }
      console.log(`Created undersize unit:`, undersizeUnit);
      units.set(battleProfile.name, undersizeUnit);
    }
  }

  return new BattleProfile(battleProfile);
}

export function parseReinforceable(bpNode: any): boolean {
  return (
    bpNode?.entryLinks?.entryLink?.some((link: any) => link['@_name'] === 'Reinforced') || false
  );
}

export function parseAllowedEnhancementTables(bpNode: any): string[] {
  const allowedTabls = filterIgnoredEnhancementTables(bpNode?.entryLinks?.entryLink || []);
  return allowedTabls.map((table: any) => table['@_name']);
}

export function parseRegimentTags(bpNode: any, armyCategories: Map<string, ICategory>): string[] {
  const tags: string[] = [];
  for (const [_, category] of armyCategories.entries()) {
    if (category.name.toLowerCase().includes('regiment')) continue;
    const modifier = findFirstByTagAndAttrs(bpNode, 'modifier', {
      type: 'add',
      field: 'category',
      value: category.id,
    });
    if (modifier) {
      tags.push(category.name);
    }
  }
  return tags;
}

export function parseRegimentOptions(
  bpNode: any,
  allCategories: Map<string, ICategory>,
  armyCategories: Map<string, ICategory>,
  errorConditions: IErrorCondition[]
): IRegimentOption[] {
  const options: IRegimentOption[] = [];
  const name = bpNode['@_name'] || '';
  const id = bpNode['@_id'] || '';

  // This should only  be army categories
  for (const [_, category] of armyCategories) {
    // Categories that have a reference to this bp, mean this bp can take this category.
    if (category.childConditionIds.includes(id)) {
      const option: IRegimentOption = {
        name: category.name,
        max: 1, // these are always 1
      };
      options.push(option);
    }
  }

  // If a unit references a category in a modifier, it can take this category.
  const categoryModifiers = findAllByTagAndAttrs(bpNode, 'modifier', {
    type: 'add',
    field: 'category',
    scope: 'force',
  })
    .map((mod: any) => mod['@_affects']?.split('.')?.pop() || '')
    .filter((id: string) => id && id.length > 0);

  categoryModifiers.forEach((categoryId: string) => {
    if (allCategories.has(categoryId)) {
      const category = allCategories.get(categoryId);
      if (category) {
        let errorCondition: IErrorCondition | undefined;
        for (const error of errorConditions) {
          if (error.errorCategory !== category.name) continue;
          if (error.conditionUnitName && error.conditionUnitName !== name) {
            continue; // skip if the error condition is for a different unit
          }
          errorCondition = error; // found a matching error condition, (this could just be the default though)
          if (error.conditionUnitName && error.conditionUnitName === name) {
            break; // stop checking if we found a specific condition for this unit
          }
        }

        const option: IRegimentOption = {
          name: category.name,
          max: errorCondition?.max || 0, // use max from error condition, or 0 (any amount)
        };
        options.push(option);
      }
    }
  });

  return options;
}

export interface IErrorCondition {
  errorCategory: string;
  max: number;
  conditionUnitName?: string;
}

export function parseErrorConditions(
  root: any,
  categories: Map<string, ICategory>
): IErrorCondition[] {
  const bpNodes = root.entryLinks?.entryLink || [];
  const errorConditions: IErrorCondition[] = [];
  for (const node of bpNodes) {
    const modifierGroups = node?.modifierGroups?.modifierGroup || [];
    for (const group of modifierGroups) {
      const error = findFirstByTagAndAttrs(group, 'modifier', {
        type: 'add',
        field: 'error',
      });
      if (error) {
        const errMsg = error['@_value'];
        let category: string | undefined;
        for (const [_, cat] of categories.entries()) {
          if (errMsg.toLowerCase().includes(cat.name.toLowerCase())) {
            category = cat.name;
            break;
          }
        }

        if (category) {
          const max = parseInt(error?.conditions?.condition[0]?.['@_value'] || '0', 10);
          const conditionCategories =
            findAllByTagAndAttrs(group, 'condition', {
              type: 'instanceOf',
              value: '1',
              field: 'selections',
              scope: 'self',
            })
              .map((c: any) => categories.get(c['@_childId'] || '')?.name || '')
              .filter(
                (name: string) => name && name.length > 0 && !name.toLowerCase().includes('leader') // skip regiment leader conditions
              ) || [];

          if (conditionCategories.length > 0) {
            conditionCategories.forEach((conditionCategory: string) => {
              errorConditions.push({
                errorCategory: category,
                max: max - 1, // the condition for the error triggers at this value, so we subtract 1 for the actual max
                conditionUnitName: conditionCategory,
              });
            });
          } else {
            errorConditions.push({
              errorCategory: category,
              max: max - 1, // the condition for the error triggers at this value, so we subtract 1 for the actual max
            });
          }
        }
      }
    }
  }
  return errorConditions;
}

export function parseUndersizeUnitCondition(
  bpNode: any,
  bpCategories: Map<string, ICategory>
): { isUndersize: boolean; condition?: string } | null {
  const undersizeCategoryLink = bpNode?.categoryLinks?.categoryLink?.find(
    (link: any) => link['@_name'] === 'Undersize Unit'
  );
  if (!undersizeCategoryLink) return null;

  const condition = findFirstByTagAndAttrs(bpNode, 'repeat', {
    value: '1',
    scope: 'roster',
  });
  if (condition) {
    const conditionId = condition['@_childId'];
    const conditionUnit = bpCategories.get(conditionId);
    if (conditionUnit) {
      return {
        isUndersize: true,
        condition: conditionUnit.name,
      };
    }
  }

  return {
    isUndersize: true,
  };
}
