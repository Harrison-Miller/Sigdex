export const callisAndTollArmyInfo = `<root>
	<entryLink import="true" name="Callis and Toll" hidden="false" id="f534-437-b727-fa21" type="selectionEntry" targetId="bead-f727-a5cc-fde1">
      <costs>
        <cost name="pts" typeId="points" value="210"/>
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
            <conditionGroup type="or">
              <conditions>
                <condition type="instanceOf" value="1" field="selections" scope="ancestor" childId="4063-b3a6-e7e1-383f" shared="true"/>
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
        <entryLink import="true" name="Battle Wounds + Scars" hidden="false" id="88c1-e02e-bd1a-d83b" type="selectionEntryGroup" targetId="5f5b-7b93-b8c4-6eab"/>
      </entryLinks>
      <modifierGroups>
        <modifierGroup type="and">
          <modifiers>
            <modifier type="add" value="db3a-7199-c92e-f3cf" field="category" scope="force" affects="self.entries.recursive.4acc-87fa-ee52-4e51"/>
            <modifier type="add" value="db3a-7199-c92e-f3cf" field="category" scope="force" affects="self.entries.recursive.b41d-d073-1ba9-1728"/>
          </modifiers>
          <conditions>
            <condition type="instanceOf" value="1" field="selections" scope="self" childId="d1f3-921c-b403-1106" shared="true"/>
          </conditions>
        </modifierGroup>
      </modifierGroups>
    </entryLink>

	<entryLink import="true" name="Toll&apos;s Companions" hidden="false" id="e729-6dc2-40fe-2b84" type="selectionEntry" targetId="b41d-d073-1ba9-1728">
      <modifiers>
        <modifier type="set" value="1" field="cc5f-63d1-12b9-4e09">
          <conditions>
            <condition type="atLeast" value="1" field="selections" scope="force" childId="f534-437-b727-fa21" shared="true"/>
          </conditions>
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
                    <condition type="instanceOf" value="1" field="selections" scope="self" childId="f534-437-b727-fa21" shared="true"/>
                  </conditions>
                </localConditionGroup>
              </localConditionGroups>
            </conditionGroup>
          </conditionGroups>
        </modifier>
      </modifiers>
      <constraints>
        <constraint type="min" value="-1" field="selections" scope="force" shared="true" id="cc5f-63d1-12b9-4e09"/>
      </constraints>
      <entryLinks>
        <entryLink import="true" name="Battle Wounds + Scars" hidden="false" id="5f6c-367f-adf9-21fa" type="selectionEntryGroup" targetId="5f5b-7b93-b8c4-6eab"/>
      </entryLinks>
    </entryLink>
</root>
`;
