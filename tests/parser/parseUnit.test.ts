import { describe, expect, it } from 'vitest';
import { parseUnits } from '../../src/parser/parse/parseUnit';
import { IModel } from '../../src/parser/models/model';
import { xmlParser } from '../../src/parser/util';

describe('Unit Parser', () => {
  it.skip('should parse a unit correctly', () => {
    const xml = `<sharedSelectionEntries>
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
</sharedSelectionEntries>
  `;

    const rootNode = xmlParser().parse(xml);
    const units = parseUnits(rootNode);

    expect(units).toHaveLength(1);
    const loonboss = units[0];

    expect(loonboss.name).toBe('Loonboss');
    expect(loonboss.stats).toEqual({
      move: '5"',
      health: '5',
      save: '4+',
      control: '2',
      banishment: '',
      ward: '',
    });
    expect(loonboss.meleeWeapons).toHaveLength(1);
    expect(loonboss.meleeWeapons[0]).toEqual({
      name: 'Moon-slicer',
      attacks: '5',
      hit: '4+',
      wound: '4+',
      rend: '1',
      damage: 'D3',
      range: '',
      abilities: [],
    });
    expect(loonboss.rangedWeapons).toHaveLength(0);
    expect(loonboss.abilities).toHaveLength(2);
    expect(loonboss.abilities[0].name).toBe('I\'m da Boss');
    expect(loonboss.abilities[1].name).toBe('Let\'s Get Stabbin\'!');
    expect(loonboss.keywords).toEqual([
      'HERO',
      'DESTRUCTION',
      'GLOOMSPITE GITZ',
      'INFANTRY',
      'MOONCLAN',
      'WARD (6+)',
    ]);
    expect(loonboss.category).toBe('HERO');
    expect(loonboss.unitSize).toBe(1);
    expect(loonboss.models.size).toBe(1);
    const model = loonboss.models.values().next().value as IModel;
    expect(model.name).toBe('Loonboss');
    expect(model.count).toBe(1);
    expect(model.weapons).toHaveLength(1);
    expect(model.weapons.get('Moon-slicer')?.type).toBe('default');
    expect(loonboss.summoningSpell).toBeNull();
  });

  it.skip('multiple simple units', () => {
    const xml = `<sharedSelectionEntries>
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
		</sharedSelectionEntries>`;

    const rootNode = xmlParser().parse(xml);
    const units = parseUnits(rootNode);

    expect(units).toHaveLength(2);
    const unit1 = units[0];
    const unit2 = units[1];

    expect(unit1.name).toBe('Unit 1');
    expect(unit1.stats).toEqual({
      move: '6"',
      health: '4',
      save: '3+',
      control: '1',
      banishment: '',
      ward: '',
    });
    expect(unit1.keywords).toEqual(['HERO']);
    expect(unit1.category).toBe('HERO');

    expect(unit2.name).toBe('Unit 2');
    expect(unit2.stats).toEqual({
      move: '5"',
      health: '6',
      save: '4+',
      control: '2',
      banishment: '',
      ward: '',
    });
    expect(unit2.keywords).toEqual(['INFANTRY']);
    expect(unit2.category).toBe('INFANTRY');
  });
});
