import {
  BattleProfile,
  RegimentOption,
  type IBattleProfile,
  type IRegimentOption,
} from '../models/battleProfile';
import { Model } from '../models/model';
import { Unit, type IUnit } from '../models/unit';
import { WeaponOption } from '../models/weaponOption';
import { findAllByTagAndAttrs, findFirstByTagAndAttrs } from '../util';
import {
  filterIgnoredEnhancementTables,
  getCategoryModifierForCondition,
  parseCategory,
  parsePoints,
  type ICategory,
} from './parseCommon';
import { parseCompanionUnitLeader } from './parseCompanionUnits';

export function parseBattleProfiles(
  root: any,
  units: Map<string, Unit>,
  categories: Map<string, ICategory>,
  armyCategories: Map<string, ICategory>,
  armyKeyword: string,
): Map<string, BattleProfile> {
  const bpCategories = parseBattleProfileCategories(root, armyKeyword);
  // add bp categories to the main categories map
  const allCategories = new Map<string, ICategory>(categories);
  for (const [id, category] of bpCategories.entries()) {
    if (!allCategories.has(id)) {
      allCategories.set(id, category);
    }
  }

  const errorConditions = parseErrorConditions(root, allCategories);

  const battleProfileNodes = root.entryLinks?.entryLink || [];
  const bpMap = new Map<string, BattleProfile>();
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

    const profile = parseBattleProfile(node, units, allCategories, armyCategories, errorConditions, armyKeyword);

    // skip units without a category, we no longer skip legends units we will filter them out in the UI
    if (profile.category === 'OTHER') continue;

    if (bpMap.has(profile.name)) {
      // console.warn(`Duplicate battle profile found: ${profile.name} merging profiles.`);
      const existingProfile = bpMap.get(profile.name);
      if (existingProfile) {
        // add non-duplicate regiment options
        const existingOptions = new Set(existingProfile.regimentOptions.map((o) => o.optNames()));
        for (const option of profile.regimentOptions) {
          if (!existingOptions.has(option.optNames())) {
            existingProfile.regimentOptions.push(option);
          }
        }
        // TODO: may need to put more here if anything else goes wrong with kragnos
        bpMap.set(profile.name, existingProfile);
      }
      continue; // skip duplicates
    } else {
      bpMap.set(profile.name, profile);
    }
  }

  // link together companion units
  // leader to companionUnits
  const companionGroups = new Map<string, string[]>();
  for (const [name, bp] of bpMap.entries()) {
    if (bp.companionLeader) {
      if (!companionGroups.has(bp.companionLeader)) {
        companionGroups.set(bp.companionLeader, []);
      }
      companionGroups.get(bp.companionLeader)?.push(name);
    }
  }

  // link together companion units
  // companionUnits to leader
  for (const [leader, companions] of companionGroups.entries()) {
    const leaderBp = bpMap.get(leader);
    if (leaderBp) {
      leaderBp.companionUnits.push(...companions);
      // modify regiment options to make companions required
      leaderBp.regimentOptions = leaderBp.regimentOptions.map((option: RegimentOption) => {
        if (companions.some((c) => option.names.includes(c))) {
          return new RegimentOption({
            ...option,
            min: 1, // companions are always required
            max: 1, // companions can only be taken once
          });
        }
        return option;
      });
    }
  }

  // cap regiment options of heroes to 1 per regiment
  // TODO: mark specific units that are legends as legends regiment options so they don't show or have a badge
  for (const bp of bpMap.values()) {
    bp.regimentOptions = bp.regimentOptions.map((option: RegimentOption) => {
      const hasHero = option.names.some((name) => {
        const unit = bpMap.get(name);
        return unit && unit.category === 'HERO';
      });
      if (hasHero) {
        return new RegimentOption({
          ...option,
          max: 1, // heroes can only be taken once in a regiment
        });
      }
      return option;
    });
  }

  return bpMap;
}

export function parseBattleProfileCategories(root: any, armyKeyword: string): Map<string, ICategory> {
  const categories: Map<string, ICategory> = new Map();

  // create a category for each bp
  const bpNodes = root.entryLinks?.entryLink || [];
  for (const bpNode of bpNodes) {
    const bpCategories = parseCategory(bpNode);
    for (const [id, category] of bpCategories) {
      categories.set(id, category);
    }
  }

  // filter battle traits and army keywords
  for (const [id, category] of categories.entries()) {
    if (category.name.toLowerCase().includes('battle traits') || category.name === armyKeyword) {
      categories.delete(id);
    }
  }

  return categories;
}

export function parseBattleProfile(
  bpNode: any,
  units: Map<string, Unit>,
  allCategories: Map<string, ICategory>,
  armyCategories: Map<string, ICategory>,
  errorConditions: IErrorCondition[],
  armyKeyword: string,
): BattleProfile {
  const battleProfile: Partial<IBattleProfile> = {
    name: bpNode['@_name'],
    points: parsePoints(bpNode),
    reinforceable: parseReinforceable(bpNode),
    enhancementTables: parseAllowedEnhancementTables(bpNode),
    regimentTags: parseRegimentTags(bpNode, armyCategories, armyKeyword),
    regimentOptions: parseRegimentOptions(bpNode, allCategories, armyCategories, errorConditions),
    companionLeader: parseCompanionUnitLeader(bpNode, allCategories),
  };

  // category and keywords is derived from the unit
  const unit = units.get(battleProfile.name || '');
  if (unit) {
    battleProfile.category = unit.category;
    battleProfile.keywords = unit.keywords;
    battleProfile.legends = unit.legends;
  }

  const undersizeInfo = parseUndersizeUnitCondition(bpNode, allCategories);
  if (undersizeInfo && unit) {
    const newUnitSize = unit.unitSize - 1 || 0; // -1 because undersize units are always 1 model less than the original unit, because of the special hero version
    battleProfile.isUndersize = true;
    battleProfile.name =
      battleProfile.name + ` (${newUnitSize} model${newUnitSize > 1 ? 's' : ''})`;
    battleProfile.undersizeCondition = undersizeInfo.condition;
    battleProfile.reinforceable = false; // undersize units are not reinforceable
    if (!units.has(battleProfile.name)) {
      // create a new unit for this bp
      const undersizeUnit: IUnit = {
        ...unit,
        name: battleProfile.name,
        unitSize: newUnitSize, // undersize units are always 1 model
        models: new Map<string, Model>(), // create a new models map
      };
      for (const [_, model] of unit.models) {
        undersizeUnit.models.set(
          model.name,
          new Model({
            ...model,
            count: newUnitSize,
          })
        );
        for (const [_, w] of model.weapons) {
          const wp = new WeaponOption({
            ...w,
          });
          if (wp.max > newUnitSize) {
            wp.max = newUnitSize; // undersize units can only take 1 of each weapon
          }
          undersizeUnit.models.get(model.name)?.weapons.set(w.name, wp);
        }
      }
      units.set(battleProfile.name, new Unit(undersizeUnit));
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

export function parseRegimentTags(bpNode: any, armyCategories: Map<string, ICategory>, armyKeyword: string): string[] {
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

    // if the bpNode has a categoryLink with the name of the category, add it as a tag
    const categoryLink = bpNode?.categoryLinks?.categoryLink?.find(
      (link: any) => link['@_name'] === category.name
    );
    // armyKeyword is also a category, but it's not used for regiment options
    if (categoryLink && category.name !== armyKeyword) {
      tags.push(category.name);
    }
  }
  return Array.from(new Set(tags));
}

export function parseRegimentOptions(
  bpNode: any,
  allCategories: Map<string, ICategory>,
  armyCategories: Map<string, ICategory>,
  errorConditions: IErrorCondition[],
): RegimentOption[] {
  const options: RegimentOption[] = [];
  const name = bpNode['@_name'] || '';
  const id = bpNode['@_id'] || '';
  const targetId = bpNode['@_targetId'] || '';

  // This should only  be army categories
  for (const [_, category] of armyCategories) {
    // Categories that have a reference to this bp, mean this bp can take this category.
    const catModifier = getCategoryModifierForCondition(category, name, id, targetId);
    if (catModifier) {
      const option: IRegimentOption = {
        names: [category.name],
        max: catModifier.max || 1,
        min: 0,
      };
      options.push(new RegimentOption(option));
      continue; // skip if the category is already added
    }

    // if the category id is present as an add regimental option mod, add it as an option
    const modifier = findFirstByTagAndAttrs(bpNode, 'modifier', {
      type: 'add',
      field: 'category',
      affects: `self.entries.recursive.${category.id}`,
    });
    if (modifier) {
      options.push(new RegimentOption({ names: [category.name] }));
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

        // forceMax is typically the default max for when a unit can take a category
        let max = category.forceMax;
        const catMod = getCategoryModifierForCondition(category, name, id, targetId);
        if (catMod) {
          max = catMod.max;
        } else if (errorCondition) {
          max = errorCondition.max; // use the max from the error condition if it exists
        }

        const option: IRegimentOption = {
          names: [category.name],
          max: max, // use max from error condition, or 0 (any amount)
          min: 0,
        };
        options.push(new RegimentOption(option));
      }
    }
  });

  // create xor regiment options
  // if we have a regiment option for a category and one of it's notChildConditionIds we replaces it with an xor option
  const xorOptions: RegimentOption[] = [];
  for (const option of options) {
    const category = allCategories.get(option.names[0]) || armyCategories.get(option.names[0]);
    if (category && category.notChildConditionIds.length > 0) {
      const xorOptNames = [category.name];
      for (const notId of category.notChildConditionIds) {
        const notCategory = allCategories.get(notId) || armyCategories.get(notId);
        if (
          notCategory &&
          options.some((opt) => opt.names.includes(notCategory.name))
        ) {
          xorOptNames.push(notCategory.name);
        }
      }
      if (xorOptNames.length < 2) continue; // no xor options to create

      // skip if xor option with both names already exists
      if (xorOptions.some((opt) => opt.names.length === xorOptNames.length && opt.names.every((name) => xorOptNames.includes(name)))) {
        continue;
      }

      // create a new xor option
      const xorOption: IRegimentOption = {
        names: xorOptNames,
        max: 1, // I think this is currnetly only ever used for 0-1
        min: 0.
      };
      xorOptions.push(new RegimentOption(xorOption));
    }
  }

  // remove original options that have xor options
  for (const xorOption of xorOptions) {
    const optsToRemove = options.filter((opt) =>
      opt.names.some((name) => xorOption.names.includes(name))
    );
    if (optsToRemove.length > 0) {
      optsToRemove.forEach(opt => {
        const index = options.indexOf(opt);
        if (index !== -1) {
          options.splice(index, 1); // remove the original option
        }
      });
    }
  }

  if (xorOptions.length > 0) {
    // add xor options to
    options.push(...xorOptions); // add xor options to the list
  }

  // deduplicate options by name
  const uniqueOptions = new Map<string, RegimentOption>();
  for (const option of options) {
    uniqueOptions.set(option.optNames(), option);
  }

  return Array.from(uniqueOptions.values()).map(
    (option) => new RegimentOption(option)
  );
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