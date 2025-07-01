import { describe, it, expect } from 'vitest';
import {
  calculateRegimentOptionViolations,
  calculateViolations,
} from '../../src/utils/violations-manager';
import { Army } from '../../src/common/ArmyData';
import type { List } from '../../src/common/ListData';
import type { Unit } from '../../src/common/ArmyData';

// Minimal Army/unit/regiment mocks for testing
const makeArmy = (units: any[]) =>
  new Army(
    units,
    new Map(), // artifacts
    new Map(), // heroicTraits
    [], // manifestationLores
    [], // spellLores
    [], // prayerLores
    [], // battleTraits
    new Map() // formations
  );
const makeRegiment = (leader: any, units: any[]) => ({ leader, units });

const hero = (name: string, sub_hero_tags: string[] = []) => ({
  name,
  category: 'Hero',
  sub_hero_tags,
});
const unit = (name: string, keywords: string[] = [], category = 'Battleline') => ({
  name,
  keywords,
  category,
});

const leaderWithOptions = (name: string, opts: any = {}) => ({
  name,
  category: 'Hero',
  ...opts,
});

function makeUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    name: 'TestUnit',
    stats: { move: '5"', health: 5, save: '4+' },
    melee_weapons: [],
    ranged_weapons: [],
    abilities: [],
    keywords: [],
    ...overrides,
  };
}

describe('calculateRegimentOptionViolations', () => {
  it('allows hero in regiment only if sub_hero_tags match sub_hero_option', () => {
    const army = makeArmy([
      leaderWithOptions('Boss', { sub_hero_options: [{ name: 'Shaman', max: 1 }] }),
      hero('Goblin', ['Shaman']),
      hero('Ogre', ['Brute']),
    ]);
    // Allowed: sub_hero_tags match sub_hero_option
    let reg = makeRegiment(army.units[0], [army.units[1]]);
    expect(calculateRegimentOptionViolations(reg, army)).toEqual([]);
    // Not allowed: sub_hero_tags do not match
    reg = makeRegiment(army.units[0], [army.units[2]]);
    const ogreViolations = calculateRegimentOptionViolations(reg, army);
    expect(ogreViolations).toContain("Hero 'Ogre' is not allowed in this regiment led by 'Boss'.");
    // Not allowed: same name as leader, but no matching sub_hero_option or regiment_option
    reg = makeRegiment(army.units[0], [army.units[0]]);
    const bossViolations = calculateRegimentOptionViolations(reg, army);
    expect(bossViolations).toContain("Hero 'Boss' is not allowed in this regiment led by 'Boss'.");
  });

  it('enforces sub-hero max', () => {
    const army = makeArmy([
      leaderWithOptions('Boss', { sub_hero_options: [{ name: 'Shaman', max: 1 }] }),
      hero('Goblin1', ['Shaman']),
      hero('Goblin2', ['Shaman']),
    ]);
    const reg = makeRegiment(army.units[0], [army.units[1], army.units[2]]);
    expect(calculateRegimentOptionViolations(reg, army)).toContain(
      "Too many sub-heroes of type 'Shaman' (max 1) in regiment led by 'Boss'."
    );
  });

  it('enforces regiment option max', () => {
    const army = makeArmy([
      leaderWithOptions('Boss', { regiment_options: [{ name: 'Wolf', max: 1 }] }),
      unit('Wolf', ['wolf']),
      unit('Wolf2', ['wolf']),
    ]);
    const reg = makeRegiment(army.units[0], [army.units[1], army.units[2]]);
    expect(calculateRegimentOptionViolations(reg, army)).toContain(
      "Too many units matching regiment option 'Wolf' (max 1) in regiment led by 'Boss'."
    );
  });

  it('requires all units to match unlimited regiment options', () => {
    const army = makeArmy([
      leaderWithOptions('Boss', { regiment_options: [{ name: 'Squig', max: 0 }] }),
      unit('Squig', ['squig']),
      unit('Wolf', ['wolf']),
    ]);
    const reg = makeRegiment(army.units[0], [army.units[1], army.units[2]]);
    expect(calculateRegimentOptionViolations(reg, army)).toContain(
      "Unit 'Wolf' does not match any required regiment option in regiment led by 'Boss'."
    );
  });

  it('allows hero if regiment option matches exact name', () => {
    const army = makeArmy([
      leaderWithOptions('Boss', { regiment_options: [{ name: 'Ogre', max: 1 }] }),
      hero('Ogre'),
    ]);
    const reg = makeRegiment(army.units[0], [army.units[1]]);
    expect(calculateRegimentOptionViolations(reg, army)).toEqual([]);
  });

  it('returns no violations for valid regiment', () => {
    const army = makeArmy([
      leaderWithOptions('Boss', {
        sub_hero_options: [{ name: 'Shaman', max: 1 }],
        regiment_options: [{ name: 'Wolf', max: 2 }],
      }),
      hero('Goblin', ['Shaman']),
      unit('Wolf', ['wolf']),
    ]);
    const reg = makeRegiment(army.units[0], [army.units[1], army.units[2]]);
    expect(calculateRegimentOptionViolations(reg, army)).toEqual([]);
  });
});

describe('calculateViolations', () => {
  const baseArmy: Army = new Army(
    [],
    new Map(), // artifacts
    new Map(), // heroicTraits
    [], // manifestationLores
    [], // spellLores
    [], // prayerLores
    [], // battleTraits
    new Map() // formations
  );

  it('flags more than 3 units in a regiment unless leader is general', () => {
    const army = new Army(
      [makeUnit({ name: 'Leader', keywords: ['Hero'] }), makeUnit({ name: 'TestUnit' })],
      new Map(),
      new Map(),
      [],
      [],
      [],
      [],
      new Map()
    );
    const list: List = {
      name: 'Test',
      setup: true,
      faction: 'Test',
      formation: '',
      regiments: [
        {
          leader: { name: 'Leader', general: false },
          units: [
            { name: 'TestUnit' },
            { name: 'TestUnit' },
            { name: 'TestUnit' },
            { name: 'TestUnit' },
          ],
        },
      ],
    };
    const violations = calculateViolations(list, army);
    expect(violations.some((v) => v.includes('No more than 3 units'))).toBe(true);
    // Now with general
    list.regiments[0].leader.general = true;
    expect(calculateViolations(list, army).some((v) => v.includes('No more than 3 units'))).toBe(
      false
    );
  });

  it('flags regiment leader not hero', () => {
    const army = new Army(
      [makeUnit({ name: 'Leader', keywords: [] })],
      new Map(),
      new Map(),
      [],
      [],
      [],
      [],
      new Map()
    );
    const list: List = {
      name: 'Test',
      setup: true,
      faction: 'Test',
      formation: '',
      regiments: [
        {
          leader: { name: 'Leader' },
          units: [],
        },
      ],
    };
    const violations = calculateViolations(list, army);
    expect(violations.some((v) => v.includes('Regiment leader must have the Hero category'))).toBe(
      true
    );
  });

  it('flags duplicate unique units', () => {
    const army = new Army(
      [makeUnit({ name: 'UniqueGuy', keywords: ['Unique'] }), makeUnit({ name: 'Other' })],
      new Map(),
      new Map(),
      [],
      [],
      [],
      [],
      new Map()
    );
    const list: List = {
      name: 'Test',
      setup: true,
      faction: 'Test',
      formation: '',
      regiments: [
        {
          leader: { name: 'Other' },
          units: [{ name: 'UniqueGuy' }],
        },
        {
          leader: { name: 'Other' },
          units: [{ name: 'UniqueGuy' }],
        },
      ],
    };
    const violations = calculateViolations(list, army);
    expect(violations.some((v) => v.includes('Duplicate unique unit'))).toBe(true);
  });

  it('flags invalid reinforcement', () => {
    const army = new Army(
      [
        makeUnit({ name: 'ReinforceMe', unit_size: 2, notReinforcable: false }),
        makeUnit({ name: 'NotReinforce', unit_size: 2, notReinforcable: true }),
        makeUnit({ name: 'TooSmall', unit_size: 1, notReinforcable: false }),
      ],
      new Map(),
      new Map(),
      [],
      [],
      [],
      [],
      new Map()
    );
    const list: List = {
      name: 'Test',
      setup: true,
      faction: 'Test',
      formation: '',
      regiments: [
        {
          leader: { name: 'Other' },
          units: [
            { name: 'ReinforceMe', reinforced: true },
            { name: 'NotReinforce', reinforced: true },
            { name: 'TooSmall', reinforced: true },
          ],
        },
      ],
    };
    const violations = calculateViolations(list, army);
    expect(violations.some((v) => v.includes('cannot be reinforced'))).toBe(true);
    // Valid reinforce
    list.regiments[0].units[0].reinforced = false;
    expect(calculateViolations(list, army).some((v) => v.includes('cannot be reinforced'))).toBe(
      true
    );
  });

  it('flags Scourge of Ghyran exclusivity', () => {
    const army = new Army(
      [
        makeUnit({ name: 'Loonsmasha Fanatics' }),
        makeUnit({ name: 'Loonsmasha Fanatics (Scourge of Ghyran)' }),
      ],
      new Map(),
      new Map(),
      [],
      [],
      [],
      [],
      new Map()
    );
    const list: List = {
      name: 'Test',
      setup: true,
      faction: 'Test',
      formation: '',
      regiments: [
        {
          leader: { name: 'Other' },
          units: [
            { name: 'Loonsmasha Fanatics' },
            { name: 'Loonsmasha Fanatics (Scourge of Ghyran)' },
          ],
        },
      ],
    };
    const violations = calculateViolations(list, army);
    expect(violations).toContain(
      "Cannot include both 'Loonsmasha Fanatics' and 'Loonsmasha Fanatics (Scourge of Ghyran)' in the same list."
    );
  });
});
