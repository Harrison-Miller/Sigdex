import { describe, it, expect } from 'vitest';
import { DOMParser } from 'xmldom';
import { parseHeroicTraits } from '../../src/parser/heroictraits';

describe('parseHeroicTraits', () => {
  it('parse', () => {
    const xml = `
		<root>
			<selectionEntryGroup name="Heroic Traits">
			<selectionEntryGroups>
				<selectionEntryGroup name="Blessings of the Bad Moon">
				<selectionEntries>
					<selectionEntry type="upgrade" name="Loontouched">
					<profiles>
						<profile name="Loontouched" typeName="Ability (Passive)">
						<characteristics>
							<characteristic name="Keywords"/>
							<characteristic name="Effect">If this unit is not a **^^Wizard^^**, it has **^^Wizard (1)^^**. Otherwise, add 1 to casting rolls for this unit.</characteristic>
						</characteristics>
						<attributes>
							<attribute name="Color">Yellow</attribute>
							<attribute name="Type">Special</attribute>
						</attributes>
						</profile>
					</profiles>
					<costs>
						<cost name="pts" typeId="points" value="20"/>
					</costs>
					</selectionEntry>
					<selectionEntry type="upgrade" name="Moonlit Blessing">
					<profiles>
						<profile name="Moonlit Blessing" typeName="Ability (Passive)">
						<characteristics>
							<characteristic name="Keywords"/>
							<characteristic name="Effect">Subtract 1 from hit rolls for attacks that target this unit.</characteristic>
						</characteristics>
						<attributes>
							<attribute name="Color">Blue</attribute>
							<attribute name="Type">Defensive</attribute>
						</attributes>
						</profile>
					</profiles>
					</selectionEntry>
					</selectionEntries>
					</selectionEntryGroup>
					</selectionEntryGroups>
		</root>
		`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const heroictraits = parseHeroicTraits(root);

    expect(heroictraits.size).toBe(1);
    expect(heroictraits.get('Blessings of the Bad Moon')?.length).toBe(2);
    const traits = heroictraits.get('Blessings of the Bad Moon') || [];
    expect(traits[0].name).toBe('Loontouched');
    expect(traits[0].text).toBe(
      'If this unit is not a **^^Wizard^^**, it has **^^Wizard (1)^^**. Otherwise, add 1 to casting rolls for this unit.'
    );
    expect(traits[0].keywords).toEqual([]);
    expect(traits[0].color).toBe('Yellow');
    expect(traits[0].type).toBe('Special');
    expect(traits[0].points).toBe(20);

    expect(traits[1].name).toBe('Moonlit Blessing');
    expect(traits[1].text).toBe('Subtract 1 from hit rolls for attacks that target this unit.');
    expect(traits[1].keywords).toEqual([]);
    expect(traits[1].color).toBe('Blue');
    expect(traits[1].type).toBe('Defensive');
  });
});
