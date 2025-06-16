import { describe, it, expect } from 'vitest';
import { parseStats, parseAbilities, parseWeapons, parseKeywords } from '../src/parser';

const makeProfile = (xml: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  return doc.documentElement;
};

describe('parseStats', () => {
  it('parses move, health, save, control, banishment', () => {
    const xml = `<profile typeName="Unit"><characteristics>
      <characteristic name="Move">6"</characteristic>
      <characteristic name="Health">5</characteristic>
      <characteristic name="Save">4+</characteristic>
      <characteristic name="Control">2</characteristic>
      <characteristic name="Banishment">7+</characteristic>
    </characteristics></profile>`;
    const stats = parseStats(makeProfile(xml));
    expect(stats.move).toBe('6"');
    expect(stats.health).toBe(5);
    expect(stats.save).toBe('4+');
    expect(stats.control).toBe('2');
    expect(stats.banishment).toBe('7+');
  });
});

describe('parseAbilities', () => {
  it('parses ability with all fields', () => {
    const xml = `<profile typeName="Ability" name="Test Ability">
      <characteristics>
        <characteristic name="Timing">Hero Phase</characteristic>
        <characteristic name="Effect">Do something</characteristic>
        <characteristic name="Declare">Declare text</characteristic>
        <characteristic name="Casting Value">7</characteristic>
        <characteristic name="Cost">2</characteristic>
        <characteristic name="Keywords">Magic, Heroic</characteristic>
      </characteristics>
      <attributes>
        <attribute name="Color">red</attribute>
        <attribute name="Type">Special</attribute>
      </attributes>
    </profile>`;
    const abilities = parseAbilities(makeProfile(`<root>${xml}</root>`));
    expect(abilities.length).toBe(1);
    const a = abilities[0];
    expect(a.name).toBe('Test Ability');
    expect(a.timing).toBe('Hero Phase');
    expect(a.text).toBe('Do something');
    expect(a.declare).toBe('Declare text');
    expect(a.castingValue).toBe('7');
    expect(a.cost).toBe('2');
    expect(a.keywords).toEqual(['Magic', 'Heroic']);
    expect(a.color).toBe('red');
    expect(a.type).toBe('Special');
  });
});

describe('parseWeapons', () => {
  it('parses melee and ranged weapons', () => {
    const xml = `
      <profile name="Sword" typeName="Melee Weapon">
        <characteristics>
          <characteristic name="Attacks">2</characteristic>
          <characteristic name="Hit">4+</characteristic>
          <characteristic name="Wound">4+</characteristic>
          <characteristic name="Rend">1</characteristic>
          <characteristic name="Damage">1</characteristic>
        </characteristics>
      </profile>
      <profile name="Bow" typeName="Ranged Weapon">
        <characteristics>
          <characteristic name="Attacks">1</characteristic>
          <characteristic name="Hit">5+</characteristic>
          <characteristic name="Wound">4+</characteristic>
          <characteristic name="Rend">0</characteristic>
          <characteristic name="Damage">1</characteristic>
        </characteristics>
      </profile>
    `;
    const root = makeProfile(`<root>${xml}</root>`);
    const { melee_weapons, ranged_weapons } = parseWeapons(root);
    expect(melee_weapons.length).toBe(1);
    expect(melee_weapons[0].name).toBe('Sword');
    expect(ranged_weapons.length).toBe(1);
    expect(ranged_weapons[0].name).toBe('Bow');
  });
});

describe('parseKeywords', () => {
  it('parses keywords from categoryLinks', () => {
    const xml = `<root>
      <categoryLink name="Hero" />
      <categoryLink name="Infantry" />
    </root>`;
    const root = makeProfile(xml);
    const keywords = parseKeywords(root);
    expect(keywords).toEqual(['Hero', 'Infantry']);
  });
});
