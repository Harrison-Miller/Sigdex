import { describe, it, expect } from 'vitest';
import { importList, parseUnits } from '../../src/modules/builder/importList';

describe('Import List', () => {
  it('should import a list correctly', async () => {
    const listText = `
	Troggs 1990/2000 pts

Gloomspite Gitz
Troggherd
General's Handbook 2025-26
Drops: 3
Wounds: 142
Spell Lore - Lore of the Clammy Dank
Manifestation Lore - Dank Manifestations

General's Regiment
Dankhold Troggboss (240)
• General
• The Clammy Cowl (20)
• Loontouched (20)
Rockgut Troggoths (380)
• Reinforced
Rockgut Troggoths (380)
• Reinforced
Rockgut Troggoths (190)
Rockgut Troggoths (190)

Regiment 1
Rabble-Rowza (120)
Gobbapalooza (150)
Sporesplatta Fanatics (Scourge of Ghyran) (70)
Dankhold Troggoth (160)

Auxiliary Units
Sporesplatta Fanatics (Scourge of Ghyran) (70)

Faction Terrain
Bad Moon Loonshrine


Created with Sigdex: https://sigdex.io/
Version: 5.2.8
`;

    const list = await importList(listText);
    expect(list.name).toBe('Troggs');
    expect(list.faction).toBe('Gloomspite Gitz');
    expect(list.formation).toBe('Troggherd');
    expect(list.faction_terrain).toBe('Bad Moon Loonshrine');
    expect(list.spell_lore).toBe('Lore of the Clammy Dank');
    expect(list.manifestation_lore).toBe('Dank Manifestations');
    expect(list.regiments.length).toBe(2);
    expect(list.regiments[0].leader.name).toBe('Dankhold Troggboss');
    expect(list.regiments[0].leader.general).toBe(true);
    expect(list.regiments[0].leader.artifact).toBe('The Clammy Cowl');
    expect(list.regiments[0].leader.heroic_trait).toBe('Loontouched');
    expect(list.regiments[0].units.length).toBe(4);

    expect(list.regiments[0].units[0].name).toBe('Rockgut Troggoths');
    expect(list.regiments[0].units[0].reinforced).toBe(true);
    expect(list.regiments[0].units[1].name).toBe('Rockgut Troggoths');
    expect(list.regiments[0].units[1].reinforced).toBe(true);
    expect(list.regiments[0].units[2].name).toBe('Rockgut Troggoths');
    expect(list.regiments[0].units[2].reinforced).toBeUndefined();
    expect(list.regiments[0].units[3].name).toBe('Rockgut Troggoths');
    expect(list.regiments[0].units[3].reinforced).toBeUndefined();

    expect(list.regiments[1].leader.name).toBe('Rabble-Rowza');
    expect(list.regiments[1].units.length).toBe(3);
    expect(list.regiments[1].units[0].name).toBe('Gobbapalooza');
    expect(list.regiments[1].units[1].name).toBe('Sporesplatta Fanatics (Scourge of Ghyran)');
    expect(list.regiments[1].units[2].name).toBe('Dankhold Troggoth');

    console.log(list.auxiliary_units);
    expect(list.auxiliary_units?.length).toBe(1);
    expect(list.auxiliary_units && list.auxiliary_units[0].name).toBe(
      'Sporesplatta Fanatics (Scourge of Ghyran)'
    );
  });
});
