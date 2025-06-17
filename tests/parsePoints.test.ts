import { describe, it, expect } from 'vitest';
import { parsePoints } from '../src/parsePoints';

const sampleArmyInfo = `
<entryLink import="true" name="Fungoid Cave-Shaman" hidden="false" id="45fb-8954-45ee-bb21" type="selectionEntry" targetId="5f35-ca66-398-bf72">
  <entryLinks>
    <entryLink import="true" name="Heroic Traits" hidden="false" id="91c7-7548-c5bf-23fb" type="selectionEntryGroup" targetId="eee9-a6f1-2d96-adee"/>
    <entryLink import="true" name="Artefacts of Power" hidden="false" id="2060-702a-74d7-70ac" type="selectionEntryGroup" targetId="571d-f460-9591-c3cc"/>
    <entryLink import="true" name="Paths" hidden="false" id="a4b0-d9e7-3cb8-0be9" type="selectionEntryGroup" targetId="b182-942d-da44-5153"/>
    <entryLink import="true" name="Battle Wounds + Scars" hidden="false" id="f1df-28ec-4262-e9ea" type="selectionEntryGroup" targetId="9ee4-6545-911b-3cf6"/>
    <entryLink import="true" name="Warlord" hidden="false" id="938e-3698-ad2b-e298" type="selectionEntry" targetId="bb28-fa4a-bf5f-f793"/>
    <entryLink import="true" name="Renown" hidden="false" id="6e47-d735-607b-b900" type="selectionEntry" targetId="e7d5-5062-46d5-38dd"/>
  </entryLinks>
  <costs>
    <cost name="pts" typeId="points" value="100"/>
  </costs>
</entryLink>
`;

describe('parsePoints', () => {
  it('parses unit points from armyInfo XML', () => {
    const pointsMap = parsePoints(sampleArmyInfo);
    expect(pointsMap.get('Fungoid Cave-Shaman')).toBe(100);
  });

  it('returns 0 for units not in the points map', () => {
    const pointsMap = parsePoints(sampleArmyInfo);
    expect(pointsMap.get('Nonexistent Unit')).toBeUndefined();
  });
});
