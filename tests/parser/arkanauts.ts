export const ARKANAUTS_XML = `
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
