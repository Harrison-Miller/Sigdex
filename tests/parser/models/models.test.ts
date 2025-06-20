import { describe, it, expect } from 'vitest';
import { DOMParser } from 'xmldom';
import { parseModelGroups } from '../../../src/parser/models';
import { loonbossConstraints } from './loonboss';
import { liberatorConstraints } from './liberators';
import { protectorConstraints } from './protectors';
import { squigHerdConstraints } from './squigherd';
import { thundererConstraints } from './thunderers';
import { stormfiendConstraints } from './stormfiends';

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

    expect(modelGroups[1].name).toBe('Squig Herder');
    expect(modelGroups[1].count).toBe(2);
    expect(modelGroups[1].weapons.length).toBe(1);
    expect(modelGroups[1].weapons[0].name).toBe('Squig Prodder');
    expect(modelGroups[1].weapons[0].max).toBeUndefined(); // default weapons have no max
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
    expect(modelGroups[0].weapons[1].name).toBe('Aethershot Rifle');
    expect(modelGroups[0].weapons[1].max).toBeUndefined(); // default weapons have no max
    expect(modelGroups[0].weapons[2].name).toBe('Heavy Gun Butt');
    expect(modelGroups[0].weapons[2].max).toBeUndefined(); // default weapons have no max
    expect(modelGroups[0].weapons[3].name).toBe('Aetheric Fumigator or Decksweeper');
    expect(modelGroups[0].weapons[3].max).toBe(2);
  });

  it('3 different stormfiends each with different mutually exclusive options', () => {
    const root = new DOMParser().parseFromString(stormfiendConstraints, 'text/xml').documentElement;
    const modelGroups = parseModelGroups(root);
    expect(modelGroups.length).toBe(3);

    expect(modelGroups[0].name).toBe('Stormfiend');
    expect(modelGroups[0].count).toBe(1);
    expect(modelGroups[0].weapons.length).toBe(2);
    expect(modelGroups[0].weapons[0].name).toContain('Ratling Cannons and Clubbing Blows');
    expect(modelGroups[0].weapons[0].max).toBeUndefined(); // default weapons have no max
    expect(modelGroups[0].weapons[1].name).toContain('Grinderfists');
    expect(modelGroups[0].weapons[1].max).toBe(1);

    expect(modelGroups[1].name).toBe('Stormfiend');
    expect(modelGroups[1].count).toBe(1);
    expect(modelGroups[1].weapons.length).toBe(2);
    expect(modelGroups[1].weapons[0].name).toContain('Warpfire Projectors and Clubbing Blows');
    expect(modelGroups[1].weapons[0].max).toBeUndefined(); // default weapons have no max
    expect(modelGroups[1].weapons[1].name).toContain('Windlaunchers and Clubbing Blows');
    expect(modelGroups[1].weapons[1].max).toBe(1);

    expect(modelGroups[2].name).toBe('Stormfiend');
    expect(modelGroups[2].count).toBe(1);
    expect(modelGroups[2].weapons.length).toBe(2);
    expect(modelGroups[2].weapons[0].name).toContain('Doomflayer Gauntlets');
    expect(modelGroups[2].weapons[0].max).toBeUndefined(); // default weapons have no max
    expect(modelGroups[2].weapons[1].name).toContain('Shock Gauntlets');
    expect(modelGroups[2].weapons[1].max).toBe(1);
  });
});
