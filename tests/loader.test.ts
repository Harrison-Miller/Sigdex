import { describe, it, expect } from 'vitest';
import { loadArmy } from '../src/army';

describe('loadArmy', () => {
  it('loads more than 2 units for a valid army', async () => {
    const army = await loadArmy('Gloomspite Gitz');
    expect(army.units.length).toBeGreaterThan(2);
  });
});
