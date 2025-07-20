import { ArmyOption } from '../models/army';
import type { Unit } from '../models/unit';
import { findFirstByTagAndAttrs } from '../util';
import type { ICategory } from './parseCommon';

// armies of renown are parsed as normal armies
// this file contains functions for parsing special additional rules or properties that
// generally only apply to armies of renown

export function parseArmyOptions(root: any, armyCategories: Map<string, ICategory>, units: Map<string, Unit>): ArmyOption[] {
  const options: ArmyOption[] = [];
  const mustBeIncluded = parseMustBeIncluded(root, armyCategories);
  if (mustBeIncluded.length > 0) {
    options.push(...mustBeIncluded);
  }
  const requiredGeneral = parseRequiredGenerals(root, units);
  if (requiredGeneral) {
    options.push(requiredGeneral);
  }
  const mustBeGeneralIfIncluded = parseMustBeGeneralIfIncluded(root, units);
  if (mustBeGeneralIfIncluded) {
    options.push(mustBeGeneralIfIncluded);
  }
  return options;
}

export function parseMustBeIncluded(
  root: any,
  armyCategories: Map<string, ICategory>
): ArmyOption[] {
  const requiredOptions = Array.from(armyCategories.values())
    .filter(category => category.rosterMin > 0);

  const options: ArmyOption[] = [];
  for (const r of requiredOptions) {
    const o = new ArmyOption({
      min: r.rosterMin,
      max: r.rosterMax,
      units: [],
      type: 'mustBeIncluded',
    });
    // go through all the battle profiles and find the ones that have this category
    const bps = root.entryLinks?.entryLink || [];
    for (const bp of bps) {
      const name = bp['@_name'];
      const requiredCategory = bp?.categoryLinks?.categoryLink?.find(
        (link: any) => link['@_targetId'] === r.id
      );
      if (name && requiredCategory) {
        console.log(`Adding required unit ${name} for category ${r.name}`);
        o.units.push(name);
      }
    }

    if (o.units.length > 0) {
      options.push(o);
    } else {
      console.warn(`No units found for required category ${r.name}`);
    }
  }
  return options;
}

export function parseRequiredGenerals(root: any, units: Map<string, Unit>): ArmyOption | null {
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
    return new ArmyOption({
      min: 1,
      max: 1,
      units: Array.from(requiredGenerals),
      type: 'requiredGeneral',
    });
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
    return new ArmyOption({
      min: 1,
      max: 1,
      units: generals,
      type: 'requiredGeneral',
    });
  }
  return null;
}

export function parseMustBeGeneralIfIncluded(
  root: any,
  units: Map<string, Unit>,
  restrictGeneralId: string = 'abcb-73d0-2b6c-4f17' // default to the common restrict general id
): ArmyOption | null {
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

  const generals = Array.from(mustBeGeneralIfIncludedId)
    .map((id) => {
      return idToName.get(id) || '';
    })
    .filter((name) => name !== '');
  if (generals.length > 0) {
    return new ArmyOption({
      min: 1,
      max: 1,
      units: generals,
      type: 'generalIfIncluded',
    });
  }
  return null;
}
