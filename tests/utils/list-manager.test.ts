import { describe, it, expect, beforeEach } from 'vitest';
import {
  createList,
  getAllLists,
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
