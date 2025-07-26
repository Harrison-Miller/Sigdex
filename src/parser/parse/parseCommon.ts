import type { BattleProfile } from '../models/battleProfile';
import { findAllByTagAndAttrs, findFirstByTagAndAttrs } from '../util';

export const IGNORED_ENHANCEMENT_TABLES = [
  // stuff already parsed by other parsers
  'Lores',
  'Artefacts',
  'Battle Formations',
  'Heroic Traits',
  // stuff for path and other game modes
  'Battle Wounds',
  'Ravaged Coast',
  'Paths',
  'Renown',
  'Warlord',
  // other stuff stored in entryLinks
  'Reinforced',
];

export function parsePoints(root: any): number {
  return parseInt(
    root?.costs?.cost?.find((cost: any) => cost['@_typeId'] === 'points')?.['@_value'] || '0',
    10
  );
}

export function filterIgnoredEnhancementTables(entries: any[]): any[] {
  return entries?.filter(
    (entry: any) =>
      !IGNORED_ENHANCEMENT_TABLES.some((ignored) =>
        entry['@_name'].toLowerCase().includes(ignored.toLowerCase())
      )
  );
}

export interface ICategory {
  name: string;
  id: string;
  childConditionIds: string[]; // ids of conditions that apply to this category
  notChildConditionIds: string[]; // ids of conditions that make this category not apply
  rosterMin: number;
  rosterMax: number;
}

export function parseCategories(root: any): Map<string, ICategory> {
  const categories: Map<string, ICategory> = new Map();
  const categoryNodes = root?.categoryEntries?.categoryEntry || [];
  for (const node of categoryNodes) {
    const id = node['@_id'];
    const targetId = node['@_targetId'];
    const name = node['@_name'];

    const childConditionIds = findAllByTagAndAttrs(node?.modifiers?.modifier?.[0]?.conditionGroups?.conditionGroup?.[0]?.localConditionGroups, 'condition', {
      type: 'instanceOf',
      value: '1',
    }).map((condition: any) => condition['@_childId'] || '');

    const rosterMin = parseInt(findFirstByTagAndAttrs(node, 'constraint', {
      type: 'min',
      field: 'selections',
      scope: 'roster',

    })?.['@_value'] || '-1', 10);
    const rosterMax = parseInt(findFirstByTagAndAttrs(node, 'constraint', {
      type: 'max',
      field: 'selections',
      scope: 'roster',
    })?.['@_value'] || '-1', 10);

    // <localConditionGroup type="lessThan" value="1" scope="force" field="selections"
    // <condition type="instanceOf" value="1" field="selections" scope="self" childId="4a6d-57cc-4f15-dd3a" shared="true" includeChildSelections="true"/>
    let notChildConditionIds = findAllByTagAndAttrs(node, 'localConditionGroup', {
      type: 'lessThan',
      value: '1',
      scope: 'force',
      field: 'selections',
    }).flatMap((group: any) => findAllByTagAndAttrs(group, 'condition', {
      type: 'instanceOf',
      value: '1',
      field: 'selections',
      scope: 'self',
    })).map((condition: any) => condition['@_childId'] || '');

    // add simple not conditions
    const simpleNotConditions = findAllByTagAndAttrs(node, 'condition', {
      type: 'lessThan',
      value: '1',
      scope: 'force',
      field: 'selections',
    }).map((condition: any) => condition['@_childId'] || '');
    notChildConditionIds.push(...simpleNotConditions);

    notChildConditionIds = Array.from(new Set(notChildConditionIds)).sort();

    if (id && name) {
      categories.set(id, { name, id, childConditionIds, notChildConditionIds, rosterMin, rosterMax });
      categories.set(name, { name, id, childConditionIds, notChildConditionIds, rosterMin, rosterMax });
    }
    if (targetId && name) {
      categories.set(targetId, { name, id: targetId, childConditionIds, notChildConditionIds, rosterMin, rosterMax });
    }
  }
  return categories;
}

export function calculateCommonKeywords(battleProfiles: BattleProfile[]): string[] {
  if (!battleProfiles || battleProfiles.length === 0) return [];
  const commonKeywords = new Set<string>(battleProfiles[0].keywords);
  for (const profile of battleProfiles.slice(1)) {
    const profileKeywords = new Set(profile.keywords);
    for (const keyword of commonKeywords) {
      if (!profileKeywords.has(keyword)) {
        commonKeywords.delete(keyword);
      }
    }
  }
  return Array.from(commonKeywords);
}

const sogConditionId = 'f079-501a-2738-6845'; // this is the SoG condition id
// TODO: get this from game file instead of hardcoding
export function parseIsSoG(root: any): boolean | undefined {
  const sogCondition = findFirstByTagAndAttrs(root, 'condition', {
    type: 'instanceOf',
    value: '1',
    field: 'selections',
    scope: 'ancestor',
    childId: sogConditionId,
  });
  if (sogCondition) {
    return true;
  }
  return undefined;
}