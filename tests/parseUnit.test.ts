import { describe, expect, it } from 'vitest';
import { XMLParser } from 'fast-xml-parser';
import { parseUnit, parseUnits } from '../src/parser/parse/parseUnit';
import { IModel } from '../src/parser/models/model';
import { findAllByTagAndAttrs, xmlParser } from '../src/parser/util';

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
    expect(loonboss.abilities[0].name).toBe("I'm da Boss");
    expect(loonboss.abilities[1].name).toBe("Let's Get Stabbin'!");
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

  it.skip('arkanaut company', () => {
    const xml = `
    <selectionEntry type="unit" import="true" name="Arkanaut Company" hidden="false" id="a86c-b6ef-d754-bcb7" publicationId="d4a9-b568-9525-d6ac">
      <profiles>
        <profile name="Glory-seekers" typeId="907f-a48-6a04-f788" typeName="Ability (Passive)" hidden="false" id="3698-a64b-7f8c-c9">
          <characteristics>
            <characteristic name="Keywords" typeId="b977-7c5e-33b2-428e"/>
            <characteristic name="Effect" typeId="fd7f-888d-3257-a12b">
              <conditionGroups>
                <conditionGroup type="and">
                  <conditions>
                    <condition type="lessThan" value="1" field="selections" scope="force" childId="d1f3-921c-b403-1106" shared="true" includeChildSelections="true" includeChildForces="true"/>
                    <condition type="instanceOf" value="1" field="selections" scope="ancestor" childId="376a-6b97-8699-dd59" shared="true"/>
                  </conditions>
                </conditionGroup>
              </conditionGroups>
Add 1 to hit rolls for this unit’s attacks that target an enemy unit contesting an objective.            </characteristic>
          </characteristics>
          <attributes>
            <attribute name="Color" typeId="50fe-4f29-6bc3-dcc6">Red</attribute>
            <attribute name="Type" typeId="bf11-4e10-3ab1-06f4">Offensive</attribute>
          </attributes>
        </profile>
        <profile name="Arkanaut Company" typeId="ff03-376e-972f-8ab2" typeName="Unit" hidden="false" id="ed72-931f-515d-f61c">
          <characteristics>
            <characteristic name="Move" typeId="fed0-d1b3-1bb8-c501">4&quot;</characteristic>
            <characteristic name="Health" typeId="96be-54ae-ce7b-10b7">1</characteristic>
            <characteristic name="Save" typeId="1981-ef09-96f6-7aa9">4+</characteristic>
            <characteristic name="Control" typeId="6c6f-8510-9ce1-fc6e">1</characteristic>
          </characteristics>
        </profile>
      </profiles>
      <selectionEntries>
        <selectionEntry type="model" import="true" name="Arkanaut" hidden="false" id="1405-e236-56a-1625" defaultAmount="1,1,1,1,6" collective="false">
          <selectionEntries>
            <selectionEntry type="upgrade" import="true" name="Skypike" hidden="false" id="298a-76c-dfe5-be1d" defaultAmount="0,0,0,1,0">
              <profiles>
                <profile name="Skypike" typeId="9074-76b6-9e2f-81e3" typeName="Melee Weapon" hidden="false" id="2bb8-3c5d-8ec9-44e7">
                  <characteristics>
                    <characteristic name="Atk" typeId="60e-35aa-31ed-e488">2</characteristic>
                    <characteristic name="Hit" typeId="26dc-168-b2fd-cb93">3+</characteristic>
                    <characteristic name="Wnd" typeId="61c1-22cc-40af-2847">3+</characteristic>
                    <characteristic name="Rnd" typeId="eccc-10fa-6958-fb73">1</characteristic>
                    <characteristic name="Dmg" typeId="e948-9c71-12a6-6be4">2</characteristic>
                    <characteristic name="Ability" typeId="eda3-7332-5db1-4159">Crit (Mortal)</characteristic>
                  </characteristics>
                </profile>
              </profiles>
              <constraints>
                <constraint type="max" value="1" field="selections" scope="a86c-b6ef-d754-bcb7" shared="true" id="68b5-4f15-1826-24ef" includeChildSelections="true"/>
                <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="9ce1-6d17-66bb-29be"/>
              </constraints>
              <modifiers>
                <modifier type="increment" value="1" field="68b5-4f15-1826-24ef">
                  <repeats>
                    <repeat value="1" repeats="1" field="selections" scope="a86c-b6ef-d754-bcb7" childId="1b37-82b8-c062-eb82" shared="true" roundUp="false"/>
                  </repeats>
                </modifier>
                <modifier type="set" value="0" field="9ce1-6d17-66bb-29be">
                  <conditions>
                    <condition type="atLeast" value="1" field="selections" scope="parent" childId="9c21-1746-9873-a5b5" shared="true"/>
                  </conditions>
                </modifier>
              </modifiers>
            </selectionEntry>
            <selectionEntry type="upgrade" import="true" name="Privateer Pistol" hidden="false" id="c5c7-4206-4cd4-1b3d" defaultAmount="0,1,0,0,0">
              <profiles>
                <profile name="Privateer Pistol" typeId="1fd-a42f-41d3-fe05" typeName="Ranged Weapon" hidden="false" id="cb95-26e9-9a40-e303">
                  <characteristics>
                    <characteristic name="Rng" typeId="c6b5-908c-a604-1a98">10&quot;</characteristic>
                    <characteristic name="Atk" typeId="aa17-4296-2887-e05d">2</characteristic>
                    <characteristic name="Hit" typeId="194d-aeb6-5ba7-83b4">4+</characteristic>
                    <characteristic name="Wnd" typeId="d3d5-9dc6-13de-8d1">4+</characteristic>
                    <characteristic name="Rnd" typeId="d03f-a9ae-3eec-755">-</characteristic>
                    <characteristic name="Dmg" typeId="96c2-d0a5-ea1e-653b">1</characteristic>
                    <characteristic name="Ability" typeId="d793-3dd7-9c13-741e">Shoot in Combat</characteristic>
                  </characteristics>
                </profile>
              </profiles>
              <constraints>
                <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="4772-b200-d103-c856" automatic="true"/>
                <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="e5d5-fbee-b224-91" automatic="true"/>
              </constraints>
              <modifiers>
                <modifier type="set" value="true" field="hidden">
                  <conditionGroups>
                    <conditionGroup type="or">
                      <conditions>
                        <condition type="atLeast" value="1" field="selections" scope="parent" childId="298a-76c-dfe5-be1d" shared="true"/>
                        <condition type="atLeast" value="1" field="selections" scope="parent" childId="861e-cd2f-4c57-915e" shared="true"/>
                        <condition type="atLeast" value="1" field="selections" scope="parent" childId="7ec-816-de80-46c8" shared="true"/>
                      </conditions>
                    </conditionGroup>
                  </conditionGroups>
                </modifier>
                <modifier type="set" value="0" field="4772-b200-d103-c856">
                  <conditionGroups>
                    <conditionGroup type="or">
                      <conditions>
                        <condition type="atLeast" value="1" field="selections" scope="parent" childId="298a-76c-dfe5-be1d" shared="true"/>
                        <condition type="atLeast" value="1" field="selections" scope="parent" childId="861e-cd2f-4c57-915e" shared="true"/>
                        <condition type="atLeast" value="1" field="selections" scope="parent" childId="7ec-816-de80-46c8" shared="true"/>
                      </conditions>
                    </conditionGroup>
                  </conditionGroups>
                </modifier>
                <modifier type="set" value="0" field="e5d5-fbee-b224-91">
                  <conditionGroups>
                    <conditionGroup type="or">
                      <conditions>
                        <condition type="atLeast" value="1" field="selections" scope="parent" childId="298a-76c-dfe5-be1d" shared="true"/>
                        <condition type="atLeast" value="1" field="selections" scope="parent" childId="861e-cd2f-4c57-915e" shared="true"/>
                        <condition type="atLeast" value="1" field="selections" scope="parent" childId="7ec-816-de80-46c8" shared="true"/>
                      </conditions>
                    </conditionGroup>
                  </conditionGroups>
                </modifier>
              </modifiers>
            </selectionEntry>
            <selectionEntry type="upgrade" import="true" name="Arkanaut Hand Weapon" hidden="false" id="be42-735b-d8c0-72a" defaultAmount="0,1,0,0,0">
              <profiles>
                <profile name="Arkanaut Hand Weapon" typeId="9074-76b6-9e2f-81e3" typeName="Melee Weapon" hidden="false" id="f37a-2847-e073-c5e">
                  <characteristics>
                    <characteristic name="Atk" typeId="60e-35aa-31ed-e488">2</characteristic>
                    <characteristic name="Hit" typeId="26dc-168-b2fd-cb93">4+</characteristic>
                    <characteristic name="Wnd" typeId="61c1-22cc-40af-2847">4+</characteristic>
                    <characteristic name="Rnd" typeId="eccc-10fa-6958-fb73">-</characteristic>
                    <characteristic name="Dmg" typeId="e948-9c71-12a6-6be4">1</characteristic>
                    <characteristic name="Ability" typeId="eda3-7332-5db1-4159">-</characteristic>
                  </characteristics>
                </profile>
              </profiles>
              <constraints>
                <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="b917-eef9-9a-bcab" automatic="true"/>
                <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="706d-11b1-1994-f727" automatic="true"/>
              </constraints>
              <modifiers>
                <modifier type="set" value="true" field="hidden">
                  <conditions>
                    <condition type="atLeast" value="1" field="selections" scope="parent" childId="298a-76c-dfe5-be1d" shared="true"/>
                  </conditions>
                </modifier>
                <modifier type="set" value="0" field="b917-eef9-9a-bcab">
                  <conditions>
                    <condition type="atLeast" value="1" field="selections" scope="parent" childId="298a-76c-dfe5-be1d" shared="true"/>
                  </conditions>
                </modifier>
                <modifier type="set" value="0" field="706d-11b1-1994-f727">
                  <conditions>
                    <condition type="atLeast" value="1" field="selections" scope="parent" childId="298a-76c-dfe5-be1d" shared="true"/>
                  </conditions>
                </modifier>
              </modifiers>
            </selectionEntry>
            <selectionEntry type="upgrade" import="true" name="Aethermatic Volley Gun" hidden="false" id="861e-cd2f-4c57-915e" defaultAmount="0,1,0,0,0">
              <profiles>
                <profile name="Aethermatic Volley Gun" typeId="1fd-a42f-41d3-fe05" typeName="Ranged Weapon" hidden="false" id="ce90-eeb2-34e6-ee54">
                  <characteristics>
                    <characteristic name="Rng" typeId="c6b5-908c-a604-1a98">15&quot;</characteristic>
                    <characteristic name="Atk" typeId="aa17-4296-2887-e05d">2D6</characteristic>
                    <characteristic name="Hit" typeId="194d-aeb6-5ba7-83b4">4+</characteristic>
                    <characteristic name="Wnd" typeId="d3d5-9dc6-13de-8d1">4+</characteristic>
                    <characteristic name="Rnd" typeId="d03f-a9ae-3eec-755">-</characteristic>
                    <characteristic name="Dmg" typeId="96c2-d0a5-ea1e-653b">1</characteristic>
                    <characteristic name="Ability" typeId="d793-3dd7-9c13-741e">Crit (2 Hits)</characteristic>
                  </characteristics>
                </profile>
              </profiles>
              <constraints>
                <constraint type="max" value="1" field="selections" scope="a86c-b6ef-d754-bcb7" shared="true" id="c9d4-59fa-6405-fded" includeChildSelections="true"/>
                <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="116c-555c-d3b4-e7e1"/>
              </constraints>
              <modifiers>
                <modifier type="increment" value="1" field="c9d4-59fa-6405-fded">
                  <repeats>
                    <repeat value="1" repeats="1" field="selections" scope="a86c-b6ef-d754-bcb7" childId="1b37-82b8-c062-eb82" shared="true" roundUp="false"/>
                  </repeats>
                </modifier>
                <modifier type="set" value="0" field="116c-555c-d3b4-e7e1">
                  <conditions>
                    <condition type="atLeast" value="1" field="selections" scope="parent" childId="9c21-1746-9873-a5b5" shared="true"/>
                  </conditions>
                </modifier>
              </modifiers>
            </selectionEntry>
            <selectionEntry type="upgrade" import="true" name="Light Skyhook" hidden="false" id="7ec-816-de80-46c8" defaultAmount="0,0,1,0,0">
              <profiles>
                <profile name="Light Skyhook" typeId="1fd-a42f-41d3-fe05" typeName="Ranged Weapon" hidden="false" id="ceb2-ffee-ab4c-bbca">
                  <characteristics>
                    <characteristic name="Rng" typeId="c6b5-908c-a604-1a98">15&quot;</characteristic>
                    <characteristic name="Atk" typeId="aa17-4296-2887-e05d">1</characteristic>
                    <characteristic name="Hit" typeId="194d-aeb6-5ba7-83b4">4+</characteristic>
                    <characteristic name="Wnd" typeId="d3d5-9dc6-13de-8d1">3+</characteristic>
                    <characteristic name="Rnd" typeId="d03f-a9ae-3eec-755">2</characteristic>
                    <characteristic name="Dmg" typeId="96c2-d0a5-ea1e-653b">D3</characteristic>
                    <characteristic name="Ability" typeId="d793-3dd7-9c13-741e">Anti-**^^Monster^^** (+1 Rend)</characteristic>
                  </characteristics>
                </profile>
              </profiles>
              <constraints>
                <constraint type="max" value="1" field="selections" scope="a86c-b6ef-d754-bcb7" shared="true" id="db6e-935a-fa76-d0c7" includeChildSelections="true"/>
                <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="8200-c6a-9af9-29ee"/>
              </constraints>
              <modifiers>
                <modifier type="increment" value="1" field="db6e-935a-fa76-d0c7">
                  <repeats>
                    <repeat value="1" repeats="1" field="selections" scope="a86c-b6ef-d754-bcb7" childId="1b37-82b8-c062-eb82" shared="true" roundUp="false"/>
                  </repeats>
                </modifier>
                <modifier type="set" value="0" field="8200-c6a-9af9-29ee">
                  <conditions>
                    <condition type="atLeast" value="1" field="selections" scope="parent" childId="9c21-1746-9873-a5b5" shared="true"/>
                  </conditions>
                </modifier>
              </modifiers>
            </selectionEntry>
          </selectionEntries>
          <constraints>
            <constraint type="min" value="10" field="selections" scope="parent" shared="true" id="668a-9f04-3686-f7f4"/>
            <constraint type="max" value="10" field="selections" scope="parent" shared="true" id="a136-9c35-2a45-6900"/>
          </constraints>
          <modifiers>
            <modifier type="increment" value="10" field="668a-9f04-3686-f7f4">
              <repeats>
                <repeat value="1" repeats="1" field="selections" scope="root-entry" childId="1b37-82b8-c062-eb82" shared="true" roundUp="false"/>
              </repeats>
            </modifier>
            <modifier type="increment" value="10" field="a136-9c35-2a45-6900">
              <repeats>
                <repeat value="1" repeats="1" field="selections" scope="root-entry" childId="1b37-82b8-c062-eb82" shared="true" roundUp="false"/>
              </repeats>
            </modifier>
          </modifiers>
          <selectionEntryGroups>
            <selectionEntryGroup name="Command Models" id="b3e6-89bb-1c1f-4264" hidden="false">
              <constraints>
                <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="dfe-cb6f-c9fa-2e38" includeChildSelections="false"/>
              </constraints>
              <entryLinks>
                <entryLink import="true" name="Champion" hidden="false" id="d072-2e07-7bbc-a7ed" type="selectionEntry" targetId="9c21-1746-9873-a5b5" defaultAmount="1,0,0,0,0">
                  <constraints>
                    <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="a132-7d36-68a2-54df"/>
                    <constraint type="max" value="1" field="selections" scope="a86c-b6ef-d754-bcb7" shared="true" id="6718-fc96-f786-b3de" includeChildSelections="true"/>
                  </constraints>
                </entryLink>
              </entryLinks>
            </selectionEntryGroup>
          </selectionEntryGroups>
        </selectionEntry>
      </selectionEntries>
      <categoryLinks>
        <categoryLink name="CHAMPION" hidden="false" id="9342-889b-dca5-9d22" targetId="f679-3bcb-d664-9ac3" primary="false"/>
        <categoryLink name="INFANTRY" hidden="false" id="240-5413-3e6-2158" targetId="75d6-6995-dfcc-3898" primary="true"/>
        <categoryLink name="ORDER" hidden="false" id="a1a0-96c9-7c0-9e0d" targetId="ee22-3575-6590-25c" primary="false"/>
        <categoryLink name="KHARADRON OVERLORDS" hidden="false" id="5173-e8aa-6cd5-b46f" targetId="9c8d-276-b7d2-f1fd" primary="false"/>
        <categoryLink name="DUARDIN" hidden="false" id="af0-9e42-523c-9a12" targetId="72e3-7b1b-cb94-4cbd" primary="false"/>
        <categoryLink name="SKYFARER" hidden="false" id="6c88-2b22-f3eb-40e8" targetId="e13e-4c7c-54fd-908" primary="false"/>
      </categoryLinks>
    </selectionEntry>`;

    const rootNode = xmlParser().parse(xml);
    const unit = parseUnit(rootNode.selectionEntry[0]);
    console.log(unit);
  });

  it.skip('kragnos', () => {
    const xml = `
    <selectionEntry type="unit" import="true" name="Kragnos, the End of Empires" hidden="false" id="2a45-46b2-62f9-63cc" publicationId="2d6e-3ea2-52fe-a38">
      <entryLinks>
        <entryLink import="true" name="General" hidden="false" id="5427-bdbf-a3d1-34ba" type="selectionEntry" targetId="a56b-952e-ad15-7868"/>
      </entryLinks>
      <profiles>
        <profile name="Kragnos, the End of Empires" typeId="ff03-376e-972f-8ab2" typeName="Unit" hidden="false" id="d49a-ca03-104-c44b">
          <characteristics>
            <characteristic name="Move" typeId="fed0-d1b3-1bb8-c501">10&quot;</characteristic>
            <characteristic name="Health" typeId="96be-54ae-ce7b-10b7">18</characteristic>
            <characteristic name="Save" typeId="1981-ef09-96f6-7aa9">4+</characteristic>
            <characteristic name="Control" typeId="6c6f-8510-9ce1-fc6e">15</characteristic>
          </characteristics>
        </profile>
        <profile name="Battle Damaged" typeId="907f-a48-6a04-f788" typeName="Ability (Passive)" hidden="false" id="d590-353e-2fe2-e54d">
          <characteristics>
            <characteristic name="Keywords" typeId="b977-7c5e-33b2-428e"/>
            <characteristic name="Effect" typeId="fd7f-888d-3257-a12b">While this unit has 10 or more damage points, the Attacks characteristic of **The Dread Mace** is 4 and this unit has a Control characteristic of 10.</characteristic>
          </characteristics>
          <attributes>
            <attribute name="Color" typeId="50fe-4f29-6bc3-dcc6">Black</attribute>
            <attribute name="Type" typeId="bf11-4e10-3ab1-06f4">Damage</attribute>
          </attributes>
        </profile>
        <profile name="Avatar of Destruction" typeId="907f-a48-6a04-f788" typeName="Ability (Passive)" hidden="false" id="1682-108e-330e-4da0">
          <characteristics>
            <characteristic name="Keywords" typeId="b977-7c5e-33b2-428e"/>
            <characteristic name="Effect" typeId="fd7f-888d-3257-a12b">If this unit would be automatically destroyed, it is not automatically destroyed. Instead, allocate 6 damage points to it (ward rolls cannot be made for those damage points).</characteristic>
          </characteristics>
          <attributes>
            <attribute name="Color" typeId="50fe-4f29-6bc3-dcc6">Green</attribute>
            <attribute name="Type" typeId="bf11-4e10-3ab1-06f4">Defensive</attribute>
          </attributes>
        </profile>
        <profile name="Rampaging Destruction" typeId="59b6-d47a-a68a-5dcc" typeName="Ability (Activated)" hidden="false" id="1295-7f6e-c910-5c9d">
          <characteristics>
            <characteristic name="Timing" typeId="652c-3d84-4e7-14f4">Once Per Turn (Army), Any Charge Phase</characteristic>
            <characteristic name="Declare" typeId="bad3-f9c5-ba46-18cb"/>
            <characteristic name="Effect" typeId="b6f1-ba36-6cd-3b03">If this unit charged this phase, pick 1 of the following effects:
• Roll a dice for each enemy unit within 1&quot; of this unit. On a 2+, inflict an amount of mortal damage on that unit equal to the roll.
• Pick an enemy **^^Monster^^** in combat with this unit and roll 2D6. On a 7, this ability has no effect. Otherwise, inflict an amount of mortal damage on that unit equal to the results on the dice used for the 2D6 roll multiplied together. For example, a 2D6 roll of 2 and 6 would inflict 12 mortal damage (2 × 6).</characteristic>
            <characteristic name="Keywords" typeId="12e8-3214-7d8f-1d0f">**^^Rampage^^**</characteristic>
            <characteristic name="Used By" typeId="1b32-c9d6-3106-166b"/>
          </characteristics>
          <attributes>
            <attribute name="Color" typeId="5a11-eab3-180c-ddf5">Orange</attribute>
            <attribute name="Type" typeId="6d16-c86b-2698-85a4">Offensive</attribute>
          </attributes>
        </profile>
        <profile name="The End of Empires" typeId="907f-a48-6a04-f788" typeName="Ability (Passive)" hidden="false" id="e5b8-2d37-259d-87a6">
          <characteristics>
            <characteristic name="Keywords" typeId="b977-7c5e-33b2-428e"/>
            <characteristic name="Effect" typeId="fd7f-888d-3257-a12b">Add 1 to the number of dice rolled when making charge rolls for friendly **^^Destruction^^** units while they are wholly within 12&quot; of this unit, to a maximum of 3.</characteristic>
          </characteristics>
          <attributes>
            <attribute name="Color" typeId="50fe-4f29-6bc3-dcc6">Orange</attribute>
            <attribute name="Type" typeId="bf11-4e10-3ab1-06f4">Movement</attribute>
          </attributes>
        </profile>
        <profile name="The Shield Inviolate" typeId="59b6-d47a-a68a-5dcc" typeName="Ability (Activated)" hidden="false" id="ec2f-e8e-94ff-9aa0">
          <characteristics>
            <characteristic name="Timing" typeId="652c-3d84-4e7-14f4">Reaction: Opponent declared a **^^Spell^^** ability</characteristic>
            <characteristic name="Declare" typeId="bad3-f9c5-ba46-18cb"/>
            <characteristic name="Effect" typeId="b6f1-ba36-6cd-3b03">If this unit was picked to be the target of that spell, roll a dice. On a 3+, ignore the effect of that spell on this unit. This unit can use this ability more than once per phase but only once per **^^Spell^^** ability.</characteristic>
            <characteristic name="Keywords" typeId="12e8-3214-7d8f-1d0f"/>
            <characteristic name="Used By" typeId="1b32-c9d6-3106-166b"/>
          </characteristics>
          <attributes>
            <attribute name="Color" typeId="5a11-eab3-180c-ddf5">Yellow</attribute>
            <attribute name="Type" typeId="6d16-c86b-2698-85a4">Defensive</attribute>
          </attributes>
        </profile>
      </profiles>
      <categoryLinks>
        <categoryLink name="HERO" hidden="false" id="7a34-725e-42e8-922" targetId="6e72-1656-d554-528a" primary="true"/>
        <categoryLink name="UNIQUE" hidden="false" id="8955-a516-3ebb-6075" targetId="72ce-2188-70bf-2dbd" primary="false"/>
        <categoryLink name="MONSTER" hidden="false" id="d385-837e-6d4b-80f5" targetId="6d54-625c-d063-13e2" primary="false"/>
        <categoryLink name="WARMASTER" hidden="false" id="66e8-3f8a-2859-5c64" targetId="c203-51a0-3d44-6b07" primary="false"/>
        <categoryLink name="WARD (5+)" hidden="false" id="b25c-748c-5146-8911" targetId="52cc-95fd-6cd3-8f72" primary="false"/>
        <categoryLink name="DESTRUCTION" hidden="false" id="3d33-a90f-6afc-ef4" targetId="9057-5a29-dda5-3c28" primary="false"/>
        <categoryLink name="IRONJAWZ" hidden="false" id="57e2-ea9a-84e4-4b1e" targetId="c1ca-4b17-3512-89f" primary="false"/>
        <categoryLink name="KRULEBOYZ" hidden="false" id="67d0-b052-93ad-cc2d" targetId="6e42-3c75-4cb5-337a" primary="false"/>
      </categoryLinks>
      <constraints>
        <constraint type="max" value="1" field="selections" scope="roster" shared="true" id="24f3-4ea5-fadb-e364" includeChildSelections="true"/>
      </constraints>
      <selectionEntries>
        <selectionEntry type="model" import="true" name="Kragnos, the End of Empires" hidden="false" id="11bd-e956-ea84-5e76">
          <selectionEntries>
            <selectionEntry type="upgrade" import="true" name="The Dread Mace" hidden="false" id="59d8-824-dd81-4d9e">
              <profiles>
                <profile name="The Dread Mace" typeId="9074-76b6-9e2f-81e3" typeName="Melee Weapon" hidden="false" id="62cc-c03b-f390-ea56">
                  <characteristics>
                    <characteristic name="Atk" typeId="60e-35aa-31ed-e488">6</characteristic>
                    <characteristic name="Hit" typeId="26dc-168-b2fd-cb93">3+</characteristic>
                    <characteristic name="Wnd" typeId="61c1-22cc-40af-2847">2+</characteristic>
                    <characteristic name="Rnd" typeId="eccc-10fa-6958-fb73">3</characteristic>
                    <characteristic name="Dmg" typeId="e948-9c71-12a6-6be4">4</characteristic>
                    <characteristic name="Ability" typeId="eda3-7332-5db1-4159">-</characteristic>
                  </characteristics>
                </profile>
              </profiles>
              <constraints>
                <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="a1b4-6deb-deda-f3b0"/>
                <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="65fd-4d08-33df-96ec"/>
              </constraints>
            </selectionEntry>
            <selectionEntry type="upgrade" import="true" name="Tuskbreaker" hidden="false" id="ac7f-a30d-3a72-a496">
              <profiles>
                <profile name="Tuskbreaker" typeId="9074-76b6-9e2f-81e3" typeName="Melee Weapon" hidden="false" id="799e-d1d1-3f33-aa37">
                  <characteristics>
                    <characteristic name="Atk" typeId="60e-35aa-31ed-e488">3</characteristic>
                    <characteristic name="Hit" typeId="26dc-168-b2fd-cb93">4+</characteristic>
                    <characteristic name="Wnd" typeId="61c1-22cc-40af-2847">2+</characteristic>
                    <characteristic name="Rnd" typeId="eccc-10fa-6958-fb73">2</characteristic>
                    <characteristic name="Dmg" typeId="e948-9c71-12a6-6be4">D3</characteristic>
                    <characteristic name="Ability" typeId="eda3-7332-5db1-4159">Crit (2 Hits)</characteristic>
                  </characteristics>
                </profile>
              </profiles>
              <constraints>
                <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="522e-6cec-d46-aa48"/>
                <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="b85a-e755-3d62-a31c"/>
              </constraints>
            </selectionEntry>
            <selectionEntry type="upgrade" import="true" name="Hooves of Wrack and Ruin" hidden="false" id="e41b-4676-aafd-cf28">
              <profiles>
                <profile name="Hooves of Wrack and Ruin" typeId="9074-76b6-9e2f-81e3" typeName="Melee Weapon" hidden="false" id="aab8-2038-53ff-1cd">
                  <characteristics>
                    <characteristic name="Atk" typeId="60e-35aa-31ed-e488">6</characteristic>
                    <characteristic name="Hit" typeId="26dc-168-b2fd-cb93">3+</characteristic>
                    <characteristic name="Wnd" typeId="61c1-22cc-40af-2847">2+</characteristic>
                    <characteristic name="Rnd" typeId="eccc-10fa-6958-fb73">1</characteristic>
                    <characteristic name="Dmg" typeId="e948-9c71-12a6-6be4">2</characteristic>
                    <characteristic name="Ability" typeId="eda3-7332-5db1-4159">-</characteristic>
                  </characteristics>
                </profile>
              </profiles>
              <constraints>
                <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="21a7-daf-c057-5d04"/>
                <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="3aeb-12b8-a3a8-25e"/>
              </constraints>
            </selectionEntry>
          </selectionEntries>
          <constraints>
            <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="315-d37a-4b10-4949"/>
            <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="1daf-16d-540c-79d7"/>
          </constraints>
        </selectionEntry>
      </selectionEntries>
    </selectionEntry>`;
    const rootNode = xmlParser().parse(xml);
    const unit = parseUnit(rootNode.selectionEntry[0]);
  });

  it('herdstone', () => {
    const xml = `
        <selectionEntry type="unit" import="true" name="Herdstone" hidden="false" id="dbf4-0d75-ee00-02a2" publicationId="3cc2-31d3-9dd2-f858">
      <categoryLinks>
        <categoryLink name="FACTION TERRAIN" hidden="false" id="937b-66b0-24fb-1451" targetId="cdd6-ffa1-9b32-4cb8" primary="true"/>
        <categoryLink name="CHAOS" hidden="false" id="4142-1caa-2116-85d7" targetId="319b-38ee-d10d-e800" primary="false"/>
        <categoryLink name="BEASTS OF CHAOS" hidden="false" id="4993-6688-1bed-9a52" targetId="e902-e0b8-b5ea-d527" primary="false"/>
      </categoryLinks>
      <profiles>
        <profile name="Entropic Lodestone" typeId="907f-a48-6a04-f788" typeName="Ability (Passive)" hidden="false" id="620d-c0ca-509c-b486">
          <characteristics>
            <characteristic name="Keywords" typeId="b977-7c5e-33b2-428e"/>
            <characteristic name="Effect" typeId="fd7f-888d-3257-a12b">From the second battle round onwards, add 1 to the Rend characteristic of melee weapons used by friendly **^^Beasts of Chaos^^** units while they are wholly within 24&quot; of this terrain feature.
If this terrain feature is wholly within 18&quot; of the centre of the battlefield, this ability affects all friendly **^^Beasts of Chaos^^** units on the battlefield instead of those wholly within 24&quot; of it.</characteristic>
          </characteristics>
          <attributes>
            <attribute name="Color" typeId="50fe-4f29-6bc3-dcc6">Red</attribute>
            <attribute name="Type" typeId="bf11-4e10-3ab1-06f4">Offensive</attribute>
          </attributes>
        </profile>
        <profile name="Herdstone" typeId="ff03-376e-972f-8ab2" typeName="Unit" hidden="false" id="b63f-a5f8-6a7d-2965">
          <characteristics>
            <characteristic name="Move" typeId="fed0-d1b3-1bb8-c501">-</characteristic>
            <characteristic name="Health" typeId="96be-54ae-ce7b-10b7">14</characteristic>
            <characteristic name="Save" typeId="1981-ef09-96f6-7aa9">4+</characteristic>
            <characteristic name="Control" typeId="6c6f-8510-9ce1-fc6e">-</characteristic>
          </characteristics>
        </profile>
      </profiles>
      <rules>
        <rule name="Herdstone" id="f8b6-6115-e758-765e" hidden="false">
          <description>**The following universal terrain abilities apply to this terrain feature (Terrain, 1.2):
Cover, Unstable**</description>
        </rule>
      </rules>
    </selectionEntry>`;
    const rootNode = xmlParser().parse(xml);
    const unit = parseUnit(rootNode.selectionEntry[0]);
  });
});
