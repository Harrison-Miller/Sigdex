import { describe, it, expect } from 'vitest';
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
