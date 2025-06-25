export const oathswordKinArmyInfo = `<root>

 <entryLink import="true" name="Gunnar Brand" hidden="false" id="6ae-10fb-92fd-affb" type="selectionEntry" targetId="dd16-c1dc-4ff-85f2">
      <costs>
        <cost name="pts" typeId="points" value="210"/>
      </costs>
      <entryLinks>
        <entryLink import="true" name="Battle Wounds + Scars" hidden="false" id="08ed-488b-6b94-1071" type="selectionEntryGroup" targetId="20bb-e408-9d25-ffc6"/>
      </entryLinks>
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
              </conditions>
            </conditionGroup>
            <conditionGroup type="or">
              <conditionGroups>
                <conditionGroup type="and">
                  <conditions>
                    <condition type="instanceOf" value="1" field="selections" scope="ancestor" childId="376a-6b97-8699-dd59" shared="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="d1f3-921c-b403-1106" shared="true" includeChildSelections="true"/>
                    <condition type="notInstanceOf" value="1" field="selections" scope="self" childId="d1f3-921c-b403-1106" shared="true"/>
                  </conditions>
                </conditionGroup>
              </conditionGroups>
              <conditions>
                <condition type="notInstanceOf" value="1" field="selections" scope="ancestor" childId="376a-6b97-8699-dd59" shared="true"/>
              </conditions>
            </conditionGroup>
          </conditionGroups>
        </modifier>
      </modifiers>
      <modifierGroups>
        <modifierGroup type="and">
          <modifiers>
            <modifier type="add" value="db3a-7199-c92e-f3cf" field="category" scope="force" affects="self.entries.recursive.56-43e3-895c-2c26"/>
            <modifier type="add" value="8f4b-1fa6-3128-8405" field="category" scope="force" affects="self.entries.recursive.b00-81ec-2d27-c162"/>
            <modifier type="add" value="db3a-7199-c92e-f3cf" field="category" scope="force" affects="self.entries.recursive.a7e4-736d-e448-95dd"/>
          </modifiers>
          <conditions>
            <condition type="instanceOf" value="1" field="selections" scope="self" childId="d1f3-921c-b403-1106" shared="true"/>
          </conditions>
        </modifierGroup>
      </modifierGroups>
    </entryLink>

<entryLink import="true" name="Singri Brand" hidden="false" id="b00-81ec-2d27-c162" type="selectionEntry" targetId="4191-4be9-6ccd-9f70">
      <constraints>
        <constraint type="min" value="-1" field="selections" scope="force" shared="true" id="d14f-8199-f7ae-dd33" includeChildSelections="true"/>
      </constraints>
      <modifiers>
        <modifier type="set" value="true" field="hidden">
          <conditionGroups>
            <conditionGroup type="and">
              <conditions>
                <condition type="notInstanceOf" value="1" field="selections" scope="self" childId="8f4b-1fa6-3128-8405" shared="true"/>
              </conditions>
            </conditionGroup>
          </conditionGroups>
        </modifier>
        <modifier type="set" value="1" field="d14f-8199-f7ae-dd33">
          <localConditionGroups>
            <localConditionGroup type="atLeast" value="1" scope="force" field="selections" includeChildSelections="true" includeChildForces="true" repeats="1">
              <conditions>
                <condition type="instanceOf" value="1" field="selections" scope="self" childId="d1f3-921c-b403-1106" shared="true" includeChildSelections="true"/>
                <condition type="instanceOf" value="1" field="selections" scope="self" childId="6ae-10fb-92fd-affb" shared="true"/>
              </conditions>
            </localConditionGroup>
          </localConditionGroups>
        </modifier>
      </modifiers>
      <entryLinks>
        <entryLink import="true" name="Battle Wounds + Scars" hidden="false" id="f9c8-8995-33c2-379a" type="selectionEntryGroup" targetId="20bb-e408-9d25-ffc6"/>
      </entryLinks>
    </entryLink>


	<entryLink import="true" name="The Oathsworn Kin" hidden="false" id="a7e4-736d-e448-95dd" type="selectionEntry" targetId="c8b1-7d96-6db6-2293">
      <modifiers>
        <modifier type="multiply" value="2" field="points">
          <conditions>
            <condition type="atLeast" value="1" field="selections" scope="self" childId="1b37-82b8-c062-eb82" shared="true"/>
          </conditions>
        </modifier>
        <modifier type="set" value="1" field="d126-b788-30fb-5301">
          <localConditionGroups>
            <localConditionGroup type="atLeast" value="1" scope="force" field="selections" includeChildSelections="true" includeChildForces="true" repeats="1">
              <conditions>
                <condition type="instanceOf" value="1" field="selections" scope="self" childId="d1f3-921c-b403-1106" shared="true" includeChildSelections="true"/>
                <condition type="instanceOf" value="1" field="selections" scope="self" childId="6ae-10fb-92fd-affb" shared="true"/>
              </conditions>
            </localConditionGroup>
          </localConditionGroups>
        </modifier>
        <modifier type="set" value="true" field="hidden">
          <conditionGroups>
            <conditionGroup type="and">
              <conditions>
                <condition type="notInstanceOf" value="1" field="selections" scope="self" childId="db3a-7199-c92e-f3cf" shared="true"/>
              </conditions>
              <localConditionGroups>
                <localConditionGroup type="lessThan" value="1" scope="force" field="selections" includeChildSelections="true" includeChildForces="true" repeats="1">
                  <conditions>
                    <condition type="instanceOf" value="1" field="selections" scope="self" childId="d1f3-921c-b403-1106" shared="true" includeChildSelections="true"/>
                    <condition type="instanceOf" value="1" field="selections" scope="self" childId="6ae-10fb-92fd-affb" shared="true"/>
                  </conditions>
                </localConditionGroup>
              </localConditionGroups>
            </conditionGroup>
          </conditionGroups>
        </modifier>
      </modifiers>
      <constraints>
        <constraint type="min" value="-1" field="selections" scope="force" shared="true" id="d126-b788-30fb-5301" includeChildSelections="true"/>
      </constraints>
      <entryLinks>
        <entryLink import="true" name="Battle Wounds + Scars" hidden="false" id="7ac9-e087-4e4c-6e05" type="selectionEntryGroup" targetId="20bb-e408-9d25-ffc6"/>
      </entryLinks>
    </entryLink>

</root>`;
