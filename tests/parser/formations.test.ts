import { describe, it, expect } from 'vitest';
import { DOMParser } from 'xmldom';
import { parseBattleFormations } from '../../src/parser/formations';

describe('parseBattleFormations', () => {
  it('parses formations and their abilities', () => {
    const xml = `
      <root>
        <selectionEntryGroup name="Battle Formations: Gloomspite Gitz">
          <selectionEntries>
            <selectionEntry type="upgrade" name="Squigalanche">
              <profiles>
                <profile name="Bouncing Fury" typeName="Ability (Passive)">
                  <characteristics>
                    <characteristic name="Keywords" />
                    <characteristic name="Effect">Each time a friendly **^^Squig^^** unit charges, add 1 to the Attacks characteristic of its **Fang-filled Gobs**, **Massive Fang-filled Gobs** or **Huge Fang-filled Gobs** for the rest of the turn.</characteristic>
                  </characteristics>
                  <attributes>
                    <attribute name="Color">Red</attribute>
                    <attribute name="Type">Offensive</attribute>
                  </attributes>
                </profile>
              </profiles>
            </selectionEntry>
            <selectionEntry type="upgrade" name="Moonclan Ambush">
              <profiles>
                <profile name="Ambush Tactics" typeName="Ability (Passive)">
                  <characteristics>
                    <characteristic name="Keywords" />
                    <characteristic name="Effect">At the start of the first battle round, you can set up this unit anywhere on the battlefield more than 9'' from all enemy units.</characteristic>
                  </characteristics>
                  <attributes>
                    <attribute name="Color">Blue</attribute>
                    <attribute name="Type">Special</attribute>
                  </attributes>
                </profile>
              </profiles>
            </selectionEntry>
          </selectionEntries>
        </selectionEntryGroup>
      </root>
    `;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const formations = parseBattleFormations(root);

    expect(formations.size).toBe(2);
    expect(formations.get('Squigalanche')?.length).toBe(1);
    expect(formations.get('Moonclan Ambush')?.length).toBe(1);

    const squig = formations.get('Squigalanche')?.[0];
    expect(squig?.name).toBe('Bouncing Fury');
    expect(squig?.text).toContain('Squig');
    expect(squig?.color).toBe('Red');
    expect(squig?.type).toBe('Offensive');

    const ambush = formations.get('Moonclan Ambush')?.[0];
    expect(ambush?.name).toBe('Ambush Tactics');
    expect(ambush?.text).toContain('battlefield more than 9');
    expect(ambush?.color).toBe('Blue');
    expect(ambush?.type).toBe('Special');
  });
});
