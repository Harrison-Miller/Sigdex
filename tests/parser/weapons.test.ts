import { describe, it, expect } from 'vitest';
import { DOMParser } from 'xmldom';
import { parseWeapons } from '../../src/parser/weapons';

describe('parseWeapons', () => {
  it('simple', () => {
    const xml = `
		<selectionEntry type="unit" name="AbilityGuy">
			<profiles>
				<profile name="Sword" typeName="Melee Weapon">
					<characteristics>
						<characteristic name="Atk">2</characteristic>
						<characteristic name="Hit">4+</characteristic>
						<characteristic name="Wnd">4+</characteristic>
						<characteristic name="Rnd">1</characteristic>
						<characteristic name="Dmg">1</characteristic>
					</characteristics>
				</profile>
			</profiles>
		</selectionEntry>
			`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const weapons = parseWeapons(root);
    expect(weapons.ranged_weapons.length).toBe(0);
    expect(weapons.melee_weapons.length).toBe(1);
    expect(weapons.melee_weapons[0].name).toBe('Sword');
    expect(weapons.melee_weapons[0].attacks).toBe('2');
    expect(weapons.melee_weapons[0].hit).toBe('4+');
    expect(weapons.melee_weapons[0].wound).toBe('4+');
    expect(weapons.melee_weapons[0].rend).toBe('1');
    expect(weapons.melee_weapons[0].damage).toBe('1');
    expect(weapons.melee_weapons[0].abilities).toEqual([]);
    expect(weapons.constraints).toBeUndefined();
  });

  it('with abilities', () => {
    const xml = `
		<selectionEntry type="unit" name="AbilityGuy">
			<profiles>
				<profile name="Sword" typeName="Melee Weapon">
					<characteristics>
						<characteristic name="Atk">2</characteristic>
						<characteristic name="Hit">4+</characteristic>
						<characteristic name="Wnd">4+</characteristic>
						<characteristic name="Rnd">1</characteristic>
						<characteristic name="Dmg">1</characteristic>
						<characteristic name="Ability">Crit Mortal,Sharp</characteristic>
					</characteristics>
				</profile>
			</profiles>
			<categoryLinks><categoryLink name="Hero" /></categoryLinks>
		</selectionEntry>
			`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const weapons = parseWeapons(root);
    expect(weapons.ranged_weapons.length).toBe(0);
    expect(weapons.melee_weapons.length).toBe(1);
    expect(weapons.melee_weapons[0].name).toBe('Sword');
    expect(weapons.melee_weapons[0].attacks).toBe('2');
    expect(weapons.melee_weapons[0].hit).toBe('4+');
    expect(weapons.melee_weapons[0].wound).toBe('4+');
    expect(weapons.melee_weapons[0].rend).toBe('1');
    expect(weapons.melee_weapons[0].damage).toBe('1');
    expect(weapons.melee_weapons[0].abilities.length).toBe(2);
    expect(weapons.melee_weapons[0].abilities).toContain('Crit Mortal');
    expect(weapons.melee_weapons[0].abilities).toContain('Sharp');
    expect(weapons.constraints).toBeUndefined();
  });

  it('multiple weapons of each type', () => {
    const xml = `
		<selectionEntry type="unit" name="WeaponGuy">
			<profiles>
				<profile name="Sword" typeName="Melee Weapon">
					<characteristics>
						<characteristic name="Atk">2</characteristic>
						<characteristic name="Hit">4+</characteristic>
						<characteristic name="Wnd">4+</characteristic>
						<characteristic name="Rnd">1</characteristic>
						<characteristic name="Dmg">1</characteristic>
					</characteristics>
				</profile>
				<profile name="Dagger" typeName="Melee Weapon">
					<characteristics>
						<characteristic name="Atk">1</characteristic>
						<characteristic name="Hit">3+</characteristic>
						<characteristic name="Wnd">3+</characteristic>
						<characteristic name="Rnd">1</characteristic>
						<characteristic name="Dmg">3</characteristic>
						<characteristic name="Ability">Extra Sharp</characteristic>
					</characteristics>
				</profile>
				<profile name="Bow" typeName="Ranged Weapon">
					<characteristics>
						<characteristic name="Atk">3</characteristic>
						<characteristic name="Hit">5+</characteristic>
						<characteristic name="Wnd">4+</characteristic>
						<characteristic name="Rnd">-</characteristic>
						<characteristic name="Dmg">1</characteristic>
					</characteristics>
				</profile>
				<profile name="Thrown Dagger" typeName="Ranged Weapon">
					<characteristics>
						<characteristic name="Atk">1</characteristic>
						<characteristic name="Hit">4+</characteristic>
						<characteristic name="Wnd">3+</characteristic>
						<characteristic name="Rnd">0</characteristic>
						<characteristic name="Dmg">2</characteristic>
						<characteristic name="Ability">Quick Throw</characteristic>
					</characteristics>
				</profile>
			</profiles>
			<categoryLinks><categoryLink name="Hero" /></categoryLinks>
		</selectionEntry>
			`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const weapons = parseWeapons(root);
    expect(weapons.ranged_weapons.length).toBe(2);
    expect(weapons.ranged_weapons[0].name).toBe('Bow');
    expect(weapons.ranged_weapons[0].attacks).toBe('3');
    expect(weapons.ranged_weapons[0].hit).toBe('5+');
    expect(weapons.ranged_weapons[0].wound).toBe('4+');
    expect(weapons.ranged_weapons[0].rend).toBe('-');
    expect(weapons.ranged_weapons[0].damage).toBe('1');
    expect(weapons.ranged_weapons[0].abilities).toEqual([]);
    expect(weapons.ranged_weapons[1].name).toBe('Thrown Dagger');
    expect(weapons.ranged_weapons[1].attacks).toBe('1');
    expect(weapons.ranged_weapons[1].hit).toBe('4+');
    expect(weapons.ranged_weapons[1].wound).toBe('3+');
    expect(weapons.ranged_weapons[1].rend).toBe('0');
    expect(weapons.ranged_weapons[1].damage).toBe('2');
    expect(weapons.ranged_weapons[1].abilities).toEqual(['Quick Throw']);
    expect(weapons.melee_weapons.length).toBe(2);
    expect(weapons.melee_weapons[0].name).toBe('Sword');
    expect(weapons.melee_weapons[0].attacks).toBe('2');
    expect(weapons.melee_weapons[0].hit).toBe('4+');
    expect(weapons.melee_weapons[0].wound).toBe('4+');
    expect(weapons.melee_weapons[0].rend).toBe('1');
    expect(weapons.melee_weapons[0].damage).toBe('1');
    expect(weapons.melee_weapons[0].abilities).toEqual([]);
    expect(weapons.melee_weapons[1].name).toBe('Dagger');
    expect(weapons.melee_weapons[1].attacks).toBe('1');
    expect(weapons.melee_weapons[1].hit).toBe('3+');
    expect(weapons.melee_weapons[1].wound).toBe('3+');
    expect(weapons.melee_weapons[1].rend).toBe('1');
    expect(weapons.melee_weapons[1].damage).toBe('3');
    expect(weapons.melee_weapons[1].abilities).toEqual(['Extra Sharp']);
    expect(weapons.constraints).toBeUndefined();
  });

  // Disabled do to issues with parsing one-in-x constraints
  // 	it('parses 1-in-x weapon constraints', () => {
  // 		const xml = `
  //     <selectionEntry type="unit" import="true" name="Liberators" hidden="false" id="e914-877f-21fe-8db9" publicationId="43cd-e9ef-5d4d-87c4">
  //       <profiles>
  //         <profile name="Stalwart Defenders" hidden="false" id="1cbc-55af-afbf-6165" typeId="907f-a48-6a04-f788" typeName="Ability (Passive)">
  //           <characteristics>
  //             <characteristic name="Keywords" typeId="b977-7c5e-33b2-428e"/>
  //             <characteristic name="Effect" typeId="fd7f-888d-3257-a12b">
  //               <conditionGroups>
  //                 <conditionGroup type="and">
  //                   <conditions>
  //                     <condition type="lessThan" value="1" field="selections" scope="force" childId="d1f3-921c-b403-1106" shared="true" includeChildSelections="true" includeChildForces="true"/>
  //                     <condition type="instanceOf" value="1" field="selections" scope="ancestor" childId="376a-6b97-8699-dd59" shared="true"/>
  //                   </conditions>
  //                 </conditionGroup>
  //               </conditionGroups>
  // Add 3 to this unit’s control score while it is contesting an objective wholly within friendly territory.            </characteristic>
  //           </characteristics>
  //           <attributes>
  //             <attribute typeId="50fe-4f29-6bc3-dcc6" name="Color">Purple</attribute>
  //             <attribute typeId="bf11-4e10-3ab1-06f4" name="Type">Control</attribute>
  //           </attributes>
  //         </profile>
  //         <profile name="Liberators" typeId="ff03-376e-972f-8ab2" typeName="Unit" hidden="false" id="3e33-7b80-46c2-4f10">
  //           <characteristics>
  //             <characteristic name="Move" typeId="fed0-d1b3-1bb8-c501">5&quot;</characteristic>
  //             <characteristic name="Health" typeId="96be-54ae-ce7b-10b7">2</characteristic>
  //             <characteristic name="Save" typeId="1981-ef09-96f6-7aa9">3+</characteristic>
  //             <characteristic name="Control" typeId="6c6f-8510-9ce1-fc6e">1</characteristic>
  //           </characteristics>
  //         </profile>
  //       </profiles>
  //       <selectionEntries>
  //         <selectionEntry type="model" import="true" name="Liberator" hidden="false" id="a99b-de08-aaa9-aaab" defaultAmount="1,1,3" collective="false">
  //           <selectionEntries>
  //             <selectionEntry type="upgrade" import="true" name="Grandhammer" hidden="false" id="cb82-f1ac-64a5-2230" defaultAmount="0,1,0">
  //               <profiles>
  //                 <profile name="Grandhammer" typeId="9074-76b6-9e2f-81e3" typeName="Melee Weapon" hidden="false" id="ecaf-cc7d-11ec-2b46">
  //                   <characteristics>
  //                     <characteristic name="Atk" typeId="60e-35aa-31ed-e488">2</characteristic>
  //                     <characteristic name="Hit" typeId="26dc-168-b2fd-cb93">3+</characteristic>
  //                     <characteristic name="Wnd" typeId="61c1-22cc-40af-2847">3+</characteristic>
  //                     <characteristic name="Rnd" typeId="eccc-10fa-6958-fb73">1</characteristic>
  //                     <characteristic name="Dmg" typeId="e948-9c71-12a6-6be4">2</characteristic>
  //                     <characteristic name="Ability" typeId="eda3-7332-5db1-4159">Crit (Mortal)</characteristic>
  //                   </characteristics>
  //                 </profile>
  //               </profiles>
  //               <constraints>
  //                 <constraint type="max" value="1" field="selections" scope="e914-877f-21fe-8db9" shared="true" id="22bb-17f4-4682-4a3a" includeChildSelections="true"/>
  //                 <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="e9a7-2d56-1d9e-f829"/>
  //               </constraints>
  //               <modifiers>
  //                 <modifier type="increment" value="1" field="22bb-17f4-4682-4a3a">
  //                   <repeats>
  //                     <repeat value="1" repeats="1" field="selections" scope="e914-877f-21fe-8db9" childId="1b37-82b8-c062-eb82" shared="true" roundUp="false"/>
  //                   </repeats>
  //                 </modifier>
  //                 <modifier type="set" value="0" field="e9a7-2d56-1d9e-f829">
  //                   <conditions>
  //                     <condition type="atLeast" value="1" field="selections" scope="parent" childId="9c21-1746-9873-a5b5" shared="true"/>
  //                   </conditions>
  //                 </modifier>
  //               </modifiers>
  //             </selectionEntry>
  //             <selectionEntry type="upgrade" import="true" name="Warhammer" hidden="false" id="314b-41b5-9068-e3c0" defaultAmount="0,1,1">
  //               <profiles>
  //                 <profile name="Warhammer" typeId="9074-76b6-9e2f-81e3" typeName="Melee Weapon" hidden="false" id="cd14-12bb-eb6f-a68a">
  //                   <characteristics>
  //                     <characteristic name="Atk" typeId="60e-35aa-31ed-e488">2</characteristic>
  //                     <characteristic name="Hit" typeId="26dc-168-b2fd-cb93">3+</characteristic>
  //                     <characteristic name="Wnd" typeId="61c1-22cc-40af-2847">3+</characteristic>
  //                     <characteristic name="Rnd" typeId="eccc-10fa-6958-fb73">1</characteristic>
  //                     <characteristic name="Dmg" typeId="e948-9c71-12a6-6be4">1</characteristic>
  //                     <characteristic name="Ability" typeId="eda3-7332-5db1-4159">Crit (Mortal)</characteristic>
  //                   </characteristics>
  //                 </profile>
  //               </profiles>
  //               <constraints>
  //                 <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="1ae0-5925-e62e-10d6-min" automatic="true"/>
  //                 <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="1ae0-5925-e62e-10d6-max" automatic="true"/>
  //               </constraints>
  //               <modifiers>
  //                 <modifier type="set" value="true" field="hidden">
  //                   <conditions>
  //                     <condition type="atLeast" value="1" field="selections" scope="parent" childId="cb82-f1ac-64a5-2230" shared="true"/>
  //                   </conditions>
  //                 </modifier>
  //                 <modifier type="set" value="0" field="1ae0-5925-e62e-10d6-min">
  //                   <conditions>
  //                     <condition type="atLeast" value="1" field="selections" scope="parent" childId="cb82-f1ac-64a5-2230" shared="true"/>
  //                   </conditions>
  //                 </modifier>
  //                 <modifier type="set" value="0" field="1ae0-5925-e62e-10d6-max">
  //                   <conditions>
  //                     <condition type="atLeast" value="1" field="selections" scope="parent" childId="cb82-f1ac-64a5-2230" shared="true"/>
  //                   </conditions>
  //                 </modifier>
  //               </modifiers>
  //             </selectionEntry>
  //           </selectionEntries>
  //           <constraints>
  //             <constraint type="min" value="5" field="selections" scope="parent" shared="true" id="628b-7436-ec58-c7f3-min-min"/>
  //             <constraint type="max" value="5" field="selections" scope="parent" shared="true" id="628b-7436-ec58-c7f3-min-max"/>
  //           </constraints>
  //           <modifiers>
  //             <modifier type="increment" value="5" field="628b-7436-ec58-c7f3-min-min">
  //               <repeats>
  //                 <repeat value="1" repeats="1" field="selections" scope="root-entry" childId="1b37-82b8-c062-eb82" shared="true" roundUp="false"/>
  //               </repeats>
  //             </modifier>
  //             <modifier type="increment" value="5" field="628b-7436-ec58-c7f3-min-max">
  //               <repeats>
  //                 <repeat value="1" repeats="1" field="selections" scope="root-entry" childId="1b37-82b8-c062-eb82" shared="true" roundUp="false"/>
  //               </repeats>
  //             </modifier>
  //           </modifiers>
  //           <selectionEntryGroups>
  //             <selectionEntryGroup name="Command Models" id="f9ae-6ddf-e4c3-37e8" hidden="false">
  //               <constraints>
  //                 <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="e3d0-4896-230d-947f" includeChildSelections="false"/>
  //               </constraints>
  //               <entryLinks>
  //                 <entryLink import="true" name="Champion" hidden="false" id="d901-5486-2d1d-80bd" type="selectionEntry" targetId="9c21-1746-9873-a5b5" defaultAmount="1,0,0">
  //                   <constraints>
  //                     <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="fbb4-1739-c054-2a72"/>
  //                     <constraint type="max" value="1" field="selections" scope="e914-877f-21fe-8db9" shared="true" id="7509-4149-2bf3-834" includeChildSelections="true"/>
  //                   </constraints>
  //                 </entryLink>
  //               </entryLinks>
  //             </selectionEntryGroup>
  //           </selectionEntryGroups>
  //         </selectionEntry>
  //       </selectionEntries>
  //       <categoryLinks>
  //         <categoryLink name="CHAMPION" hidden="false" id="c546-7550-84e7-146b" targetId="f679-3bcb-d664-9ac3" primary="false"/>
  //         <categoryLink name="INFANTRY" hidden="false" id="649f-5691-2de4-43c0" targetId="75d6-6995-dfcc-3898" primary="true"/>
  //         <categoryLink name="ORDER" hidden="false" id="7235-a4e2-3425-196e" targetId="ee22-3575-6590-25c" primary="false"/>
  //         <categoryLink name="STORMCAST ETERNALS" hidden="false" id="afbf-21fc-8850-bf6d" targetId="a437-a8f0-67ba-c674" primary="false"/>
  //         <categoryLink name="WARRIOR CHAMBER" hidden="false" id="a29a-2856-5222-ef79" targetId="94a8-e786-4b45-1c16" primary="false"/>
  //       </categoryLinks>
  //     </selectionEntry>
  //   `;
  // 		const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
  // 		const weapons = parseWeapons(root);
  // 		expect(weapons.melee_weapons.length).toBe(2);
  // 		expect(weapons.constraints).toBeDefined();
  // 		expect(weapons.constraints?.length).toBe(1);
  // 		expect(weapons.constraints?.[0].type).toBe('one-in-x');
  // 		expect(weapons.constraints?.[0].value).toBe(5);
  // 		expect(weapons.constraints?.[0].weaponNames[0]).toBe('Grandhammer'); // replacement weapon
  // 		expect(weapons.constraints?.[0].weaponNames[1]).toBe('Warhammer'); // original weapon
  // 	});

  // Disabled due to issues with parsing either-or constraints
  // 	it('parses either-or weapon constraints', () => {
  // 		const xml = `
  //     <selectionEntry type="model" name="Akhelian Allopex">
  //       <selectionEntryGroups>
  //         <selectionEntryGroup name="Wargear Options">
  //           <selectionEntries>
  //             <selectionEntry type="upgrade" name="Razorshell Harpoon">
  //               <profiles>
  //                 <profile name="Razorshell Harpoon" typeName="Ranged Weapon">
  //                   <characteristics>
  //                     <characteristic name="Atk">2</characteristic>
  //                     <characteristic name="Hit">3+</characteristic>
  //                     <characteristic name="Wnd">2+</characteristic>
  //                     <characteristic name="Rnd">1</characteristic>
  //                     <characteristic name="Dmg">3</characteristic>
  //                   </characteristics>
  //                 </profile>
  //               </profiles>
  //             </selectionEntry>
  //             <selectionEntry type="upgrade" name="Retarius Net Launcher">
  //               <profiles>
  //                 <profile name="Retarius Net Launcher" typeName="Ranged Weapon">
  //                   <characteristics>
  //                     <characteristic name="Atk">2</characteristic>
  //                     <characteristic name="Hit">3+</characteristic>
  //                     <characteristic name="Wnd">2+</characteristic>
  //                     <characteristic name="Rnd">1</characteristic>
  //                     <characteristic name="Dmg">3</characteristic>
  //                   </characteristics>
  //                 </profile>
  //               </profiles>
  //             </selectionEntry>
  //           </selectionEntries>
  //           <constraints>
  //             <constraint type="max" value="1" field="selections" scope="parent" />
  //           </constraints>
  //         </selectionEntryGroup>
  //       </selectionEntryGroups>
  //     </selectionEntry>
  //   `;
  // 		const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
  // 		const weapons = parseWeapons(root);
  // 		expect(weapons.constraints).toBeDefined();
  // 		const eitherOr = weapons.constraints?.find(c => c.type === 'either-or');
  // 		expect(eitherOr).toBeDefined();
  // 		expect(eitherOr?.weaponNames).toContain('Razorshell Harpoon');
  // 		expect(eitherOr?.weaponNames).toContain('Retarius Net Launcher');
  // 		expect(eitherOr?.weaponNames.length).toBe(2);
  // 	});
});
