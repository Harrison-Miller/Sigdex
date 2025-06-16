import { describe, it, expect } from 'vitest';
import { parseUnit, parseUnits } from '../src/parser';

// Test: basic unit with all stats
it('parses a basic unit with all stats', () => {
  const xml = `
  <selectionEntry type="unit" name="TestUnit">
    <profiles>
      <profile name="TestUnit" typeName="Unit">
        <characteristics>
          <characteristic name="Move">5"</characteristic>
          <characteristic name="Health">4</characteristic>
          <characteristic name="Save">6+</characteristic>
          <characteristic name="Control">2</characteristic>
        </characteristics>
      </profile>
    </profiles>
  </selectionEntry>
  `;
  const unit = parseUnit(xml);
  expect(unit.name).toBe('TestUnit');
  expect(unit.stats.move).toBe('5"');
  expect(unit.stats.health).toBe(4);
  expect(unit.stats.save).toBe('6+');
  expect(unit.stats.control).toBe('2');
});

// Test: unit with banishment instead of control
it('parses a unit with banishment stat', () => {
  const xml = `
  <selectionEntry type="unit" name="Banisher">
    <profiles>
      <profile name="Banisher" typeName="Unit">
        <characteristics>
          <characteristic name="Move">6"</characteristic>
          <characteristic name="Health">3</characteristic>
          <characteristic name="Save">5+</characteristic>
          <characteristic name="Banishment">8+</characteristic>
        </characteristics>
      </profile>
    </profiles>
  </selectionEntry>
  `;
  const unit = parseUnit(xml);
  expect(unit.stats.banishment).toBe('8+');
  expect(unit.stats.control).toBeUndefined();
});

// Test: unit with abilities, keywords, and weapons
it('parses a unit with abilities, keywords, and weapons', () => {
  const xml = `
  <selectionEntry type="unit" name="AbilityGuy">
    <profiles>
      <profile name="AbilityGuy" typeName="Unit">
        <characteristics>
          <characteristic name="Move">5"</characteristic>
          <characteristic name="Health">2</characteristic>
          <characteristic name="Save">6+</characteristic>
          <characteristic name="Control">-</characteristic>
        </characteristics>
      </profile>
      <profile name="Ability 1" typeName="Ability">
        <characteristics>
          <characteristic name="Timing">Your Hero Phase</characteristic>
          <characteristic name="Effect">Do something cool.</characteristic>
          <characteristic name="Keywords">Heroic, Magic</characteristic>
        </characteristics>
        <attributes>
          <attribute name="Color">red</attribute>
          <attribute name="Type">Special</attribute>
        </attributes>
      </profile>
      <profile name="Sword" typeName="Melee Weapon">
        <characteristics>
          <characteristic name="Attacks">2</characteristic>
          <characteristic name="Hit">4+</characteristic>
          <characteristic name="Wound">4+</characteristic>
          <characteristic name="Rend">1</characteristic>
          <characteristic name="Damage">1</characteristic>
        </characteristics>
      </profile>
    </profiles>
    <categoryLinks>
      <categoryLink name="Hero" />
      <categoryLink name="Infantry" />
    </categoryLinks>
  </selectionEntry>
  `;
  const unit = parseUnit(xml);
  expect(unit.abilities.length).toBe(1);
  expect(unit.abilities[0].timing).toBe('Your Hero Phase');
  expect(unit.abilities[0].color).toBe('red');
  expect(unit.abilities[0].type).toBe('Special');
  expect(unit.abilities[0].keywords).toEqual(['Heroic', 'Magic']);
  expect(unit.melee_weapons.length).toBe(1);
  expect(unit.melee_weapons[0].name).toBe('Sword');
  expect(unit.keywords).toEqual(['Hero', 'Infantry']);
});

// Test: parseUnits skips Other and Legends
it('parseUnits skips Other and Legends', () => {
  const xml = `
  <root>
    <selectionEntry type="unit" name="HeroUnit">
      <categoryLinks><categoryLink name="Hero" /></categoryLinks>
      <profiles>
        <profile name="HeroUnit" typeName="Unit">
          <characteristics>
            <characteristic name="Move">5"</characteristic>
            <characteristic name="Health">5</characteristic>
            <characteristic name="Save">4+</characteristic>
            <characteristic name="Control">2</characteristic>
          </characteristics>
        </profile>
      </profiles>
    </selectionEntry>
    <selectionEntry type="unit" name="LegendUnit">
      <categoryLinks><categoryLink name="Legends" /></categoryLinks>
      <profiles>
        <profile name="LegendUnit" typeName="Unit">
          <characteristics>
            <characteristic name="Move">5"</characteristic>
            <characteristic name="Health">5</characteristic>
            <characteristic name="Save">4+</characteristic>
            <characteristic name="Control">2</characteristic>
          </characteristics>
        </profile>
      </profiles>
    </selectionEntry>
    <selectionEntry type="unit" name="OtherUnit">
      <categoryLinks><categoryLink name="Other" /></categoryLinks>
      <profiles>
        <profile name="OtherUnit" typeName="Unit">
          <characteristics>
            <characteristic name="Move">5"</characteristic>
            <characteristic name="Health">5</characteristic>
            <characteristic name="Save">4+</characteristic>
            <characteristic name="Control">2</characteristic>
          </characteristics>
        </profile>
      </profiles>
    </selectionEntry>
  </root>
  `;
  const units = parseUnits(xml);
  expect(units.length).toBe(1);
  expect(units[0].name).toBe('HeroUnit');
});
