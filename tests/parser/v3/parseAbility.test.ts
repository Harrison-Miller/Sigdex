import { describe, expect, it } from 'vitest';
import { xmlParser } from '../../../src/parser/v3/util';
import { parseAbilities, parseAbility } from '../../../src/parser/v3/parse/parseAbility';

describe('parseAbility', () => {
  it('simple ability', () => {
    const xml = `    
		<profile name="Let&apos;s Get Stabbin&apos;!" typeId="59b6-d47a-a68a-5dcc" typeName="Ability (Activated)" hidden="false" id="6c22-8d38-e581-596c">
		<characteristics>
			<characteristic name="Timing" typeId="652c-3d84-4e7-14f4">Reaction: You declared a **^^Fight^^** ability for this unit</characteristic>
			<characteristic name="Declare" typeId="bad3-f9c5-ba46-18cb"/>
			<characteristic name="Effect" typeId="b6f1-ba36-6cd-3b03">Pick a friendly non-**^^Hero Moonclan Infantry^^** unit that has not used a Fight ability this turn and is within this unit’s combat range to be the target. The target can be picked to use a **^^Fight ability immediately after the **^^Fight^^** ability used by this unit has been resolved.</characteristic>
			<characteristic name="Keywords" typeId="12e8-3214-7d8f-1d0f"/>
			<characteristic name="Used By" typeId="1b32-c9d6-3106-166b"/>
		</characteristics>
		<attributes>
			<attribute typeId="5a11-eab3-180c-ddf5" name="Color">Red</attribute>
			<attribute typeId="6d16-c86b-2698-85a4" name="Type">Offensive</attribute>
		</attributes>
		</profile>`;

    const rootNode = xmlParser().parse(xml);
    const ability = parseAbility(rootNode.profile[0]);
    expect(ability.name).toBe("Let's Get Stabbin'!");
    expect(ability.timing).toBe('Reaction: You declared a **^^Fight^^** ability for this unit');
    expect(ability.color).toBe('Red');
    expect(ability.type).toBe('Offensive');
    expect(ability.effect).toContain('Pick a friendly non-**^^Hero Moonclan Infantry^^**');
    expect(ability.declare).toBe('');
    expect(ability.castingValue).toBe('');
    expect(ability.chantingValue).toBe('');
    expect(ability.commandPoints).toBe('');
    expect(ability.keywords).toEqual([]);
  });

  it('spell ability', () => {
    const xml = `
		<profile name="Arcane Bolt" typeId="1234-5678-9abc-def0" typeName="Ability (Spell)" hidden="false" id="abcdef-1234-5678-90ab">
			<characteristics>
				<characteristic name="Timing" typeId="abcd-efgh-ijkl-mnop">Hero Phase</characteristic>
				<characteristic name="Declare" typeId="qrst-uvwx-yzab-cdef">Declare Arcane Bolt</characteristic>
				<characteristic name="Effect" typeId="ghij-klmn-opqr-stuv">Inflict D3 mortal wounds on a target.</characteristic>
				<characteristic name="Casting Value" typeId="wxyz-abcd-efgh-ijkl">5</characteristic>
				<characteristic name="Keywords" typeId="e3d8-f58b-e4e0-8e9d">**^^Spell^^**</characteristic>
			</characteristics>
			<attributes>
				<attribute typeId="mnop-qrst-uvwx-yzab" name="Color">Blue</attribute>
				<attribute typeId="cdef-ghij-klmn-opqr" name="Type">Offensive</attribute>
			</attributes>
		</profile>`;

    const rootNode = xmlParser().parse(xml);
    const ability = parseAbility(rootNode.profile[0]);
    expect(ability.name).toBe('Arcane Bolt');
    expect(ability.timing).toBe('Hero Phase');
    expect(ability.color).toBe('Blue');
    expect(ability.type).toBe('Offensive');
    expect(ability.effect).toContain('Inflict D3 mortal wounds on a target.');
    expect(ability.declare).toBe('Declare Arcane Bolt');
    expect(ability.castingValue).toBe('5');
    expect(ability.chantingValue).toBe('');
    expect(ability.commandPoints).toBe('');
    expect(ability.keywords).toEqual(['**^^Spell^^**']);
  });

  it('prayer ability', () => {
    const xml = `
		<profile name="Blessing of the Ancestors" typeId="1234-5678-9abc-def0" typeName="Ability (Prayer)" hidden="false" id="abcdef-1234-5678-90ab">
			<characteristics>
				<characteristic name="Timing" typeId="abcd-efgh-ijkl-mnop">Hero Phase</characteristic>
				<characteristic name="Declare" typeId="qrst-uvwx-yzab-cdef">Declare Blessing of the Ancestors</characteristic>
				<characteristic name="Effect" typeId="ghij-klmn-opqr-stuv">Grant a ward save of 5+ to a friendly unit.</characteristic>
				<characteristic name="Chanting Value" typeId="wxyz-abcd-efgh-ijkl">3</characteristic>
				<characteristic name="Keywords" typeId="e3d8-f58b-e4e0-8e9d">**^^Prayer^^**</characteristic>
			</characteristics>
			<attributes>
				<attribute typeId="mnop-qrst-uvwx-yzab" name="Color">Green</attribute>
				<attribute typeId="cdef-ghij-klmn-opqr" name="Type">Defensive</attribute>
			</attributes>
		</profile>`;

    const rootNode = xmlParser().parse(xml);
    const ability = parseAbility(rootNode.profile[0]);
    expect(ability.name).toBe('Blessing of the Ancestors');
    expect(ability.timing).toBe('Hero Phase');
    expect(ability.color).toBe('Green');
    expect(ability.type).toBe('Defensive');
    expect(ability.effect).toContain('Grant a ward save of 5+ to a friendly unit.');
    expect(ability.declare).toBe('Declare Blessing of the Ancestors');
    expect(ability.castingValue).toBe('');
    expect(ability.chantingValue).toBe('3');
    expect(ability.commandPoints).toBe('');
    expect(ability.keywords).toEqual(['**^^Prayer^^**']);
  });

  it('command ability', () => {
    const xml = `
		<profile name="Inspiring Presence" typeId="1234-5678-9abc-def0" typeName="Ability (Command)" hidden="false" id="abcdef-1234-5678-90ab">
			<characteristics>
				<characteristic name="Timing" typeId="abcd-efgh-ijkl-mnop">Hero Phase</characteristic>
				<characteristic name="Declare" typeId="qrst-uvwx-yzab-cdef">Declare Inspiring Presence</characteristic>
				<characteristic name="Effect" typeId="ghij-klmn-opqr-stuv">Friendly units can ignore battleshock tests.</characteristic>
				<characteristic name="Cost" typeId="wxyz-abcd-efgh-ijkl">1</characteristic>
			</characteristics>
			<attributes>
				<attribute typeId="mnop-qrst-uvwx-yzab" name="Color">Yellow</attribute>
				<attribute typeId="cdef-ghij-klmn-opqr" name="Type">Support</attribute>
			</attributes>
		</profile>`;

    const rootNode = xmlParser().parse(xml);
    const ability = parseAbility(rootNode.profile[0]);
    expect(ability.name).toBe('Inspiring Presence');
    expect(ability.timing).toBe('Hero Phase');
    expect(ability.color).toBe('Yellow');
    expect(ability.type).toBe('Support');
    expect(ability.effect).toContain('Friendly units can ignore battleshock tests.');
    expect(ability.declare).toBe('Declare Inspiring Presence');
    expect(ability.castingValue).toBe('');
    expect(ability.chantingValue).toBe('');
    expect(ability.commandPoints).toBe('1');
    expect(ability.keywords).toEqual([]);
  });

  it('passive ability', () => {
    const xml = `
        <profile name="Babbling Wand" typeId="907f-a48-6a04-f788" typeName="Ability (Passive)" hidden="false" id="e03b-f725-abaa-2cf">
          <characteristics>
            <characteristic name="Keywords" typeId="b977-7c5e-33b2-428e"/>
            <characteristic name="Effect" typeId="fd7f-888d-3257-a12b">Each time a friendly **^^Moonclan^^** unit wholly within 12&quot; of this unit uses the ‘Redeploy’ command, no command points are spent.</characteristic>
          </characteristics>
          <attributes>
            <attribute typeId="50fe-4f29-6bc3-dcc6" name="Color">Gray</attribute>
            <attribute typeId="bf11-4e10-3ab1-06f4" name="Type">Movement</attribute>
          </attributes>
        </profile>`;

    const rootNode = xmlParser().parse(xml);
    const ability = parseAbility(rootNode.profile[0]);
    expect(ability.name).toBe('Babbling Wand');
    expect(ability.timing).toBe('Passive');
    expect(ability.color).toBe('Gray');
    expect(ability.type).toBe('Movement');
    expect(ability.effect).toContain('Each time a friendly **^^Moonclan^^**');
    expect(ability.declare).toBe('');
    expect(ability.castingValue).toBe('');
    expect(ability.chantingValue).toBe('');
    expect(ability.commandPoints).toBe('');
    expect(ability.keywords).toEqual([]);
  });

  it('parse multiple abilities', () => {
    const xml = `
		<profiles>
			<profile name="Ability 1" typeId="1234-5678-9abc-def0" typeName="Ability (Activated)" hidden="false" id="abcdef-1234-5678-90ab">
				<characteristics>
					<characteristic name="Timing" typeId="abcd-efgh-ijkl-mnop">Hero Phase</characteristic>
					<characteristic name="Effect" typeId="ghij-klmn-opqr-stuv">Effect of Ability 1</characteristic>
				</characteristics>
				<attributes>
					<attribute typeId="mnop-qrst-uvwx-yzab" name="Color">Red</attribute>
					<attribute typeId="cdef-ghij-klmn-opqr" name="Type">Offensive</attribute>
				</attributes>
			</profile>
			<profile name="Ability 2" typeId="2345-6789-abcd-ef01" typeName="Ability (Spell)" hidden="false" id="bcdefg-2345-6789-01ab">
				<characteristics>
					<characteristic name="Timing" typeId="bcde-fghi-jklm-nopq">Hero Phase</characteristic>
					<characteristic name="Effect" typeId="ijkl-mnop-qrst-uvwx">Effect of Ability 2</characteristic>
				</characteristics>
				<attributes>
					<attribute typeId="qrst-uvwx-yzab-cdef" name="Color">Blue</attribute>
					<attribute typeId="ghij-klmn-opqr-stuv" name="Type">Defensive</attribute>
				</attributes>
			</profile>
		</profiles>`;
    const rootNode = xmlParser().parse(xml);
    const abilities = parseAbilities(rootNode.profiles);
    expect(abilities).toHaveLength(2);
    expect(abilities[0].name).toBe('Ability 1');
    expect(abilities[0].timing).toBe('Hero Phase');
    expect(abilities[0].color).toBe('Red');
    expect(abilities[0].type).toBe('Offensive');
    expect(abilities[0].effect).toContain('Effect of Ability 1');
    expect(abilities[1].name).toBe('Ability 2');
    expect(abilities[1].timing).toBe('Hero Phase');
    expect(abilities[1].color).toBe('Blue');
    expect(abilities[1].type).toBe('Defensive');
    expect(abilities[1].effect).toContain('Effect of Ability 2');
    expect(abilities[1].castingValue).toBe('');
    expect(abilities[1].chantingValue).toBe('');
    expect(abilities[1].commandPoints).toBe('');
    expect(abilities[1].keywords).toEqual([]);
  });
});
