export const alloplexConstraints = `
<selectionEntry type="unit" import="true" name="Akhelian Allopex" hidden="false" id="91f6-6340-d95c-b89d">
      <profiles>
        <profile name="Akhelian Allopex" typeId="ff03-376e-972f-8ab2" typeName="Unit" hidden="false" id="e8c1-2db8-acf1-40a6">
          <characteristics>
            <characteristic name="Move" typeId="fed0-d1b3-1bb8-c501">12&quot;</characteristic>
            <characteristic name="Health" typeId="96be-54ae-ce7b-10b7">8</characteristic>
            <characteristic name="Save" typeId="1981-ef09-96f6-7aa9">4+</characteristic>
            <characteristic name="Control" typeId="6c6f-8510-9ce1-fc6e">2</characteristic>
          </characteristics>
        </profile>
        <profile name="Bloodthirsty Predators" typeId="907f-a48-6a04-f788" typeName="Ability (Passive)" hidden="false" id="18ca-bbfb-252e-5c71">
          <characteristics>
            <characteristic name="Keywords" typeId="b977-7c5e-33b2-428e"/>
            <characteristic name="Effect" typeId="fd7f-888d-3257-a12b">Add 1 to the Attacks characteristic of this unit’s** Allopex’s Ferocious Bite** while it is within 6&quot; of any damaged enemy units or while it is within 6&quot; of any enemy units that had any models slain in the same turn.</characteristic>
          </characteristics>
          <attributes>
            <attribute typeId="50fe-4f29-6bc3-dcc6" name="Color">Red</attribute>
            <attribute typeId="bf11-4e10-3ab1-06f4" name="Type">Offensive</attribute>
          </attributes>
        </profile>
        <profile name="Ensnared" typeId="59b6-d47a-a68a-5dcc" typeName="Ability (Activated)" hidden="false" id="cfad-ba76-9875-dd41">
          <characteristics>
            <characteristic name="Timing" typeId="652c-3d84-4e7-14f4">Any Shooting Phase</characteristic>
            <characteristic name="Declare" typeId="bad3-f9c5-ba46-18cb">Pick an enemy **^^Monster^^** or **^^Cavalry^^** unit that had any damage points allocated to it this turn by this unit’s shooting attacks to be the target.</characteristic>
            <characteristic name="Effect" typeId="b6f1-ba36-6cd-3b03">Roll a dice. On a 3+, until the start of your next turn, subtract 1 from the number of dice rolled when making charge rolls for the target, to a minimum of 1.</characteristic>
            <characteristic name="Keywords" typeId="12e8-3214-7d8f-1d0f"/>
            <characteristic name="Used By" typeId="1b32-c9d6-3106-166b"/>
          </characteristics>
          <attributes>
            <attribute typeId="5a11-eab3-180c-ddf5" name="Color">Blue</attribute>
            <attribute typeId="6d16-c86b-2698-85a4" name="Type">Movement</attribute>
          </attributes>
        </profile>
      </profiles>
      <categoryLinks>
        <categoryLink name="IDONETH DEEPKIN" hidden="false" id="4fc4-aa03-be25-f971" targetId="c8fc-7a72-6665-2f34" primary="false"/>
        <categoryLink name="ORDER" hidden="false" id="ee20-b1e5-af99-857f" targetId="ee22-3575-6590-25c" primary="false"/>
        <categoryLink name="CAVALRY" hidden="false" id="c7b0-6fc4-a267-c636" targetId="926c-df8c-6841-d49e" primary="true"/>
        <categoryLink name="FLY" hidden="false" id="1bc-5f66-a75a-d473" targetId="b979-4c3e-7d0e-6921" primary="false"/>
        <categoryLink name="AELF" hidden="false" id="73ce-aa3-4413-96e0" targetId="5ef2-db09-d3cc-4b27" primary="false"/>
        <categoryLink name="AKHELIAN" hidden="false" id="c0b4-684e-6677-1015" targetId="108a-4ad6-bb90-a5ea" primary="false"/>
      </categoryLinks>
      <selectionEntries>
        <selectionEntry type="model" import="true" name="Akhelian Allopex" hidden="false" id="55f7-95d5-8b07-462c">
          <selectionEntries>
            <selectionEntry type="upgrade" import="true" name="Barbed Hooks and Blades" hidden="false" id="a0bd-b10c-f34e-a800">
              <profiles>
                <profile name="Barbed Hooks and Blades" typeId="9074-76b6-9e2f-81e3" typeName="Melee Weapon" hidden="false" id="6ab3-2785-bccf-a4b3">
                  <characteristics>
                    <characteristic name="Atk" typeId="60e-35aa-31ed-e488">4</characteristic>
                    <characteristic name="Hit" typeId="26dc-168-b2fd-cb93">3+</characteristic>
                    <characteristic name="Wnd" typeId="61c1-22cc-40af-2847">4+</characteristic>
                    <characteristic name="Rnd" typeId="eccc-10fa-6958-fb73">1</characteristic>
                    <characteristic name="Dmg" typeId="e948-9c71-12a6-6be4">1</characteristic>
                    <characteristic name="Ability" typeId="eda3-7332-5db1-4159">-</characteristic>
                  </characteristics>
                </profile>
              </profiles>
              <constraints>
                <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="4795-ee67-5dbe-6dbe"/>
                <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="7a22-a6e7-6feb-a36a"/>
              </constraints>
            </selectionEntry>
            <selectionEntry type="upgrade" import="true" name="Allopex’s Ferocious Bite" hidden="false" id="f4a8-c2b4-e67a-7f36">
              <profiles>
                <profile name="Allopex’s Ferocious Bite" typeId="9074-76b6-9e2f-81e3" typeName="Melee Weapon" hidden="false" id="4321-6f80-d2fd-e58c">
                  <characteristics>
                    <characteristic name="Atk" typeId="60e-35aa-31ed-e488">3</characteristic>
                    <characteristic name="Hit" typeId="26dc-168-b2fd-cb93">4+</characteristic>
                    <characteristic name="Wnd" typeId="61c1-22cc-40af-2847">2+</characteristic>
                    <characteristic name="Rnd" typeId="eccc-10fa-6958-fb73">2</characteristic>
                    <characteristic name="Dmg" typeId="e948-9c71-12a6-6be4">2</characteristic>
                    <characteristic name="Ability" typeId="eda3-7332-5db1-4159">Anti‑**^^Monster^^** (+1 Rend), Companion</characteristic>
                  </characteristics>
                </profile>
              </profiles>
              <constraints>
                <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="d96c-83bb-5f9c-88ca"/>
                <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="dd12-fdbd-bcc6-ec4c"/>
              </constraints>
            </selectionEntry>
          </selectionEntries>
          <constraints>
            <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="ab92-3f4c-928f-69fc"/>
            <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="b06-4c8b-ad59-e544"/>
          </constraints>
          <selectionEntryGroups>
            <selectionEntryGroup name="Wargear Options" id="5179-b807-7353-4c5b" hidden="false" flatten="true">
              <selectionEntries>
                <selectionEntry type="upgrade" import="true" name="Razorshell Harpoon" hidden="false" id="9d85-2345-b0cd-9f23">
                  <selectionEntries>
                    <selectionEntry type="upgrade" import="true" name="Razorshell Harpoon" hidden="false" id="6af-a1c0-1e43-c111">
                      <profiles>
                        <profile name="Razorshell Harpoon" typeId="1fd-a42f-41d3-fe05" typeName="Ranged Weapon" hidden="false" id="b9d6-ad86-5053-d2d8">
                          <characteristics>
                            <characteristic name="Rng" typeId="c6b5-908c-a604-1a98">18&quot;</characteristic>
                            <characteristic name="Atk" typeId="aa17-4296-2887-e05d">2</characteristic>
                            <characteristic name="Hit" typeId="194d-aeb6-5ba7-83b4">3+</characteristic>
                            <characteristic name="Wnd" typeId="d3d5-9dc6-13de-8d1">2+</characteristic>
                            <characteristic name="Rnd" typeId="d03f-a9ae-3eec-755">1</characteristic>
                            <characteristic name="Dmg" typeId="96c2-d0a5-ea1e-653b">3</characteristic>
                            <characteristic name="Ability" typeId="d793-3dd7-9c13-741e">Anti‑**^^Monster^^** (+1 Rend)</characteristic>
                          </characteristics>
                        </profile>
                      </profiles>
                      <constraints>
                        <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="8300-81b9-6bf8-ee54"/>
                        <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="acab-5f99-892f-9296"/>
                      </constraints>
                    </selectionEntry>
                  </selectionEntries>
                  <constraints>
                    <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="d2cf-d816-53c3-bfd"/>
                  </constraints>
                </selectionEntry>
                <selectionEntry type="upgrade" import="true" name="Retarius Net Launcher" hidden="false" id="8227-9d52-dd1f-3b3a">
                  <constraints>
                    <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="2139-b3e-c56-f6d4"/>
                  </constraints>
                  <selectionEntries>
                    <selectionEntry type="upgrade" import="true" name="Retarius Net Launcher" hidden="false" id="2af8-c8ec-488e-bfe">
                      <profiles>
                        <profile name="Retarius Net Launcher" typeId="1fd-a42f-41d3-fe05" typeName="Ranged Weapon" hidden="false" id="b864-885c-b24e-9d5c">
                          <characteristics>
                            <characteristic name="Rng" typeId="c6b5-908c-a604-1a98">18&quot;</characteristic>
                            <characteristic name="Atk" typeId="aa17-4296-2887-e05d">2</characteristic>
                            <characteristic name="Hit" typeId="194d-aeb6-5ba7-83b4">3+</characteristic>
                            <characteristic name="Wnd" typeId="d3d5-9dc6-13de-8d1">2+</characteristic>
                            <characteristic name="Rnd" typeId="d03f-a9ae-3eec-755">1</characteristic>
                            <characteristic name="Dmg" typeId="96c2-d0a5-ea1e-653b">3</characteristic>
                            <characteristic name="Ability" typeId="d793-3dd7-9c13-741e">Anti‑**^^Cavalry^^** (+1 Rend)</characteristic>
                          </characteristics>
                        </profile>
                      </profiles>
                      <constraints>
                        <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="dc56-2807-1a3e-d6c6"/>
                        <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="569a-790f-ceb7-8e62"/>
                      </constraints>
                    </selectionEntry>
                  </selectionEntries>
                </selectionEntry>
              </selectionEntries>
              <constraints>
                <constraint type="min" value="1" field="selections" scope="parent" shared="true" id="216e-cc3a-2756-28ed-min"/>
                <constraint type="max" value="1" field="selections" scope="parent" shared="true" id="216e-cc3a-2756-28ed-max"/>
              </constraints>
            </selectionEntryGroup>
          </selectionEntryGroups>
        </selectionEntry>
      </selectionEntries>
    </selectionEntry>`;
