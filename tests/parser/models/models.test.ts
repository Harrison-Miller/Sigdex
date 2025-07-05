import { describe, it, expect } from 'vitest';
import { DOMParser } from 'xmldom';
import { parseModelGroups } from '../../../src/parser/models';
import { loonbossConstraints } from './loonboss';
import { liberatorConstraints } from './liberators';
import { protectorConstraints } from './protectors';
import { squigHerdConstraints } from './squigherd';
import { thundererConstraints } from './thunderers';
import { stormfiendConstraints } from './stormfiends';
import { alloplexConstraints } from './alloplex';
import { isDefaultModelGroups } from '../../../src/common/UnitData';
import { akranautConstraints } from './arkanaut';

describe('parseModelGroups', () => {
  it('loonboss, just the default weapon', () => {
    const root = new DOMParser().parseFromString(loonbossConstraints, 'text/xml').documentElement;
    const modelGroups = parseModelGroups(root);
    expect(modelGroups.length).toBe(1);
    expect(modelGroups[0].name).toBe('Loonboss');
    expect(modelGroups[0].count).toBe(1);

    expect(modelGroups[0].weapons.length).toBe(1);
    expect(modelGroups[0].weapons[0].name).toBe('Moon-slicer');
    expect(modelGroups[0].weapons[0].max).toBeUndefined(); //default weapons have no max
    expect(modelGroups[0].weapons[0].replaces).toBeUndefined(); // no replaces for default weapons
    expect(isDefaultModelGroups(modelGroups)).toBe(true); // no custom model groups
  });

  it('liberators, max 1 grandhammer', () => {
    const root = new DOMParser().parseFromString(liberatorConstraints, 'text/xml').documentElement;
    const modelGroups = parseModelGroups(root);
    expect(modelGroups.length).toBe(1);
    expect(modelGroups[0].name).toBe('Liberator');
    expect(modelGroups[0].count).toBe(5);

    expect(modelGroups[0].weapons.length).toBe(2);
    expect(modelGroups[0].weapons[0].name).toBe('Grandhammer');
    expect(modelGroups[0].weapons[0].max).toBe(1);
    expect(modelGroups[0].weapons[0].replaces).toContain('Warhammer'); // grandhammer replaces warhammer

    expect(modelGroups[0].weapons[1].name).toBe('Warhammer');
    expect(modelGroups[0].weapons[1].max).toBeUndefined(); // default weapons have no max
  });

  it('protectors, max 2 starsoulmace', () => {
    const root = new DOMParser().parseFromString(protectorConstraints, 'text/xml').documentElement;
    const modelGroups = parseModelGroups(root);
    expect(modelGroups.length).toBe(1);
    expect(modelGroups[0].name).toBe('Protector');
    expect(modelGroups[0].count).toBe(5);
    expect(modelGroups[0].weapons.length).toBe(2);
    expect(modelGroups[0].weapons[0].name).toBe('Starsoul Mace');
    expect(modelGroups[0].weapons[0].max).toBe(2);
    expect(modelGroups[0].weapons[0].replaces).toContain('Protector Stormstrike Glaive'); // starsoul mace replaces stormstrike glaive

    expect(modelGroups[0].weapons[1].name).toBe('Protector Stormstrike Glaive');
    expect(modelGroups[0].weapons[1].max).toBeUndefined(); // default weapons have no max
  });

  it('squigherd, 10 cave squigs, 2 squig herders', () => {
    const root = new DOMParser().parseFromString(squigHerdConstraints, 'text/xml').documentElement;
    const modelGroups = parseModelGroups(root);
    expect(modelGroups.length).toBe(2);
    expect(modelGroups[0].name).toBe('Cave Squig');
    expect(modelGroups[0].count).toBe(10);
    expect(modelGroups[0].weapons.length).toBe(1);
    expect(modelGroups[0].weapons[0].name).toBe('Fang-filled Gob');
    expect(modelGroups[0].weapons[0].max).toBeUndefined(); // default weapons have no max
    expect(modelGroups[0].weapons[0].replaces).toBeUndefined(); // no replaces for default weapons

    expect(modelGroups[1].name).toBe('Squig Herder');
    expect(modelGroups[1].count).toBe(2);
    expect(modelGroups[1].weapons.length).toBe(1);
    expect(modelGroups[1].weapons[0].name).toBe('Squig Prodder');
    expect(modelGroups[1].weapons[0].max).toBeUndefined(); // default weapons have no max
    expect(modelGroups[1].weapons[0].replaces).toBeUndefined(); // no replaces for default weapons
  });

  it('thunderers, max 2 mortars, max 2 fumigators', () => {
    const root = new DOMParser().parseFromString(thundererConstraints, 'text/xml').documentElement;
    const modelGroups = parseModelGroups(root);
    expect(modelGroups.length).toBe(1);
    expect(modelGroups[0].name).toBe('Grundstok Thunderer');
    expect(modelGroups[0].count).toBe(5);

    expect(modelGroups[0].weapons.length).toBe(4);
    expect(modelGroups[0].weapons[0].name).toBe('Grundstok Mortar or Aethercannon');
    expect(modelGroups[0].weapons[0].max).toBe(2);
    expect(modelGroups[0].weapons[0].replaces).toContain('Aethershot Rifle'); // mortar replaces aethershot rifle

    expect(modelGroups[0].weapons[1].name).toBe('Aethershot Rifle');
    expect(modelGroups[0].weapons[1].max).toBeUndefined(); // default weapons have no max
    expect(modelGroups[0].weapons[1].replaces).toBeUndefined(); // no replaces for default weapons

    expect(modelGroups[0].weapons[2].name).toBe('Heavy Gun Butt');
    expect(modelGroups[0].weapons[2].max).toBeUndefined(); // default weapons have no max
    expect(modelGroups[0].weapons[2].replaces).toBeUndefined(); // no replaces for default weapons

    expect(modelGroups[0].weapons[3].name).toBe('Aetheric Fumigator or Decksweeper');
    expect(modelGroups[0].weapons[3].max).toBe(2);
    expect(modelGroups[0].weapons[3].replaces).toContain('Aethershot Rifle'); // fumigator replaces aethershot rifle
  });

  it('3 different stormfiends each with different mutually exclusive options', () => {
    const root = new DOMParser().parseFromString(stormfiendConstraints, 'text/xml').documentElement;
    const modelGroups = parseModelGroups(root);
    expect(modelGroups.length).toBe(3);

    expect(modelGroups[0].name).toBe('Stormfiend A');
    expect(modelGroups[0].count).toBe(1);
    expect(modelGroups[0].weapons.length).toBe(2);
    expect(modelGroups[0].weapons[0].name).toContain('Ratling Cannons and Clubbing Blows');
    expect(modelGroups[0].weapons[0].max).toBeUndefined();
    expect(modelGroups[0].weapons[0].replaces).toBeUndefined(); // no replaces for grouped weapons
    expect(modelGroups[0].weapons[0].group).toBe('Wargear Options'); // group name for selectionEntryGroup
    expect(modelGroups[0].weapons[1].name).toContain('Grinderfists');
    expect(modelGroups[0].weapons[1].max).toBeUndefined();
    expect(modelGroups[0].weapons[1].replaces).toBeUndefined(); // no replaces for grouped weapons
    expect(modelGroups[0].weapons[1].group).toBe('Wargear Options'); // group name for selectionEntryGroup

    expect(modelGroups[1].name).toBe('Stormfiend B');
    expect(modelGroups[1].count).toBe(1);
    expect(modelGroups[1].weapons.length).toBe(2);
    expect(modelGroups[1].weapons[0].name).toContain('Warpfire Projectors and Clubbing Blows');
    expect(modelGroups[1].weapons[0].max).toBeUndefined();
    expect(modelGroups[1].weapons[0].replaces).toBeUndefined(); // no replaces for grouped weapons
    expect(modelGroups[1].weapons[0].group).toBe('Wargear Options'); // group name for selectionEntryGroup
    expect(modelGroups[1].weapons[1].name).toContain('Windlaunchers and Clubbing Blows');
    expect(modelGroups[1].weapons[1].max).toBeUndefined();
    expect(modelGroups[1].weapons[1].group).toBe('Wargear Options'); // group name for selectionEntryGroup
    expect(modelGroups[1].weapons[1].replaces).toBeUndefined(); // no replaces for grouped weapons

    expect(modelGroups[2].name).toBe('Stormfiend C');
    expect(modelGroups[2].count).toBe(1);
    expect(modelGroups[2].weapons.length).toBe(2);
    expect(modelGroups[2].weapons[0].name).toContain('Doomflayer Gauntlets');
    expect(modelGroups[2].weapons[0].max).toBeUndefined();
    expect(modelGroups[2].weapons[0].replaces).toBeUndefined(); // no replaces for grouped weapons
    expect(modelGroups[2].weapons[0].group).toBe('Wargear Options'); // group name for selectionEntryGroup
    expect(modelGroups[2].weapons[1].name).toContain('Shock Gauntlets');
    expect(modelGroups[2].weapons[1].max).toBeUndefined();
    expect(modelGroups[2].weapons[1].group).toBe('Wargear Options'); // group name for selectionEntryGroup
    expect(modelGroups[2].weapons[1].replaces).toBeUndefined(); // no replaces for grouped weapons
  });

  it('alloplex 2 default melee weapons, 2 mutually exclusive ranged weapons', () => {
    const root = new DOMParser().parseFromString(alloplexConstraints, 'text/xml').documentElement;
    const modelGroups = parseModelGroups(root);
    expect(modelGroups.length).toBe(1);
    expect(modelGroups[0].name).toBe('Akhelian Allopex');
    expect(modelGroups[0].count).toBe(1);
    expect(modelGroups[0].weapons.length).toBe(4);

    expect(modelGroups[0].weapons[0].name).toBe('Barbed Hooks and Blades');
    expect(modelGroups[0].weapons[0].max).toBeUndefined(); // default weapons have no max

    expect(modelGroups[0].weapons[1].name).toBe('Allopex’s Ferocious Bite');
    expect(modelGroups[0].weapons[1].max).toBeUndefined(); // default weapons have no max

    expect(modelGroups[0].weapons[2].name).toBe('Razorshell Harpoon');
    expect(modelGroups[0].weapons[2].max).toBeUndefined();
    expect(modelGroups[0].weapons[2].replaces).toBeUndefined(); // no replaces for grouped weapons
    expect(modelGroups[0].weapons[2].group).toBe('Wargear Options'); // group name for selectionEntryGroup

    expect(modelGroups[0].weapons[3].name).toBe('Retarius Net Launcher');
    expect(modelGroups[0].weapons[3].max).toBeUndefined();
    expect(modelGroups[0].weapons[3].replaces).toBeUndefined(); // no replaces for grouped weapons
    expect(modelGroups[0].weapons[3].group).toBe('Wargear Options'); // group name for selectionEntryGroup
  });

  it('arkanauts', () => {
    const root = new DOMParser().parseFromString(akranautConstraints, 'text/xml').documentElement;
    const modelGroups = parseModelGroups(root);
    expect(modelGroups.length).toBe(1);
    expect(modelGroups[0].name).toBe('Arkanaut');
    expect(modelGroups[0].count).toBe(10);
    expect(modelGroups[0].weapons.length).toBe(5);

    expect(modelGroups[0].weapons[0].name).toBe('Skypike');
    expect(modelGroups[0].weapons[0].max).toBe(1); // max 1 Skypike
    expect(modelGroups[0].weapons[0].replaces).toContain('Arkanaut Hand Weapon');
    expect(modelGroups[0].weapons[0].replaces).toContain('Privateer Pistol');

    expect(modelGroups[0].weapons[1].name).toBe('Privateer Pistol');
    expect(modelGroups[0].weapons[1].max).toBeUndefined(); // default weapons have no max
    expect(modelGroups[0].weapons[1].replaces).toBeUndefined(); // no replaces for default weapons

    expect(modelGroups[0].weapons[2].name).toBe('Arkanaut Hand Weapon');
    expect(modelGroups[0].weapons[2].max).toBeUndefined(); // default weapons have no max
    expect(modelGroups[0].weapons[2].replaces).toBeUndefined(); // no replaces for default weapons

    expect(modelGroups[0].weapons[3].name).toBe('Aethermatic Volley Gun');
    expect(modelGroups[0].weapons[3].max).toBe(1);
    expect(modelGroups[0].weapons[3].replaces).toContain('Privateer Pistol');

    expect(modelGroups[0].weapons[4].name).toBe('Light Skyhook');
    expect(modelGroups[0].weapons[4].max).toBe(1);
    expect(modelGroups[0].weapons[4].replaces).toContain('Privateer Pistol');
  });
});
