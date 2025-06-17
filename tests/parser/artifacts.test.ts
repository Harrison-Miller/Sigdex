import { describe, it, expect } from 'vitest';
import { DOMParser } from 'xmldom';
import { parseArtifacts } from '../../src/parser/artifacts';

describe('parseArtifacts', () => {
  it('parse', () => {
    const xml = `
		<root>
			<selectionEntryGroup name="Artefacts of Power">
			<selectionEntryGroups>
				<selectionEntryGroup name="Troglodytic Treasures">
				<selectionEntries>
					<selectionEntry type="upgrade" name="The Clammy Cowl">
					<profiles>
						<profile name="The Clammy Cowl" typeName="Ability (Passive)">
						<characteristics>
							<characteristic name="Effect">Subtract 1 from hit rolls for attacks that target this unit.</characteristic>
							<characteristic name="Keywords">Defensive, Gloomspite</characteristic>
						</characteristics>
						<attributes>
							<attribute name="Color">Green</attribute>
							<attribute name="Type">Defensive</attribute>
						</attributes>
						</profile>
					</profiles>
					<costs>
						<cost name="pts" typeId="points" value="20"/>
					</costs>
					</selectionEntry>
					<selectionEntry type="upgrade" name="The Fungoid Shard">
					<profiles>
						<profile name="The Fungoid Shard" typeName="Ability (Passive)">
						<characteristics>
							<characteristic name="Effect">Add 1 to casting rolls for this unit.</characteristic>
							<characteristic name="Keywords">Offensive, Gloomspite</characteristic>
						</characteristics>
						<attributes>
							<attribute name="Color">Blue</attribute>
							<attribute name="Type">Offensive</attribute>
						</attributes>
						</profile>
						</profiles>
						</selectionEntry>
				</selectionEntries>
				</selectionEntryGroup>
			</selectionEntryGroups>
			</selectionEntryGroup>
		</root>
		`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const artifacts = parseArtifacts(root);
    expect(artifacts.size).toBe(1);
    expect(artifacts.get('Troglodytic Treasures')?.length).toBe(2);

    const treasures = artifacts.get('Troglodytic Treasures') || [];
    expect(treasures[0].name).toBe('The Clammy Cowl');
    expect(treasures[0].text).toBe('Subtract 1 from hit rolls for attacks that target this unit.');
    expect(treasures[0].keywords).toEqual(['Defensive', 'Gloomspite']);
    expect(treasures[0].color).toBe('Green');
    expect(treasures[0].type).toBe('Defensive');
    expect(treasures[0].points).toBe(20);

    expect(treasures[1].name).toBe('The Fungoid Shard');
    expect(treasures[1].text).toBe('Add 1 to casting rolls for this unit.');
    expect(treasures[1].keywords).toEqual(['Offensive', 'Gloomspite']);
    expect(treasures[1].color).toBe('Blue');
    expect(treasures[1].type).toBe('Offensive');
    expect(treasures[1].points).toBeUndefined(); // No points cost specified
  });
});
