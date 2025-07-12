import { RegimentOfRenown, type IRegimentOfRenown } from '../models/regimentOfRenown';
import { findAllByTagAndAttrs } from '../util';
import { parseAbilities } from './parseAbility';
import { parsePoints } from './parseCommon';

export function parseRegimentsOfRenown(
  rorRoot: any,
  gameRoot: any,
  armyIds: Map<string, string>
): Map<string, RegimentOfRenown> {
  console.log(
    `armyids: ${Array.from(armyIds.entries())
      .map(([name, id]) => `${name} (${id})`)
      .join(', ')}`
  );

  const rorUnitDefinitions = parseRoRUnitDefinitions(rorRoot);
  console.log(`Found ${rorUnitDefinitions.length} Regiment of Renown unit definitions`);
  const rorProfiles = parseRoRProfiles(gameRoot, armyIds);
  console.log(`Found ${rorProfiles.size} Regiment of Renown profiles`);

  const rorMap = new Map<string, RegimentOfRenown>();
  const rorNodes = rorRoot?.sharedSelectionEntries?.selectionEntry || [];
  for (const rorNode of rorNodes) {
    // strip Regiment of Renown: prefix
    const name = rorNode['@_name']?.substring('Regiment of Renown: '.length)?.trim() || '';
    if (!name) continue;

    const ror: Partial<IRegimentOfRenown> = {
      name,
      abilities: parseAbilities(rorNode.profiles),
      points: rorProfiles.get(name)?.points,
      units: parseRoRUnits(rorNode, rorUnitDefinitions),
      allowedArmies: rorProfiles.get(name)?.armies,
    };
    rorMap.set(name, new RegimentOfRenown(ror));
  }
  return rorMap;
}

interface IRoRProfile {
  name: string;
  points: number;
  armies: string[];
}

function parseRoRProfiles(gameRoot: any, armyIds: Map<string, string>): Map<string, IRoRProfile> {
  const ghb = gameRoot?.forceEntries?.forceEntry?.find((entry: any) =>
    entry['@_name'].includes('2025-26')
  );
  if (!ghb) return new Map();
  console.log(`Found GHB: ${ghb['@_name']}`);

  const rorNode = ghb?.forceEntries?.forceEntry || [];
  console.log(`Found ${rorNode.length} Regiment of Renown profiles in GHB`);

  const profiles: Map<string, IRoRProfile> = new Map();
  for (const profileNode of rorNode) {
    const name = profileNode['@_name']?.trim();
    if (!name) continue;

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
        const armyName = armyIds.get(childId);
        if (armyName) {
          armies.push(armyName);
        }
      }
    }
    if (armies.length === 0) continue; // no armies, skip this profile

    profiles.set(name, {
      name,
      points,
      armies,
    });
  }
  return profiles;
}

interface IRoRUnitDefinition {
  name: string;
  // map because multiple rors can have the same unit
  // ror condition id to count
  counts: Map<string, number>;
}

function parseRoRUnitDefinitions(rorRoot: any): IRoRUnitDefinition[] {
  const unitNodes = rorRoot?.entryLinks?.entryLink || [];
  const units: IRoRUnitDefinition[] = [];
  for (const unitNode of unitNodes) {
    const name = unitNode['@_name'];

    if (name) {
      const conditions = findAllByTagAndAttrs(unitNode, 'condition', {
        type: 'instanceOf',
        field: 'selections',
        scope: 'force',
      });
      const counts = new Map<string, number>();
      for (const condition of conditions) {
        const childId = condition['@_childId'];
        if (childId) {
          const count = parseInt(condition['@_value'] || '1', 10);
          counts.set(childId, count);
        }
      }

      units.push({
        name,
        counts,
      });
    }
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
