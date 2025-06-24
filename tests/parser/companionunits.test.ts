import { describe, it, expect } from 'vitest';
import { parseCompanionUnits } from '../../src/parser/companionunits';
import { DOMParser } from 'xmldom';
import { callisAndTollArmyInfo } from './callisandtoll';

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
});
