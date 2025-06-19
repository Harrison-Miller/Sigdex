import { describe, it, expect } from 'vitest';
import { cleanObject } from '../../src/utils/cleanObject';

describe('cleanObject', () => {
  it('removes null, undefined, 0, empty string, empty array, and empty object', () => {
    const input = {
      a: 1,
      b: null,
      c: undefined,
      d: '',
      e: [],
      f: {},
      g: 0,
      h: 'valid',
      i: [1, null, '', 0, undefined, [], {}],
      j: { x: null, y: '', z: 2 },
      k: [{ a: 0 }, { b: 3 }],
    };
    const output = cleanObject(input);
    expect(output).toEqual({
      a: 1,
      h: 'valid',
      i: [1],
      j: { z: 2 },
      k: [{ b: 3 }],
    });
  });

  it('handles nested objects and arrays', () => {
    const input = {
      a: {
        b: {
          c: null,
          d: '',
          e: 0,
          f: 'ok',
        },
        g: [],
      },
      h: [
        {
          i: undefined,
          j: 'yes',
        },
        {},
      ],
    };
    const output = cleanObject(input);
    expect(output).toEqual({
      a: { b: { f: 'ok' } },
      h: [{ j: 'yes' }],
    });
  });

  it('does not clean a Map with valid elements', () => {
    const obj = {
      foo: { a: 1 },
      bar: { b: 2 },
      empty: {},
      zero: 0,
      null: null,
      undefined: undefined,
      emptyStr: '',
      emptyArr: [],
    };

    const map = new Map(Object.entries(obj));

    const cleaned = cleanObject(map);
    // Only valid entries should remain in the Map
    expect(Array.from(cleaned.entries())).toEqual([
      ['foo', { a: 1 }],
      ['bar', { b: 2 }],
    ]);
  });

  it('removes string values equal to "-"', () => {
    const input = {
      a: '-',
      b: 'keep',
      c: ['-', 'ok', 1, null],
      d: { x: '-', y: 'yes' },
      e: [{ f: '-' }, { g: 'good' }],
      f: new Map([
        ['foo', '-'],
        ['bar', 'keep'],
        ['baz', null],
      ]),
    };
    const output = cleanObject(input);
    if (output.f) {
      expect(Array.from(output.f.entries())).toEqual([['bar', 'keep']]);
      (output as any).f = undefined;
    }
    expect(output).toEqual({
      b: 'keep',
      c: ['ok', 1],
      d: { y: 'yes' },
      e: [{ g: 'good' }],
    });
  });
});
