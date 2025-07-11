import type { Unit } from '../models/unit';
import { findFirstByTagAndAttrs } from '../util';

// armies of renown are parsed as normal armies
// this file contains functions for parsing special additional rules or properties that
// only apply to armies of renown

export function parseRequiredGenerals(root: any, units: Map<string, Unit>): string[] {
  const bpNodes = root?.entryLinks?.entryLink || [];
  const requiredGenerals: Set<string> = new Set<string>();
  // look for roster constraint min=1
  bpNodes.forEach((node: any) => {
    const name = node['@_name'];
    const unit = units.get(name);
    if (!unit || unit.category !== 'HERO') return; // only heroes can be general

    const constraint = findFirstByTagAndAttrs(node, 'constraint', {
      type: 'min',
      value: '1',
      field: 'selections',
      scope: 'roster',
    });
    if (constraint) {
      requiredGenerals.add(name);

      // sometimes the data doesn't correctly specify SoG variants
      const sogVariant = units.get(`${name} (Scourge of Ghyran)`); // check for scourge variant
      if (sogVariant) {
        requiredGenerals.add(sogVariant.name);
      }
    }
  });

  if (requiredGenerals.size > 0) {
    return Array.from(requiredGenerals);
  }

  // Sometimes the data doesn't use the constraints, it just marks eveything as Restrict General
  const restrictedGenerals: Map<string, boolean> = new Map();
  // gather a list of all units, and record if they are not allowed to be general
  bpNodes.forEach((node: any) => {
    const name = node['@_name'];

    const unit = units.get(name);
    // only heroes can be general
    if (!unit || unit.category !== 'HERO') return;

    const restricted = node?.categoryLinks?.categoryLink?.some(
      (cat: any) => cat['@_name'] === 'Restrict General'
    );
    restrictedGenerals.set(name, restricted);
  });

  // get list of units that can be the general
  const generals = Array.from(restrictedGenerals.entries())
    .filter(([_, restricted]) => !restricted)
    .map(([name, _]) => name);

  // we only want to return required generals if there are restricted generals
  if (generals.length !== restrictedGenerals.size) {
    return generals;
  }
  return [];
}

export function parseMustBeGeneralIfIncluded(
  root: any,
  units: Map<string, Unit>,
  restrictGeneralId: string = 'abcb-73d0-2b6c-4f17' // default to the common restrict general id
): string[] {
  const bpNodes = root?.entryLinks?.entryLink || [];
  const mustBeGeneralIfIncludedId: Set<string> = new Set<string>();
  const idToName: Map<string, string> = new Map<string, string>();

  bpNodes.forEach((node: any) => {
    const name = node['@_name'];
    const id = node['@_id'];
    const unit = units.get(name);
    if (!unit || unit.category !== 'HERO') return; // only heroes can be general

    idToName.set(id, name);

    const restrictGeneralMod = findFirstByTagAndAttrs(node, 'modifier', {
      type: 'add',
      value: restrictGeneralId,
      field: 'category',
    });

    const mustBeGeneralCondition = findFirstByTagAndAttrs(restrictGeneralMod, 'condition', {
      type: 'atLeast',
      value: '1',
      field: 'selections',
      scope: 'roster',
    });
    if (mustBeGeneralCondition) {
      const generalId = mustBeGeneralCondition['@_childId'];
      if (generalId) {
        mustBeGeneralIfIncludedId.add(generalId);
      }
    }
  });

  return Array.from(mustBeGeneralIfIncludedId)
    .map((id) => {
      return idToName.get(id) || '';
    })
    .filter((name) => name !== '');
}
