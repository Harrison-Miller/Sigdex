import { describe, it, expect } from 'vitest';
import { DOMParser } from 'xmldom';
import { parsePoints } from '../../src/parser/points';

describe('parsePoints', () => {
  it('simple', () => {
    const xml = `
		<entryLinks>
			<entryLink name="Fungoid Cave-Shaman">
				<costs>
					<cost name="pts" typeId="points" value="100"/>
				</costs>
			</entryLink>
		</entryLinks>
		`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const pointsMap = parsePoints(root);
    expect(pointsMap.get('Fungoid Cave-Shaman')).toBe(100);
  });

  it('multiple', () => {
    const xml = `
		<entryLinks>
			<entryLink name="Unit 1">
				<costs>
					<cost name="pts" typeId="points" value="101"/>
				</costs>
			</entryLink>
			<entryLink name="Unit 2">
				<costs>
					<cost name="pts" typeId="points" value="101"/>
				</costs>
			</entryLink>
		</entryLinks>
		`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const pointsMap = parsePoints(root);
    expect(pointsMap.size).toBe(2);
    expect(pointsMap.get('Unit 1')).toBe(101);
    expect(pointsMap.get('Unit 2')).toBe(101);
  });
});
