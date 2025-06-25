export const neaveArmyInfo = `<root>
<entryLink import="true" name="Neave Blacktalon" hidden="false" id="9950-73bd-365e-e450" type="selectionEntry" targetId="8931-32bb-58ba-820a">
      <costs>
        <cost name="pts" typeId="points" value="310"/>
      </costs>
      <constraints>
        <constraint type="min" value="-1" field="selections" scope="force" shared="true" id="450c-7297-8d45-581e"/>
      </constraints>
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
            <conditionGroup type="or">
              <conditions>
                <condition type="notInstanceOf" value="1" field="selections" scope="ancestor" childId="376a-6b97-8699-dd59" shared="true"/>
              </conditions>
              <conditionGroups>
                <conditionGroup type="and">
                  <conditions>
                    <condition type="instanceOf" value="1" field="selections" scope="ancestor" childId="376a-6b97-8699-dd59" shared="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="d1f3-921c-b403-1106" shared="true" includeChildSelections="true"/>
                    <condition type="notInstanceOf" value="1" field="selections" scope="self" childId="d1f3-921c-b403-1106" shared="true"/>
                  </conditions>
                </conditionGroup>
              </conditionGroups>
            </conditionGroup>
          </conditionGroups>
        </modifier>
      </modifiers>
      <entryLinks>
        <entryLink import="true" name="Battle Wounds + Scars" hidden="false" id="eadd-eb6c-2df3-79c0" type="selectionEntryGroup" targetId="148c-ca2b-6414-7eca"/>
      </entryLinks>
      <modifierGroups>
        <modifierGroup type="and">
          <modifiers>
            <modifier type="add" value="db3a-7199-c92e-f3cf" field="category" scope="force" affects="self.entries.recursive.3a8d-b40d-5bdc-8591"/>
            <modifier type="add" value="db3a-7199-c92e-f3cf" field="category" scope="force" affects="self.entries.recursive.0d72-2242-47d1-8f72"/>
            <modifier type="add" value="8f4b-1fa6-3128-8405" field="category" scope="force" affects="self.entries.recursive.7a96-997a-6a56-eed6"/>
          </modifiers>
          <conditions>
            <condition type="instanceOf" value="1" field="selections" scope="self" childId="d1f3-921c-b403-1106" shared="true"/>
          </conditions>
        </modifierGroup>
      </modifierGroups>
    </entryLink>

    <entryLink import="true" name="Lorai, Child of the Abyss" hidden="false" id="7a96-997a-6a56-eed6" type="selectionEntry" targetId="fc54-7cb5-cc46-7aeb">
      <constraints>
        <constraint type="min" value="-1" field="selections" scope="force" shared="true" id="28b3-477b-54ef-8dd1"/>
      </constraints>
      <modifiers>
        <modifier type="set" value="1" field="28b3-477b-54ef-8dd1">
          <localConditionGroups>
            <localConditionGroup type="atLeast" value="1" scope="force" field="selections" includeChildSelections="true" includeChildForces="true" repeats="1">
              <conditions>
                <condition type="instanceOf" value="1" field="selections" scope="self" childId="d1f3-921c-b403-1106" shared="true" includeChildSelections="true"/>
                <condition type="instanceOf" value="1" field="selections" scope="self" childId="9950-73bd-365e-e450" shared="true"/>
              </conditions>
            </localConditionGroup>
          </localConditionGroups>
        </modifier>
        <modifier type="set" value="true" field="hidden">
          <conditionGroups>
            <conditionGroup type="and">
              <conditions>
                <condition type="notInstanceOf" value="1" field="selections" scope="self" childId="8f4b-1fa6-3128-8405" shared="true"/>
              </conditions>
            </conditionGroup>
          </conditionGroups>
        </modifier>
      </modifiers>
      <entryLinks>
        <entryLink import="true" name="Battle Wounds + Scars" hidden="false" id="49d6-23c9-933c-c369" type="selectionEntryGroup" targetId="148c-ca2b-6414-7eca"/>
      </entryLinks>
    </entryLink>

<entryLink import="true" name="Neave&apos;s Companions" hidden="false" id="0d72-2242-47d1-8f72" type="selectionEntry" targetId="a7a2-ab90-9072-b50b">
      <modifiers>
        <modifier type="set" value="1" field="2271-b785-5a0a-da8e">
          <localConditionGroups>
            <localConditionGroup type="atLeast" value="1" scope="force" field="selections" includeChildSelections="true" includeChildForces="true" repeats="1">
              <conditions>
                <condition type="instanceOf" value="1" field="selections" scope="self" childId="d1f3-921c-b403-1106" shared="true" includeChildSelections="true"/>
                <condition type="instanceOf" value="1" field="selections" scope="self" childId="9950-73bd-365e-e450" shared="true"/>
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
                    <condition type="instanceOf" value="1" field="selections" scope="self" childId="9950-73bd-365e-e450" shared="true"/>
                  </conditions>
                </localConditionGroup>
              </localConditionGroups>
            </conditionGroup>
          </conditionGroups>
        </modifier>
      </modifiers>
      <constraints>
        <constraint type="min" value="-1" field="selections" scope="force" shared="true" id="2271-b785-5a0a-da8e"/>
      </constraints>
      <entryLinks>
        <entryLink import="true" name="Battle Wounds + Scars" hidden="false" id="d6be-871a-c992-e111" type="selectionEntryGroup" targetId="148c-ca2b-6414-7eca"/>
      </entryLinks>
    </entryLink>

</root>
`;
