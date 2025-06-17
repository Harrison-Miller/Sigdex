import { describe, it, expect } from 'vitest';
import { DOMParser } from 'xmldom';
import { parseAbilities } from '../../src/parser/abilities';

describe('parseAbilities', () => {
  it('simple', () => {
    const xml = `
		<selectionEntry type="unit" name="AbilityGuy">
			<profiles>
				<profile name="Ability 1" typeName="Ability">
					<characteristics>
						<characteristic name="Timing">Your Hero Phase</characteristic>
						<characteristic name="Effect">Do something cool.</characteristic>
						<characteristic name="Keywords">Heroic, Magic</characteristic>
					</characteristics>
					<attributes>
					<attribute name="Color">Red</attribute>
					<attribute name="Type">Special</attribute>
					</attributes>
				</profile>
			</profiles>
		</selectionEntry>
		`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const abilities = parseAbilities(root);
    expect(abilities.length).toBe(1);
    expect(abilities[0].name).toBe('Ability 1');
    expect(abilities[0].timing).toBe('Your Hero Phase');
    expect(abilities[0].color).toBe('Red');
    expect(abilities[0].type).toBe('Special');
    expect(abilities[0].text).toBe('Do something cool.');
    expect(abilities[0].keywords).toEqual(['Heroic', 'Magic']);
  });

  it('multiple abilities', () => {
    const xml = `
		<selectionEntry type="unit" name="AbilityGuy">
			<profiles>
				<profile name="Ability 1" typeName="Ability (Activated)">
					<characteristics>
						<characteristic name="Timing">Your Hero Phase</characteristic>
						<characteristic name="Effect">Do something cool.</characteristic>
						<characteristic name="Keywords">Heroic, Magic</characteristic>
					</characteristics>
					<attributes>
					<attribute name="Color">Red</attribute>
					<attribute name="Type">Special</attribute>
					</attributes>
				</profile>
				<profile name="Ability 2" typeName="Ability (Activated)">
					<characteristics>
						<characteristic name="Timing">Your Combat Phase</characteristic>
						<characteristic name="Effect">Do something else cool.</characteristic>
						<characteristic name="Keywords">Combat, Aggressive</characteristic>
					</characteristics>
					<attributes>
					<attribute name="Color">Blue</attribute>
					<attribute name="Type">Offensive</attribute>
					</attributes>
				</profile>
			</profiles>
			<categoryLinks><categoryLink name="Hero" /></categoryLinks>
		</selectionEntry>`;

    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const abilities = parseAbilities(root);

    expect(abilities.length).toBe(2);

    expect(abilities[0].name).toBe('Ability 1');
    expect(abilities[0].timing).toBe('Your Hero Phase');
    expect(abilities[0].color).toBe('Red');
    expect(abilities[0].type).toBe('Special');
    expect(abilities[0].text).toBe('Do something cool.');
    expect(abilities[0].keywords).toEqual(['Heroic', 'Magic']);

    expect(abilities[1].name).toBe('Ability 2');
    expect(abilities[1].timing).toBe('Your Combat Phase');
    expect(abilities[1].color).toBe('Blue');
    expect(abilities[1].type).toBe('Offensive');
    expect(abilities[1].text).toBe('Do something else cool.');
    expect(abilities[1].keywords).toEqual(['Combat', 'Aggressive']);
  });

  it('passive no timing', () => {
    const xml = `
		<selectionEntry type="unit" name="AbilityGuy">
			<profiles>
				<profile name="Passive Ability" typeName="Ability (Passive)">
					<characteristics>
						<characteristic name="Effect">Always active.</characteristic>
						<characteristic name="Keywords">Passive, Always</characteristic>
					</characteristics>
					<attributes>
					<attribute name="Color">Green</attribute>
					<attribute name="Type">Defensive</attribute>
					</attributes>
				</profile>
			</profiles>
			<categoryLinks><categoryLink name="Hero" /></categoryLinks>
		</selectionEntry>`;

    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const abilities = parseAbilities(root);

    expect(abilities.length).toBe(1);
    expect(abilities[0].name).toBe('Passive Ability');
    expect(abilities[0].timing).toBe('');
    expect(abilities[0].color).toBe('Green');
    expect(abilities[0].type).toBe('Defensive');
    expect(abilities[0].text).toBe('Always active.');
    expect(abilities[0].keywords).toEqual(['Passive', 'Always']);
  });

  it('has declare and casting value', () => {
    const xml = `
		<selectionEntry type="unit" name="AbilityGuy">
			<profiles>
				<profile name="Magic Ability" typeName="Ability (Spell)">
					<characteristics>
						<characteristic name="Timing">Your Hero Phase</characteristic>
						<characteristic name="Effect">Cast a spell.</characteristic>
						<characteristic name="Declare">Declare before rolling.</characteristic>
						<characteristic name="Casting Value">6</characteristic>
					</characteristics>
					<attributes>
					<attribute name="Color">Purple</attribute>
					<attribute name="Type">Magic</attribute>
					</attributes>
				</profile>
			</profiles>
			<categoryLinks><categoryLink name="Hero" /></categoryLinks>
		</selectionEntry>`;

    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const abilities = parseAbilities(root);

    expect(abilities.length).toBe(1);
    expect(abilities[0].name).toBe('Magic Ability');
    expect(abilities[0].timing).toBe('Your Hero Phase');
    expect(abilities[0].color).toBe('Purple');
    expect(abilities[0].type).toBe('Magic');
    expect(abilities[0].text).toBe('Cast a spell.');
    expect(abilities[0].declare).toBe('Declare before rolling.');
    expect(abilities[0].castingValue).toBe('6');
  });

  it('has cost', () => {
    const xml = `
		<selectionEntry type="unit" name="Faction Terrain">
			<profiles>
				<profile name="Costly Ability" typeName="Ability (Activated)">
					<characteristics>
						<characteristic name="Timing">Your Hero Phase</characteristic>
						<characteristic name="Effect">Do something expensive.</characteristic>
						<characteristic name="Cost">2</characteristic>
					</characteristics>
					<attributes>
					<attribute name="Color">Gold</attribute>
					<attribute name="Type">Special</attribute>
					</attributes>
				</profile>
			</profiles>
			<categoryLinks><categoryLink name="Hero" /></categoryLinks>
		</selectionEntry>`;

    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const abilities = parseAbilities(root);

    expect(abilities.length).toBe(1);
    expect(abilities[0].name).toBe('Costly Ability');
    expect(abilities[0].timing).toBe('Your Hero Phase');
    expect(abilities[0].color).toBe('Gold');
    expect(abilities[0].type).toBe('Special');
    expect(abilities[0].text).toBe('Do something expensive.');
    expect(abilities[0].cost).toBe('2');
  });
});
