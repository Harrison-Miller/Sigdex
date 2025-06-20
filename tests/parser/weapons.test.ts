import { describe, it, expect } from 'vitest';
import { DOMParser } from 'xmldom';
import { parseWeapons } from '../../src/parser/weapons';

describe('parseWeapons', () => {
  it('simple', () => {
    const xml = `
		<selectionEntry type="unit" name="AbilityGuy">
			<profiles>
				<profile name="Sword" typeName="Melee Weapon">
					<characteristics>
						<characteristic name="Atk">2</characteristic>
						<characteristic name="Hit">4+</characteristic>
						<characteristic name="Wnd">4+</characteristic>
						<characteristic name="Rnd">1</characteristic>
						<characteristic name="Dmg">1</characteristic>
					</characteristics>
				</profile>
			</profiles>
		</selectionEntry>
			`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const weapons = parseWeapons(root);
    expect(weapons.ranged_weapons.length).toBe(0);
    expect(weapons.melee_weapons.length).toBe(1);
    expect(weapons.melee_weapons[0].name).toBe('Sword');
    expect(weapons.melee_weapons[0].attacks).toBe('2');
    expect(weapons.melee_weapons[0].hit).toBe('4+');
    expect(weapons.melee_weapons[0].wound).toBe('4+');
    expect(weapons.melee_weapons[0].rend).toBe('1');
    expect(weapons.melee_weapons[0].damage).toBe('1');
    expect(weapons.melee_weapons[0].abilities).toEqual([]);
    expect(weapons.constraints).toBeUndefined();
  });

  it('with abilities', () => {
    const xml = `
		<selectionEntry type="unit" name="AbilityGuy">
			<profiles>
				<profile name="Sword" typeName="Melee Weapon">
					<characteristics>
						<characteristic name="Atk">2</characteristic>
						<characteristic name="Hit">4+</characteristic>
						<characteristic name="Wnd">4+</characteristic>
						<characteristic name="Rnd">1</characteristic>
						<characteristic name="Dmg">1</characteristic>
						<characteristic name="Ability">Crit Mortal,Sharp</characteristic>
					</characteristics>
				</profile>
			</profiles>
			<categoryLinks><categoryLink name="Hero" /></categoryLinks>
		</selectionEntry>
			`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const weapons = parseWeapons(root);
    expect(weapons.ranged_weapons.length).toBe(0);
    expect(weapons.melee_weapons.length).toBe(1);
    expect(weapons.melee_weapons[0].name).toBe('Sword');
    expect(weapons.melee_weapons[0].attacks).toBe('2');
    expect(weapons.melee_weapons[0].hit).toBe('4+');
    expect(weapons.melee_weapons[0].wound).toBe('4+');
    expect(weapons.melee_weapons[0].rend).toBe('1');
    expect(weapons.melee_weapons[0].damage).toBe('1');
    expect(weapons.melee_weapons[0].abilities.length).toBe(2);
    expect(weapons.melee_weapons[0].abilities).toContain('Crit Mortal');
    expect(weapons.melee_weapons[0].abilities).toContain('Sharp');
    expect(weapons.constraints).toBeUndefined();
  });

  it('multiple weapons of each type', () => {
    const xml = `
		<selectionEntry type="unit" name="WeaponGuy">
			<profiles>
				<profile name="Sword" typeName="Melee Weapon">
					<characteristics>
						<characteristic name="Atk">2</characteristic>
						<characteristic name="Hit">4+</characteristic>
						<characteristic name="Wnd">4+</characteristic>
						<characteristic name="Rnd">1</characteristic>
						<characteristic name="Dmg">1</characteristic>
					</characteristics>
				</profile>
				<profile name="Dagger" typeName="Melee Weapon">
					<characteristics>
						<characteristic name="Atk">1</characteristic>
						<characteristic name="Hit">3+</characteristic>
						<characteristic name="Wnd">3+</characteristic>
						<characteristic name="Rnd">1</characteristic>
						<characteristic name="Dmg">3</characteristic>
						<characteristic name="Ability">Extra Sharp</characteristic>
					</characteristics>
				</profile>
				<profile name="Bow" typeName="Ranged Weapon">
					<characteristics>
						<characteristic name="Atk">3</characteristic>
						<characteristic name="Hit">5+</characteristic>
						<characteristic name="Wnd">4+</characteristic>
						<characteristic name="Rnd">-</characteristic>
						<characteristic name="Dmg">1</characteristic>
					</characteristics>
				</profile>
				<profile name="Thrown Dagger" typeName="Ranged Weapon">
					<characteristics>
						<characteristic name="Atk">1</characteristic>
						<characteristic name="Hit">4+</characteristic>
						<characteristic name="Wnd">3+</characteristic>
						<characteristic name="Rnd">0</characteristic>
						<characteristic name="Dmg">2</characteristic>
						<characteristic name="Ability">Quick Throw</characteristic>
					</characteristics>
				</profile>
			</profiles>
			<categoryLinks><categoryLink name="Hero" /></categoryLinks>
		</selectionEntry>
			`;
    const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
    const weapons = parseWeapons(root);
    expect(weapons.ranged_weapons.length).toBe(2);
    expect(weapons.ranged_weapons[0].name).toBe('Bow');
    expect(weapons.ranged_weapons[0].attacks).toBe('3');
    expect(weapons.ranged_weapons[0].hit).toBe('5+');
    expect(weapons.ranged_weapons[0].wound).toBe('4+');
    expect(weapons.ranged_weapons[0].rend).toBe('-');
    expect(weapons.ranged_weapons[0].damage).toBe('1');
    expect(weapons.ranged_weapons[0].abilities).toEqual([]);
    expect(weapons.ranged_weapons[1].name).toBe('Thrown Dagger');
    expect(weapons.ranged_weapons[1].attacks).toBe('1');
    expect(weapons.ranged_weapons[1].hit).toBe('4+');
    expect(weapons.ranged_weapons[1].wound).toBe('3+');
    expect(weapons.ranged_weapons[1].rend).toBe('0');
    expect(weapons.ranged_weapons[1].damage).toBe('2');
    expect(weapons.ranged_weapons[1].abilities).toEqual(['Quick Throw']);
    expect(weapons.melee_weapons.length).toBe(2);
    expect(weapons.melee_weapons[0].name).toBe('Sword');
    expect(weapons.melee_weapons[0].attacks).toBe('2');
    expect(weapons.melee_weapons[0].hit).toBe('4+');
    expect(weapons.melee_weapons[0].wound).toBe('4+');
    expect(weapons.melee_weapons[0].rend).toBe('1');
    expect(weapons.melee_weapons[0].damage).toBe('1');
    expect(weapons.melee_weapons[0].abilities).toEqual([]);
    expect(weapons.melee_weapons[1].name).toBe('Dagger');
    expect(weapons.melee_weapons[1].attacks).toBe('1');
    expect(weapons.melee_weapons[1].hit).toBe('3+');
    expect(weapons.melee_weapons[1].wound).toBe('3+');
    expect(weapons.melee_weapons[1].rend).toBe('1');
    expect(weapons.melee_weapons[1].damage).toBe('3');
    expect(weapons.melee_weapons[1].abilities).toEqual(['Extra Sharp']);
    expect(weapons.constraints).toBeUndefined();
  });
});
