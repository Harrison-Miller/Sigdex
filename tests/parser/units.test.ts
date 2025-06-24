import { describe, it, expect } from 'vitest';
import { DOMParser } from 'xmldom';
import { parseUnits } from '../../src/parser/units';

describe('parseUnits', () => {
  it('real', () => {
    const xml = `<selectionEntries>
		<selectionEntry type="unit" import="true" name="Loonboss" hidden="false" id="ab7d-16d4-876a-3066" publicationId="a395-7bc4-71eb-46df">
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
  </selectionEntry>
</selectionEntries>
  `;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const units = parseUnits(root, null, new Map([['Loonboss', 90]]));

    expect(units.length).toBe(1);
    expect(units[0].name).toBe('Loonboss');
    expect(units[0].stats.move).toBe('5"');
    expect(units[0].stats.health).toBe(5);
    expect(units[0].stats.save).toBe('4+');
    expect(units[0].stats.control).toBe('2');
    expect(units[0].abilities.length).toBe(2);
    expect(units[0].abilities[0].name).toBe("I'm da Boss");
    expect(units[0].abilities[0].timing).toBe('Your Hero Phase');
    expect(units[0].abilities[0].color).toBe('Yellow');
    expect(units[0].abilities[0].type).toBe('Special');
    expect(units[0].abilities[0].text).toContain('Roll a dice. On a 2+');
    expect(units[0].abilities[1].name).toBe("Let's Get Stabbin'!");
    expect(units[0].abilities[1].timing).toBe(
      'Reaction: You declared a **^^Fight^^** ability for this unit'
    );
    expect(units[0].abilities[1].color).toBe('Red');
    expect(units[0].abilities[1].type).toBe('Offensive');
    expect(units[0].abilities[1].text).toContain(
      'Pick a friendly non-**^^Hero Moonclan Infantry^^** unit that has not used a Fight ability this turn and is within this unit’s combat range to be the target. The target can be picked to use a **^^Fight ability immediately after the **^^Fight^^** ability used by this unit has been resolved.'
    );
    expect(units[0].keywords).toEqual([
      'HERO',
      'DESTRUCTION',
      'GLOOMSPITE GITZ',
      'INFANTRY',
      'MOONCLAN',
      'WARD (6+)',
    ]);
    expect(units[0].melee_weapons.length).toBe(1);
    expect(units[0].melee_weapons[0].name).toBe('Moon-slicer');
    expect(units[0].melee_weapons[0].attacks).toBe('5');
    expect(units[0].melee_weapons[0].hit).toBe('4+');
    expect(units[0].melee_weapons[0].wound).toBe('4+');
    expect(units[0].melee_weapons[0].rend).toBe('1');
    expect(units[0].melee_weapons[0].damage).toBe('D3');
    expect(units[0].category).toBe('Hero');
    expect(units[0].points).toBe(90);
    expect(units[0].unit_size).toBe(1); // Should parse unit size from model constraint
  });

  it('multiple simple units', () => {
    const xml = `<selectionEntries>
		<selectionEntry type="unit" import="true" name="Unit 1" hidden="false" id="unit-1">
			<profiles>
				<profile name="Unit 1" typeId="unit-type-1" typeName="Unit" hidden="false" id="profile-1">
					<characteristics>
						<characteristic name="Move" typeId="move-type-1">6"</characteristic>
						<characteristic name="Health" typeId="health-type-1">4</characteristic>
						<characteristic name="Save" typeId="save-type-1">3+</characteristic>
						<characteristic name="Control" typeId="control-type-1">1</characteristic>
					</characteristics>
				</profile>
			</profiles>
			<categoryLinks>
				<categoryLink name="HERO" hidden="false" id="cat-hero-1" targetId="hero-target-1"/>
			</categoryLinks>
		</selectionEntry>
		<selectionEntry type="unit" import="true" name="Unit 2" hidden="false" id="unit-2">
			<profiles>
				<profile name="Unit 2" typeId="unit-type-2" typeName="Unit" hidden="false" id="profile-2">
					<characteristics>
						<characteristic name="Move" typeId="move-type-2">5"</characteristic>
						<characteristic name="Health" typeId="health-type-2">6</characteristic>
						<characteristic name="Save" typeId="save-type-2">4+</characteristic>
						<characteristic name="Control" typeId="control-type-2">2</characteristic>
					</characteristics>
				</profile>
			</profiles>
			<categoryLinks>
				<categoryLink name="INFANTRY" hidden="false" id="cat-hero-1" targetId="hero-target-1"/>
			</categoryLinks>
		</selectionEntry>
		</selectionEntries>`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const units = parseUnits(
      root,
      null,
      new Map([
        ['Unit 1', 100],
        ['Unit 2', 150],
      ])
    );
    expect(units.length).toBe(2);
    expect(units[0].name).toBe('Unit 1');
    expect(units[0].stats.move).toBe('6"');
    expect(units[0].stats.health).toBe(4);
    expect(units[0].stats.save).toBe('3+');
    expect(units[0].stats.control).toBe('1');
    expect(units[0].category).toBe('Hero');
    expect(units[0].points).toBe(100);
    expect(units[0].unit_size).toBe(1);
    expect(units[1].name).toBe('Unit 2');
    expect(units[1].stats.move).toBe('5"');
    expect(units[1].stats.health).toBe(6);
    expect(units[1].stats.save).toBe('4+');
    expect(units[1].stats.control).toBe('2');
    expect(units[1].category).toBe('Infantry');
    expect(units[1].points).toBe(150);
    expect(units[1].unit_size).toBe(1);
  });

  it('filters other and legends categories', () => {
    const xml = `<selectionEntries>
		<selectionEntry type="unit" import="true" name="Unit 1" hidden="false" id="unit-1">
			<profiles>
				<profile name="Unit 1" typeId="unit-type-1" typeName="Unit" hidden="false" id="profile-1">
					<characteristics>
						<characteristic name="Move" typeId="move-type-1">6"</characteristic>
						<characteristic name="Health" typeId="health-type-1">4</characteristic>
						<characteristic name="Save" typeId="save-type-1">3+</characteristic>
					</characteristics>
				</profile>
			</profiles>
		</selectionEntry>
		<selectionEntry type="unit" import="true" name="Unit 2" hidden="false" id="unit-2">
			<profiles>
				<profile name="Unit 2" typeId="unit-type-2" typeName="Unit" hidden="false" id="profile-2">
					<characteristics>
						<characteristic name="Move" typeId="move-type-2">5"</characteristic>
						<characteristic name="Health" typeId="health-type-2">6</characteristic>
						<characteristic name="Save" typeId="save-type-2">4+</characteristic>
					</characteristics>
				</profile>
			</profiles>
			<categoryLinks>
				<categoryLink name="Hero" hidden="false" id="cat-legends-1" targetId="legends-target-1"/>
				<categoryLink name="Legends" hidden="false" id="cat-legends-1" targetId="legends-target-1"/>
			</categoryLinks>
		</selectionEntry>
		</selectionEntries>`;

    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const units = parseUnits(
      root,
      null,
      new Map([
        ['Unit 1', 100],
        ['Unit 2', 150],
      ])
    );

    expect(units.length).toBe(0); // Both units should be filtered out
  });

  it('unit with multiple model types sums unit_size', () => {
    const xml = `<selectionEntries>
      <selectionEntry type="unit" import="true" name="Squig Herd" hidden="false" id="herd-1">
        <profiles>
          <profile name="Squig Herd" typeId="herd-type-1" typeName="Unit" hidden="false" id="profile-herd-1">
            <characteristics>
              <characteristic name="Move" typeId="move-type-1">5"</characteristic>
              <characteristic name="Health" typeId="health-type-1">1</characteristic>
              <characteristic name="Save" typeId="save-type-1">6+</characteristic>
            </characteristics>
          </profile>
        </profiles>
        <categoryLinks>
          <categoryLink name="INFANTRY" hidden="false" id="cat-infantry-1" targetId="infantry-target-1"/>
        </categoryLinks>
        <selectionEntries>
          <selectionEntry type="model" import="true" name="Cave Squig" hidden="false" id="993c-6b16-e975-5321">
            <constraints>
              <constraint type="min" value="10" field="selections" scope="parent" shared="true" id="aeca-6ab9-f7e7-a274"/>
              <constraint type="max" value="10" field="selections" scope="parent" shared="true" id="f5d4-4736-23d1-e620"/>
            </constraints>
          </selectionEntry>
          <selectionEntry type="model" import="true" name="Squig Herder" hidden="false" id="46f0-b887-746b-3d92">
            <constraints>
              <constraint type="min" value="2" field="selections" scope="parent" shared="true" id="5e03-cd7b-ddf3-6130"/>
              <constraint type="max" value="2" field="selections" scope="parent" shared="true" id="781e-abd9-5cce-614f"/>
            </constraints>
          </selectionEntry>
        </selectionEntries>
      </selectionEntry>
    </selectionEntries>`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const units = parseUnits(root, null, new Map([['Squig Herd', 120]]));
    expect(units.length).toBe(1);
    expect(units[0].name).toBe('Squig Herd');
    expect(units[0].unit_size).toBe(12); // 10 Cave Squigs + 2 Herders
  });
});
