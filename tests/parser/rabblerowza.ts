export const rabblerowzaAndSkitterstrandArmyInfo = `<root>
<entryLink import="true" name="Rabble-Rowza" hidden="false" id="7c57-b589-f1f0-30b3" type="selectionEntry" targetId="13ce-b7ed-f419-cdd">
      <entryLinks>
        <entryLink import="true" name="Heroic Traits" hidden="false" id="45ba-bfe2-66cf-1183" type="selectionEntryGroup" targetId="eee9-a6f1-2d96-adee"/>
        <entryLink import="true" name="Artefacts of Power" hidden="false" id="38f1-5ced-cc12-8d9b" type="selectionEntryGroup" targetId="571d-f460-9591-c3cc"/>
        <entryLink import="true" name="Paths" hidden="false" id="eb8f-6ba6-af17-54c2" type="selectionEntryGroup" targetId="b182-942d-da44-5153"/>
        <entryLink import="true" name="Battle Wounds + Scars" hidden="false" id="abd3-b4ec-3be6-3bc9" type="selectionEntryGroup" targetId="9ee4-6545-911b-3cf6"/>
        <entryLink import="true" name="Warlord" hidden="false" id="e518-809f-8a74-9c6f" type="selectionEntry" targetId="bb28-fa4a-bf5f-f793"/>
        <entryLink import="true" name="Renown" hidden="false" id="3d77-839d-1568-172a" type="selectionEntry" targetId="e7d5-5062-46d5-38dd"/>
      </entryLinks>
      <costs>
        <cost name="pts" typeId="points" value="120"/>
      </costs>
      <modifiers>
        <modifier type="set-primary" value="d1f3-921c-b403-1106" field="category" scope="root-entry">
          <conditionGroups>
            <conditionGroup type="and">
              <conditions>
                <condition type="lessThan" value="1" field="selections" scope="force" childId="d1f3-921c-b403-1106" shared="true" includeChildSelections="true" includeChildForces="true"/>
                <condition type="instanceOf" value="1" field="selections" scope="ancestor" childId="376a-6b97-8699-dd59" shared="true"/>
              </conditions>
            </conditionGroup>
          </conditionGroups>
        </modifier>
        <modifier type="set" value="true" field="hidden">
          <conditionGroups>
            <conditionGroup type="and">
              <conditions>
                <condition type="instanceOf" value="1" field="selections" scope="ancestor" childId="376a-6b97-8699-dd59" shared="true"/>
                <condition type="atLeast" value="1" field="selections" scope="force" childId="d1f3-921c-b403-1106" shared="true" includeChildSelections="true"/>
                <condition type="notInstanceOf" value="1" field="selections" scope="self" childId="d1f3-921c-b403-1106" shared="true"/>
                <condition type="notInstanceOf" value="1" field="selections" scope="self" childId="8f4b-1fa6-3128-8405" shared="true"/>
              </conditions>
            </conditionGroup>
          </conditionGroups>
        </modifier>
      </modifiers>
      <modifierGroups>
        <modifierGroup type="and">
          <modifiers>
            <modifier type="add" value="d761-1d91-59b5-dd85" field="category"/>
          </modifiers>
          <conditionGroups>
            <conditionGroup type="and">
              <conditions>
                <condition type="instanceOf" value="1" field="selections" scope="ancestor" childId="376a-6b97-8699-dd59" shared="true"/>
                <condition type="atLeast" value="1" field="selections" scope="force" childId="d1f3-921c-b403-1106" shared="true" includeChildSelections="true"/>
                <condition type="notInstanceOf" value="1" field="selections" scope="self" childId="d1f3-921c-b403-1106" shared="true"/>
              </conditions>
            </conditionGroup>
          </conditionGroups>
        </modifierGroup>
        <modifierGroup type="and">
          <modifiers>
            <modifier type="add" value="db3a-7199-c92e-f3cf" field="category" scope="force" affects="self.entries.recursive.6d54-625c-d063-13e2"/>
            <modifier type="add" value="db3a-7199-c92e-f3cf" field="category" scope="force" affects="self.entries.recursive.836d-96c5-f628-0692"/>
          </modifiers>
          <conditions>
            <condition type="instanceOf" value="1" field="selections" scope="self" childId="d1f3-921c-b403-1106" shared="true"/>
          </conditions>
        </modifierGroup>
      </modifierGroups>
    </entryLink>

	<entryLink import="true" name="Skitterstrand Arachnarok" hidden="false" id="159c-e5bd-d18d-2a61" type="selectionEntry" targetId="f80f-189e-26c5-125">
      <entryLinks>
        <entryLink import="true" name="Reinforced" hidden="false" id="6f59-ee65-c312-592f" type="selectionEntry" targetId="1b37-82b8-c062-eb82"/>
        <entryLink import="true" name="Paths" hidden="false" id="4045-6837-29cd-0e6a" type="selectionEntryGroup" targetId="b182-942d-da44-5153"/>
        <entryLink import="true" name="Battle Wounds + Scars" hidden="false" id="7801-6110-e919-a302" type="selectionEntryGroup" targetId="9ee4-6545-911b-3cf6"/>
        <entryLink import="true" name="Renown" hidden="false" id="089b-dfdc-a3b6-8df5" type="selectionEntry" targetId="e7d5-5062-46d5-38dd"/>
      </entryLinks>
      <modifiers>
        <modifier type="multiply" value="2" field="points">
          <conditions>
            <condition type="atLeast" value="1" field="selections" scope="self" childId="1b37-82b8-c062-eb82" shared="true"/>
          </conditions>
        </modifier>
        <modifier type="set" value="true" field="hidden">
          <conditionGroups>
            <conditionGroup type="and">
              <conditions>
                <condition type="instanceOf" value="1" field="selections" scope="ancestor" childId="376a-6b97-8699-dd59" shared="true"/>
                <condition type="notInstanceOf" value="1" field="selections" scope="self" childId="db3a-7199-c92e-f3cf" shared="true"/>
              </conditions>
            </conditionGroup>
          </conditionGroups>
        </modifier>
      </modifiers>
      <costs>
        <cost name="pts" typeId="points" value="190"/>
      </costs>
      <modifierGroups>
        <modifierGroup type="and">
          <modifiers>
            <modifier type="set" value="0" field="8beb-b733-fa56-c0e3">
              <conditionGroups>
                <conditionGroup type="and">
                  <conditions>
                    <condition type="atLeast" value="2" field="selections" scope="force" childId="6d54-625c-d063-13e2" shared="true"/>
                  </conditions>
                  <conditionGroups>
                    <conditionGroup type="or">
                      <conditions>
                        <condition type="atLeast" value="1" field="selections" scope="force" childId="7c57-b589-f1f0-30b3" shared="true"/>
                      </conditions>
                    </conditionGroup>
                  </conditionGroups>
                </conditionGroup>
              </conditionGroups>
            </modifier>
          </modifiers>
          <conditions>
            <condition type="instanceOf" value="1" field="selections" scope="ancestor" childId="376a-6b97-8699-dd59" shared="true"/>
          </conditions>
        </modifierGroup>
      </modifierGroups>
      <constraints>
        <constraint type="max" value="-1" field="selections" scope="force" shared="true" id="8beb-b733-fa56-c0e3"/>
      </constraints>
    </entryLink>
</root>
`;
