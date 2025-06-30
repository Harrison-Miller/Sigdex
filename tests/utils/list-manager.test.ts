import { describe, it, expect, beforeEach } from 'vitest';
import { calculateViolations } from '../../src/utils/list-manager';
import type { List } from '../../src/common/ListData';
import type { Army, Unit } from '../../src/common/ArmyData';

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

describe('calculateViolations', () => {
  const baseArmy: Army = {
    name: 'TestArmy',
    grandAlliance: 'Order',
    units: [],
  } as any;

  it('flags more than 3 units in a regiment unless leader is general', () => {
    const army = { ...baseArmy };
    army.units = [makeUnit({ name: 'Leader', keywords: ['Hero'] }), makeUnit({ name: 'TestUnit' })];
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
    const army = { ...baseArmy };
    army.units = [makeUnit({ name: 'Leader', keywords: [] })];
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
    const army = { ...baseArmy };
    army.units = [
      makeUnit({ name: 'UniqueGuy', keywords: ['Unique'] }),
      makeUnit({ name: 'Other' }),
    ];
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
    const army = { ...baseArmy };
    army.units = [
      makeUnit({ name: 'ReinforceMe', unit_size: 2, notReinforcable: false }),
      makeUnit({ name: 'NotReinforce', unit_size: 2, notReinforcable: true }),
      makeUnit({ name: 'TooSmall', unit_size: 1, notReinforcable: false }),
    ];
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
});

import {
  createList,
  getAllLists,
  saveList,
  clearAllLists,
  setupDefaultWeaponOptions,
} from '../../src/utils/list-manager';

describe('list-manager serialization', () => {
  beforeEach(() => {
    clearAllLists();
  });

  it('should save and load lists with weapon options correctly', () => {
    // Mock ArmyData
    const mockArmy = {
      units: [
        {
          name: 'TestUnit',
          models: [
            {
              name: 'TestGroup',
              weapons: [
                { name: 'Sword', max: 2 },
                { name: 'Axe', group: 'Main' },
                { name: 'Hammer', group: 'Main' },
              ],
            },
          ],
        },
      ],
      artifacts: new Map(),
      heroicTraits: new Map(),
      manifestationLores: [],
      spellLores: [],
      prayerLores: [],
      battleTraits: [],
      formations: new Map(),
    };
    // Create a list with a unit with weapon options
    const weaponOptions = setupDefaultWeaponOptions('TestUnit', mockArmy as any);
    const list1 = {
      name: 'List1',
      setup: true,
      faction: 'Test',
      formation: '',
      regiments: [
        {
          leader: { name: 'TestUnit', weapon_options: weaponOptions },
          units: [],
        },
      ],
    };
    createList(list1 as any);

    // Create a new empty list
    const list2 = {
      name: 'List2',
      setup: false,
      faction: 'Test',
      formation: '',
      regiments: [],
    };
    createList(list2 as any);

    // Retrieve all lists
    const lists = getAllLists();
    expect(lists.length).toBe(2);
    const loaded1 = lists.find((l) => l.name === 'List1');
    const loaded2 = lists.find((l) => l.name === 'List2');
    expect(loaded1).toBeTruthy();
    expect(loaded2).toBeTruthy();
    // Check weapon options are present and correct
    expect(loaded1!.regiments[0].leader.weapon_options).toBeInstanceOf(Map);
    const group = loaded1!.regiments[0].leader.weapon_options!.get('TestGroup');
    expect(group).toBeTruthy();
    expect(group!.some((w: any) => w.name === 'Sword' && w.count === 2)).toBe(true);
    expect(group!.some((w: any) => w.name === 'Axe')).toBe(true);
    // Only one grouped weapon should be present (the default selection), not both Axe and Hammer
    expect(group!.some((w: any) => w.name === 'Hammer')).toBe(false);
    // List2 should have no regiments
    expect(loaded2!.regiments.length).toBe(0);
  });
});
