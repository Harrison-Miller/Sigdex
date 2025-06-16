import { describe, it, expect } from 'vitest';
import { parseUnit } from '../src/parser';

describe('Manifestation stat parsing', () => {
  it('parses stats for a Manifestation unit', () => {
    const xml = `
    <selectionEntry type="unit" import="true" name="Scrapscuttle&apos;s Arachnacauldron" hidden="false" id="27d1-2d25-ce27-9bac" publicationId="a395-7bc4-71eb-46df">
      <profiles>
        <profile name="Scrapscuttle&apos;s Arachnacauldron" typeId="1287-3a-9799-7e40" typeName="Manifestation" hidden="false" id="ddeb-b018-bf63-7ee4">
          <characteristics>
            <characteristic name="Move" typeId="c28a-6000-2a0b-e7cf">6"</characteristic>
            <characteristic name="Health" typeId="d1b9-3068-515-131e">6</characteristic>
            <characteristic name="Save" typeId="80c7-7691-b6ed-d6a6">5+</characteristic>
            <characteristic name="Banishment" typeId="97a2-d412-9ac-6a37">7+</characteristic>
          </characteristics>
        </profile>
      </profiles>
    </selectionEntry>
    `;
    const unit = parseUnit(xml);
    expect(unit.name).toBe(`Scrapscuttle's Arachnacauldron`);
    expect(unit.stats.move).toBe('6"');
    expect(unit.stats.health).toBe(6);
    expect(unit.stats.save).toBe('5+');
    expect(unit.stats.banishment).toBe('7+');
  });
});
