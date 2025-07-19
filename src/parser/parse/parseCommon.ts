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
  rosterMin: number;
  rosterMax: number;
}

export function parseCategories(root: any): Map<string, ICategory> {
  const categories: Map<string, ICategory> = new Map();
  const categoryNodes = root?.categoryEntries?.categoryEntry || [];
  for (const node of categoryNodes) {
    const id = node['@_id'];
    const name = node['@_name'];
    const childConditionIds = findAllByTagAndAttrs(node, 'condition', {
      type: 'instanceOf',
      value: '1',
    }).map((condition: any) => condition['@_childId'] || '');

    //  <constraint type="min" value="1" field="selections" scope="roster" shared="true" id="ddca-74ca-7b07-cc42-min" includeChildSelections="true" includeChildForces="true"/>
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

    if (id && name) {
      if (rosterMin >= 0 || rosterMax >= 0) {
        console.log(`Parsed category: ${name} (ID: ${id}) with min: ${rosterMin}, max: ${rosterMax}`);
      }
      categories.set(id, { name, id, childConditionIds, rosterMin, rosterMax });
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