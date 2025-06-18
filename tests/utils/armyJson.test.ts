import { describe, it, expect } from 'vitest';
import { Army } from '../../src/common/ArmyData';
import type { Ability } from '../../src/common/Ability';

describe('Army toJSON/fromJson', () => {
  it('serializes and deserializes artifacts Map correctly', () => {
    const ability: Ability = {
      name: 'Test Artifact Ability',
      timing: 'Any',
      color: 'blue',
      type: 'Special',
      text: 'Test artifact ability',
      keywords: ['ARTIFACT'],
    };
    const artifacts = new Map<string, Ability[]>([['Artifact Group', [ability]]]);
    const army = new Army([], artifacts);

    // Serialize
    const json = JSON.stringify(army.toJSON());
    // Deserialize
    const parsed = JSON.parse(json);
    const restored = Army.fromJson(parsed);

    expect(restored.artifacts).toBeInstanceOf(Map);
    expect(restored.artifacts.size).toBe(1);
    expect(restored.artifacts.get('Artifact Group')).toEqual([ability]);
  });
});
