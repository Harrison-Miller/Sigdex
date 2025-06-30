import { describe, it, expect } from 'vitest';
import { filterUnitsByRegimentOptions } from '../../src/common/UnitData';

describe('filterUnitsByRegimentOptions', () => {
  const units = [
    { name: 'Hero1', category: 'Hero', keywords: ['HERO'], sub_hero_tags: ['TagA'] },
    { name: 'Infantry1', category: 'Infantry', keywords: ['INFANTRY'] },
    { name: 'Monster1', category: 'Monster', keywords: ['MONSTER'] },
    { name: 'TagHero', category: 'Hero', keywords: ['HERO'], sub_hero_tags: ['SpecialTag'] },
    { name: 'Terrain1', category: 'Faction Terrain', keywords: ['TERRAIN'] },
    { name: 'Manifest1', category: 'Manifestation', keywords: ['MANIFESTATION'] },
  ];

  it('returns all units if no options', () => {
    const result = filterUnitsByRegimentOptions(units as any, []);
    expect(result.map((u) => u.name)).toContain('Hero1');
    expect(result.map((u) => u.name)).toContain('Infantry1');
    expect(result.map((u) => u.name)).toContain('Monster1');
  });

  it('filters out Faction Terrain and Manifestation', () => {
    const result = filterUnitsByRegimentOptions(units as any, [{ name: 'Infantry' }]);
    expect(result.map((u) => u.name)).not.toContain('Terrain1');
    expect(result.map((u) => u.name)).not.toContain('Manifest1');
  });

  it('keeps hero if regiment option matches hero name', () => {
    const result = filterUnitsByRegimentOptions(units as any, [{ name: 'Hero1' }]);
    expect(result.map((u) => u.name)).toContain('Hero1');
  });

  it('keeps hero if regiment option matches sub_hero_tag', () => {
    const result = filterUnitsByRegimentOptions(units as any, [{ name: 'SpecialTag' }]);
    expect(result.map((u) => u.name)).toContain('TagHero');
  });

  it('filters out hero if no regiment option matches', () => {
    const result = filterUnitsByRegimentOptions(units as any, [{ name: 'Infantry' }]);
    expect(result.map((u) => u.name)).not.toContain('Hero1');
    expect(result.map((u) => u.name)).not.toContain('TagHero');
  });

  it('keeps non-hero units if regiment option matches category', () => {
    const result = filterUnitsByRegimentOptions(units as any, [{ name: 'Infantry' }]);
    expect(result.map((u) => u.name)).toContain('Infantry1');
  });

  it('keeps non-hero units if regiment option matches keyword', () => {
    const result = filterUnitsByRegimentOptions(units as any, [{ name: 'MONSTER' }]);
    expect(result.map((u) => u.name)).toContain('Monster1');
  });

  it('keeps non-hero units if regiment option matches name', () => {
    const result = filterUnitsByRegimentOptions(units as any, [{ name: 'Infantry1' }]);
    expect(result.map((u) => u.name)).toContain('Infantry1');
  });

  it('keeps units if regiment option is a compound keyword and all are present', () => {
    const units = [
      { name: 'Stabbas', category: 'Infantry', keywords: ['MOONCLAN', 'INFANTRY'] },
      { name: 'Gitz', category: 'Infantry', keywords: ['GLOOMSPITE', 'INFANTRY'] },
    ];
    const result = filterUnitsByRegimentOptions(units as any, [{ name: 'moonclan infantry' }]);
    expect(result.map((u) => u.name)).toContain('Stabbas');
    expect(result.map((u) => u.name)).not.toContain('Gitz');
  });
});
