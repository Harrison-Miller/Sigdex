import { describe, it, expect } from 'vitest';
import { DOMParser } from 'xmldom';
import { parseBattleTraits } from '../../src/parser/battletraits';

describe('parseBattleTraits', () => {
  it('parses battle traits and their abilities', () => {
    const xml = `
      <root>
        <selectionEntry type="upgrade" name="Battle Traits: Gloomspite Gitz">
          <profiles>
            <profile name="The Faces of the Bad Moon" typeName="Ability (Activated)">
              <characteristics>
                <characteristic name="Timing">Once Per Battle Round (Army), Start of Battle Round</characteristic>
                <characteristic name="Declare">You must use this ability at the start of the battle round. If multiple players are commanding a Gloomspite Gitz army, then instead, at the start of the battle round, those players roll off and only the winner declares and uses this ability this battle round.</characteristic>
                <characteristic name="Effect">If it is the first battle round, pick the starting face of the Bad Moon (**Grinnin'**, **Scowlin'**, **Sulkin'** **Cacklin'**). If it is not the first battle round, the face of the Bad Moon moves to the next face in the sequence.</characteristic>
                <characteristic name="Keywords"/>
                <characteristic name="Used By"/>
              </characteristics>
              <attributes>
                <attribute name="Color"/>
                <attribute name="Type"/>
              </attributes>
            </profile>
            <profile name="Under the Light of the Bad Moon" typeName="Ability (Passive)">
              <characteristics>
                <characteristic name="Keywords"/>
                <characteristic name="Effect">During the battle, the effects below apply to friendly **^^Gloomspite Gitz^^** units based on the current face of the Bad Moon:
***Frothing Zealots:*** While the Bad Moon is **Cacklin'** or **Grinnin'**, add 5 to the control scores of friendly non-**^^Squig Moonclan^^** units.
***Spiderfang Venom:*** While the Bad Moon is **Cacklin'** or **Grinnin'**, combat attacks made by friendly **^^Spiderfang^^** units score critical hits on unmodified hit rolls of 5+. This ability also affects **Companion** weapons.
***Moonlit Hide:*** While the Bad Moon is **Grinnin'** or **Scowlin'**, subtract 1 from the Rend characteristic of combat attacks that target friendly **^^Troggoth^^** units.
***Lunar Squigs:*** While the Bad Moon is **Scowlin'** or **Sulkin'**, instead of rolling the dice to determine the Move characteristic of a friendly **^^Squig^^** unit, you can use a value of 4.
***Sneaky Snarlfangs:*** While the Bad Moon is **Sulkin''** or **Cacklin''**, friendly **^^Gitmob^^** units can use **^^Charge^^** and **^^Shoot^^** abilities even if they used a **^^Retreat^^** ability in the same turn.</characteristic>
              </characteristics>
              <attributes>
                <attribute name="Color">Black</attribute>
                <attribute name="Type">Special</attribute>
              </attributes>
            </profile>
          </profiles>
        </selectionEntry>
      </root>
    `;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const traits = parseBattleTraits(root);

    expect(traits.length).toBe(2);
    expect(traits[0].name).toBe('The Faces of the Bad Moon');
    expect(traits[0].text).toContain('If it is the first battle round');
    expect(traits[1].name).toBe('Under the Light of the Bad Moon');
    expect(traits[1].text).toContain('During the battle, the effects below apply');
    expect(traits[1].color).toBe('Black');
    expect(traits[1].type).toBe('Special');
  });
});
