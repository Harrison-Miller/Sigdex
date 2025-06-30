import { describe, it, expect } from 'vitest';
import { parseCompanionUnits } from '../../src/parser/companionunits';
import { DOMParser } from 'xmldom';
import { callisAndTollArmyInfo } from './callisandtoll';
import { rabblerowzaAndSkitterstrandArmyInfo } from './rabblerowza';
import { neaveArmyInfo } from './neave';
import { oathswordKinArmyInfo } from './oathswornkin';

describe('parseCompanionUnits', () => {
  it("returns Toll's Companions for Callis and Toll", () => {
    const root = new DOMParser().parseFromString(callisAndTollArmyInfo, 'text/xml').documentElement;
    const companions = parseCompanionUnits(root, 'Callis and Toll');
    expect(companions).toContain("Toll's Companions");
  });

  it("return Callis and Toll for Toll's Companions", () => {
    const root = new DOMParser().parseFromString(callisAndTollArmyInfo, 'text/xml').documentElement;
    const companions = parseCompanionUnits(root, "Toll's Companions");
    expect(companions).toContain('Callis and Toll');
  });

  it('rabble-rowza and skitterstrand are not companions', () => {
    const root = new DOMParser().parseFromString(
      rabblerowzaAndSkitterstrandArmyInfo,
      'text/xml'
    ).documentElement;
    const companions = parseCompanionUnits(root, 'Rabble-Rowza');
    expect(companions).not.toContain('Skitterstrand Arachnarok');
  });

  it('neave blacktalon', () => {
    const root = new DOMParser().parseFromString(neaveArmyInfo, 'text/xml').documentElement;
    const companions = parseCompanionUnits(root, 'Neave Blacktalon');
    expect(companions).toContain('Lorai, Child of the Abyss');
    expect(companions).toContain(`Neave's Companions`);
    // doesn't have itself as companion
    expect(companions).not.toContain('Neave Blacktalon');

    const loraiCompanions = parseCompanionUnits(root, 'Lorai, Child of the Abyss');
    expect(loraiCompanions).toContain('Neave Blacktalon');
    expect(loraiCompanions).toContain(`Neave's Companions`);
    // doesn't have itself as companion
    expect(loraiCompanions).not.toContain('Lorai, Child of the Abyss');

    const neaveCompanionsCompanions = parseCompanionUnits(root, `Neave's Companions`);
    expect(neaveCompanionsCompanions).toContain('Lorai, Child of the Abyss');
    expect(neaveCompanionsCompanions).toContain('Neave Blacktalon');
    expect(neaveCompanionsCompanions).not.toContain(`Neave's Companions`);
  });

  it('oathsworn kin', () => {
    const root = new DOMParser().parseFromString(oathswordKinArmyInfo, 'text/xml').documentElement;
    const companions = parseCompanionUnits(root, 'The Oathsworn Kin');
    expect(companions).toContain('Singri Brand');
    expect(companions).toContain('Gunnar Brand');
    expect(companions).not.toContain('The Oathsworn Kin');

    const singriCompanions = parseCompanionUnits(root, 'Singri Brand');
    expect(singriCompanions).toContain('The Oathsworn Kin');
    expect(singriCompanions).toContain('Gunnar Brand');
    expect(singriCompanions).not.toContain('Singri Brand');

    const gunnarCompanions = parseCompanionUnits(root, 'Gunnar Brand');
    expect(gunnarCompanions).toContain('The Oathsworn Kin');
    expect(gunnarCompanions).toContain('Singri Brand');
    expect(gunnarCompanions).not.toContain('Gunnar Brand');
  });
});
