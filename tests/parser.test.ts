import { describe, it, expect } from 'vitest';
import { parseUnit, parseUnits } from '../src/parser';

const xml = `<selectionEntry type="unit" import="true" name="Loonboss" hidden="false" id="ab7d-16d4-876a-3066" publicationId="a395-7bc4-71eb-46df">
  <entryLinks>
    <entryLink import="true" name="General" hidden="false" id="7929-5cc5-8d09-ce0e" type="selectionEntry" targetId="a56b-952e-ad15-7868"/>
  </entryLinks>
  <profiles>
    <profile name="Loonboss" typeId="ff03-376e-972f-8ab2" typeName="Unit" hidden="false" id="47fb-b03c-cebe-d52a">
      <characteristics>
        <characteristic name="Move" typeId="fed0-d1b3-1bb8-c501">5"</characteristic>
        <characteristic name="Health" typeId="96be-54ae-ce7b-10b7">5</characteristic>
        <characteristic name="Save" typeId="1981-ef09-96f6-7aa9">4+</characteristic>
        <characteristic name="Control" typeId="6c6f-8510-9ce1-fc6e">2</characteristic>
      </characteristics>
    </profile>
    <profile name="I'm da Boss" typeId="59b6-d47a-a68a-5dcc" typeName="Ability (Activated)" hidden="false" id="ed65-f50f-1f58-fb2d">
      <characteristics>
        <characteristic name="Timing" typeId="652c-3d84-4e7-14f4">Your Hero Phase</characteristic>
        <characteristic name="Declare" typeId="bad3-f9c5-ba46-18cb">Pick a visible friendly **Moonclan Stabbas** unit wholly within 12" of this unit to be the target.</characteristic>
        <characteristic name="Effect" typeId="b6f1-ba36-6cd-3b03">Roll a dice. On a 2+, pick one of the following effects:
***Get Back ’Ere!:*** If the target is not in combat, you can return D6 slain models to it.
***Stab ’Em Good!:*** Add 1 to wound rolls for the target’s attacks until the start of your next turn</characteristic>
        <characteristic name="Keywords" typeId="12e8-3214-7d8f-1d0f"/>
        <characteristic name="Used By" typeId="1b32-c9d6-3106-166b"/>
      </characteristics>
      <attributes>
        <attribute typeId="5a11-eab3-180c-ddf5" name="Color">Yellow</attribute>
        <attribute typeId="6d16-c86b-2698-85a4" name="Type">Special</attribute>
      </attributes>
    </profile>
    <profile name="Let&apos;s Get Stabbin&apos;!" typeId="59b6-d47a-a68a-5dcc" typeName="Ability (Activated)" hidden="false" id="6c22-8d38-e581-596c">
      <characteristics>
        <characteristic name="Timing" typeId="652c-3d84-4e7-14f4">Reaction: You declared a **^^Fight^^** ability for this unit</characteristic>
        <characteristic name="Declare" typeId="bad3-f9c5-ba46-18cb"/>
        <characteristic name="Effect" typeId="b6f1-ba36-6cd-3b03">Pick a friendly non-**^^Hero Moonclan Infantry^^** unit that has not used a Fight ability this turn and is within this unit’s combat range to be the target. The target can be picked to use a **^^Fight ability immediately after the **^^Fight^^** ability used by this unit has been resolved.</characteristic>
        <characteristic name="Keywords" typeId="12e8-3214-7d8f-1d0f"/>
        <characteristic name="Used By" typeId="1b32-c9d6-3106-166b"/>
      </characteristics>
      <attributes>
        <attribute typeId="5a11-eab3-180c-ddf5" name="Color">Red</attribute>
        <attribute typeId="6d16-c86b-2698-85a4" name="Type">Offensive</attribute>
      </attributes>
    </profile>
  </profiles>
  <categoryLinks>
    <categoryLink name="HERO" hidden="false" id="cdd2-c97a-a719-4f9d" targetId="6e72-1656-d554-528a" primary="true"/>
    <categoryLink name="DESTRUCTION" hidden="false" id="e00e-59fb-6fce-ade8" targetId="9057-5a29-dda5-3c28" primary="false"/>
    <categoryLink name="GLOOMSPITE GITZ" hidden="false" id="5699-1592-722-187e" targetId="ce45-cc36-d92e-ef70" primary="false"/>
    <categoryLink name="INFANTRY" hidden="false" id="5002-c68-c810-afa5" targetId="75d6-6995-dfcc-3898" primary="false"/>
    <categoryLink name="MOONCLAN" hidden="false" id="a86d-b026-d1d0-fa97" targetId="76e8-7818-115c-6899" primary="false"/>
    <categoryLink name="WARD (6+)" hidden="false" id="5e76-9ac0-2080-1145" targetId="70a4-383f-421f-52cd" primary="false"/>
  </categoryLinks>
  <selectionEntries>
    <selectionEntry type="model" import="true" name="Loonboss" hidden="false" id="98a6-c1a1-31de-6e18">
      <selectionEntries>
        <selectionEntry type="upgrade" import="true" name="Moon-slicer" hidden="false" id="8ff-fffd-e90b-1aea">
          <profiles>
            <profile name="Moon-slicer" typeId="9074-76b6-9e2f-81e3" typeName="Melee Weapon" hidden="false" id="9adf-ff27-7afa-4956">
              <characteristics>
                <characteristic name="Atk" typeId="60e-35aa-31ed-e488">5</characteristic>
                <characteristic name="Hit" typeId="26dc-168-b2fd-cb93">4+</characteristic>
                <characteristic name="Wnd" typeId="61c1-22cc-40af-2847">4+</characteristic>
                <characteristic name="Rnd" typeId="eccc-10fa-6958-fb73">1</characteristic>
                <characteristic name="Dmg" typeId="e948-9c71-12a6-6be4">D3</characteristic>
                <characteristic name="Ability" typeId="eda3-7332-5db1-4159">-</characteristic>
              </characteristics>
            </profile>
          </profiles>
          <constraints>
            <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="6353-28f3-4b89-5155"/>
            <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="6313-77ff-d795-b4c9"/>
          </constraints>
        </selectionEntry>
      </selectionEntries>
      <constraints>
        <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="ec7f-a82-b5cd-d1ca"/>
        <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="8a5e-2169-e6d4-d821"/>
      </constraints>
    </selectionEntry>
  </selectionEntries>
</selectionEntry>`;

describe('parseUnit', () => {
  it('parses a unit from xml', () => {
    const unit = parseUnit(xml);
    expect(unit.name).toBe('Loonboss');
    expect(unit.stats.move).toBe('5"');
    expect(unit.stats.health).toBe(5);
    expect(unit.stats.save).toBe('4+');
    expect(unit.stats.control).toBe('2');
    expect(unit.abilities.length).toBe(2);
    expect(unit.abilities[0].color).toBe('Yellow');
    expect(unit.abilities[0].type).toBe('Special');
    expect(unit.abilities[0].timing).toBe('Your Hero Phase');
    expect(unit.abilities[0].text).toContain('Roll a dice. On a 2+');
    expect(unit.abilities[0].name).toBe("I'm da Boss");
    expect(unit.abilities[1].color).toBe('Red');
    expect(unit.abilities[1].type).toBe('Offensive');
    expect(unit.abilities[1].timing).toContain('Reaction:');
    expect(unit.abilities[1].text).toContain('Pick a friendly non-');
    expect(unit.abilities[1].name).toBe("Let's Get Stabbin'!");
    expect(unit.melee_weapons.length).toBe(1);
    expect(unit.melee_weapons[0].name).toBe('Moon-slicer');
    expect(unit.melee_weapons[0].attacks).toBe('5');
    expect(unit.melee_weapons[0].hit).toBe('4+');
    expect(unit.melee_weapons[0].wound).toBe('4+');
    expect(unit.melee_weapons[0].rend).toBe('1');
    expect(unit.melee_weapons[0].damage).toBe('D3');
    expect(unit.keywords).toContain('HERO');
    expect(unit.keywords).toContain('DESTRUCTION');
    expect(unit.keywords).toContain('GLOOMSPITE GITZ');
    expect(unit.keywords).toContain('INFANTRY');
    expect(unit.keywords).toContain('MOONCLAN');
    expect(unit.keywords).toContain('WARD (6+)');
  });
});

describe('parseUnits', () => {
  it('parses multiple units from catalogue xml', () => {
    const catalogueXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<catalogue>
  <sharedSelectionEntries>
    <selectionEntry type="unit" name="UnitA">
      <profiles>
        <profile typeName="Unit">
          <characteristics>
            <characteristic name="Move">6"</characteristic>
            <characteristic name="Health">4</characteristic>
            <characteristic name="Save">5+</characteristic>
          </characteristics>
        </profile>
      </profiles>
      <categoryLinks><categoryLink name="Hero" /></categoryLinks>
    </selectionEntry>
    <selectionEntry type="unit" name="UnitB">
      <profiles>
        <profile typeName="Unit">
          <characteristics>
            <characteristic name="Move">5"</characteristic>
            <characteristic name="Health">3</characteristic>
            <characteristic name="Save">6+</characteristic>
          </characteristics>
        </profile>
      </profiles>
      <categoryLinks><categoryLink name="Hero" /></categoryLinks>
    </selectionEntry>
  </sharedSelectionEntries>
</catalogue>`;
    const pointsMap = new Map<string, number>([
      ['UnitA', 120],
      ['UnitB', 80],
    ]);
    const units = parseUnits(catalogueXml, pointsMap);
    expect(units.length).toBe(2);
    expect(units[0].name).toBe('UnitA');
    expect(units[0].stats.move).toBe('6"');
    expect(units[0].stats.health).toBe(4);
    expect(units[0].stats.save).toBe('5+');
    expect(units[0].points).toBe(120);
    expect(units[1].name).toBe('UnitB');
    expect(units[1].stats.move).toBe('5"');
    expect(units[1].stats.health).toBe(3);
    expect(units[1].stats.save).toBe('6+');
    expect(units[1].points).toBe(80);
  });
});
