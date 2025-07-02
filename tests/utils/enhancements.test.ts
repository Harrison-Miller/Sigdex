import { describe, it, expect } from 'vitest';
import { serializeListUnit, deserializeListUnit } from '../../src/common/ArrayData';
import type { ListUnit } from '../../src/common/ListData';

describe('Enhancements serialization', () => {
  it('should serialize and deserialize enhancements correctly', () => {
    const enhancements = new Map([
      ['Enhancement Table 1', 'Enhancement A'],
      ['Enhancement Table 2', 'Enhancement B'],
    ]);

    const unit: ListUnit = {
      name: 'Test Unit',
      enhancements,
    };

    const serialized = serializeListUnit(unit);
    const deserialized = deserializeListUnit(serialized);

    expect(deserialized.enhancements).toBeInstanceOf(Map);
    expect(deserialized.enhancements?.get('Enhancement Table 1')).toBe('Enhancement A');
    expect(deserialized.enhancements?.get('Enhancement Table 2')).toBe('Enhancement B');
    expect(deserialized.enhancements?.size).toBe(2);
  });

  it('should handle undefined enhancements', () => {
    const unit: ListUnit = {
      name: 'Test Unit',
    };

    const serialized = serializeListUnit(unit);
    const deserialized = deserializeListUnit(serialized);

    expect(deserialized.enhancements).toBeUndefined();
  });

  it('should handle empty enhancements map', () => {
    const unit: ListUnit = {
      name: 'Test Unit',
      enhancements: new Map(),
    };

    const serialized = serializeListUnit(unit);
    const deserialized = deserializeListUnit(serialized);

    expect(deserialized.enhancements).toBeInstanceOf(Map);
    expect(deserialized.enhancements?.size).toBe(0);
  });
});
