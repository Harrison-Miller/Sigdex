import type { Ability } from '../models/ability';
import { RegimentOfRenown, type IRegimentOfRenown } from '../models/regimentOfRenown';
import { findAllByTagAndAttrs, findFirstByTagAndAttrs } from '../util';
import { parseAbilities } from './parseAbility';
import { parsePoints } from './parseCommon';

export function parseRegimentsOfRenown(
  rorRoot: any,
  gameRoot: any,
  armyIds: Map<string, string>
): Map<string, RegimentOfRenown> {
  const rorUnitDefinitions = parseRoRUnitDefinitions(rorRoot);
  const rorProfiles = parseRoRProfiles(gameRoot, armyIds);

  const rorMap = new Map<string, RegimentOfRenown>();
  const rorNodes = rorRoot?.sharedSelectionEntries?.selectionEntry || [];
  for (const rorNode of rorNodes) {
    // strip Regiment of Renown: prefix
    const name = rorNode['@_name']?.substring('Regiment of Renown: '.length)?.trim() || '';
    if (!name) continue;

    const rorCondition = findFirstByTagAndAttrs(rorNode, 'condition', {
      type: 'atLeast',
      field: 'selections',
      scope: 'roster',
    });
    const rorProfile = rorProfiles.get(name) || rorProfiles.get(rorCondition?.['@_childId'] || '');

    const abilities: Ability[] = [];
    const rorUnitAbilities = parseRoRUnitAbilities(rorNode, rorUnitDefinitions);
    if (rorUnitAbilities && rorUnitAbilities.length > 0) {
      abilities.push(...rorUnitAbilities);
    }
    const rorAbilities = parseAbilities(rorNode.profiles);
    if (rorAbilities && rorAbilities.length > 0) {
      abilities.push(...rorAbilities);
    }

    const ror: Partial<IRegimentOfRenown> = {
      name,
      abilities,
      points: rorProfile?.points,
      units: parseRoRUnits(rorNode, rorUnitDefinitions),
      allowedArmies: rorProfile?.armies,
    };

    if (!ror.units || !ror.points || !ror.allowedArmies) {
      console.warn(`Skipping Regiment of Renown "${name}" due to missing data: `, ror);
      continue;
    }

    // remove legends and aor armies
    // ror.allowedArmies = ror.allowedArmies.filter(
    //   (army) => !army.toLowerCase().includes('legends')
    //   // some aor's can have ror's (like LotFP)
    //   // && !army.includes(' - ') 
    // );

    rorMap.set(name, new RegimentOfRenown(ror));
  }
  return rorMap;
}

interface IRoRProfile {
  name: string;
  id: string;
  points: number;
  armies: string[];
}

function parseRoRProfiles(gameRoot: any, armyIds: Map<string, string>): Map<string, IRoRProfile> {
  const ghb = gameRoot?.forceEntries?.forceEntry?.find((entry: any) =>
    entry['@_name'].includes('2025-26')
  );
  if (!ghb) return new Map();

  const rorNode = ghb?.forceEntries?.forceEntry || gameRoot?.forceEntries?.forceEntry || [];
  const profiles: Map<string, IRoRProfile> = new Map();
  for (const profileNode of rorNode) {
    const name = profileNode['@_name']?.trim();
    if (!name) continue;

    const id = profileNode['@_id'] || '';
    if (!id) continue; // skip if no id

    const points = parsePoints(profileNode);
    if (!points || points <= 0) continue;

    const armyConditions = findAllByTagAndAttrs(profileNode, 'condition', {
      type: 'instanceOf',
      field: 'selections',
      scope: 'parent',
    });
    const armies: string[] = [];
    for (const condition of armyConditions) {
      const childId = condition['@_childId'];
      if (childId) {
        let armyName = armyIds.get(childId);
        armyName = armyName?.replace(/[^a-zA-Z0-9\s.,'!-]/g, '').trim();
        armyName = armyName?.replace(/legends/i, '').trim();
        if (armyName) {
          armies.push(armyName);
        }
      }
    }
    if (armies.length === 0) continue; // no armies, skip this profile

    profiles.set(name, {
      name,
      id,
      points,
      armies,
    });
    profiles.set(id, {
      name,
      id,
      points,
      armies,
    }); // also store by id for easier lookup
  }
  return profiles;
}

interface IRoRUnitDefinition {
  name: string;
  abilities: Ability[];
  // map because multiple rors can have the same unit
  // ror condition id to count
  counts: Map<string, number>;
}

function parseRoRUnitDefinitions(rorRoot: any): IRoRUnitDefinition[] {
  const unitNodes = rorRoot?.entryLinks?.entryLink || [];
  const units: IRoRUnitDefinition[] = [];
  for (const unitNode of unitNodes) {
    const name = unitNode['@_name'];
    if (!name) continue; // skip if no name

    const abilities: Ability[] = parseAbilities(unitNode.profiles);

    const modiferGroups = unitNode.modifierGroups?.modifierGroup || [];
    const counts = new Map<string, number>();
    for (const modifierGroup of modiferGroups) {
      const mods = modifierGroup.modifiers.modifier || [];
      let count = 0;
      for (const mod of mods) {
        if (mod['@_type'] === 'set') {
          count = parseInt(mod['@_value'] || '1', 10);
          if (count > 0) break; // found count, no need to check others
        }
      }
      if (count <= 0) continue; // no count, skip this unit
      const condition = findFirstByTagAndAttrs(modifierGroup, 'condition', {
        type: 'instanceOf',
        field: 'selections',
        scope: 'force',
      });
      if (!condition) continue; // no condition, skip this unit
      const childId = condition['@_childId'];
      if (!childId) continue; // no childId, skip this unit
      counts.set(childId, count);
    }

    units.push({
      abilities,
      name,
      counts,
    });
  }
  return units;
}

function parseRoRUnits(
  rorNode: any,
  rorUnitDefinitions: IRoRUnitDefinition[]
): Map<string, number> {
  const units = new Map<string, number>();

  const conditions = findAllByTagAndAttrs(rorNode, 'condition', {
    type: 'atLeast',
    field: 'selections',
    scope: 'roster',
  });

  for (const condition of conditions) {
    const childId = condition['@_childId'];
    const definitions = rorUnitDefinitions.filter((def) => def.counts.has(childId));
    if (definitions.length > 0) {
      for (const definition of definitions) {
        units.set(definition.name, definition.counts.get(childId) || 0);
      }
    }
  }

  return units;
}

function parseRoRUnitAbilities(
  rorNode: any,
  rorUnitDefinitions: IRoRUnitDefinition[]
): Ability[] {
  const abilities: Ability[] = [];

  const conditions = findAllByTagAndAttrs(rorNode, 'condition', {
    type: 'atLeast',
    field: 'selections',
    scope: 'roster',
  });

  for (const condition of conditions) {
    const childId = condition['@_childId'];
    const definitions = rorUnitDefinitions.filter((def) => def.counts.has(childId));
    if (definitions.length > 0) {
      for (const definition of definitions) {
        if (!definition.abilities) continue; // skip if no abilities
        abilities.push(...definition.abilities);
      }
    }
  }

  return abilities;
}