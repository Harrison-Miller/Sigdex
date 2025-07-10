import { describe, expect, it } from 'vitest';
import { xmlParser } from '../../src/parser/util';
import { ARKANAUTS_XML } from './arkanauts';
import { parseModels } from '../../src/parser/parse/parseModels';

describe('parseModels', () => {
  it('arkanauts parse', () => {
    const xml = xmlParser().parse(ARKANAUTS_XML);
    const models = parseModels(xml.selectionEntry[0]);
    expect(models.size).toBe(1);
    const model = models.get('Arkanaut');
    expect(model).toBeDefined();
    if (!model) {
      throw new Error('Model not found');
    }

    expect(model.count).toBe(10);
    expect(model.weapons.size).toBe(5);

    const skypike = model.weapons.get('Skypike');
    expect(skypike).toBeDefined();
    expect(skypike?.type).toBe('optional');
    expect(skypike?.max).toBe(1);
    expect(skypike?.replaces).toEqual(['Privateer Pistol', 'Arkanaut Hand Weapon']);

    const pistol = model.weapons.get('Privateer Pistol');
    expect(pistol).toBeDefined();
    expect(pistol?.type).toBe('default');
    expect(pistol?.replaces).toEqual([]);

    const hand = model.weapons.get('Arkanaut Hand Weapon');
    expect(hand).toBeDefined();
    expect(hand?.type).toBe('default');

    const volleygun = model.weapons.get('Aethermatic Volley Gun');
    expect(volleygun).toBeDefined();
    expect(volleygun?.type).toBe('optional');
    expect(volleygun?.max).toBe(1);
    expect(volleygun?.replaces).toEqual(['Privateer Pistol']);

    const skyhook = model.weapons.get('Light Skyhook');
    expect(skyhook).toBeDefined();
    expect(skyhook?.type).toBe('optional');
    expect(skyhook?.max).toBe(1);
    expect(skyhook?.replaces).toEqual(['Privateer Pistol']);
  });
});
