import type { List } from '../../list/models/list';
import type { ListValidator } from '../validator';

export const highlanderChecks: ListValidator[] = [checkNoDuplicateUnits];

// Highlander just means that all units are effectively unique.
// This means that no two units can have the same name.
function checkNoDuplicateUnits(list: List): string[] {
  const unitCounts: Map<string, number> = new Map();

  const units = list.allUnits();

  for (const unit of units) {
    // add up
    const count = unitCounts.get(unit.name) || 0;
    unitCounts.set(unit.name, count + 1);
  }

  const duplicateUnits = Array.from(unitCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([name, count]) => `${name} (${count})`);

  if (duplicateUnits.length > 0) {
    return [`No duplicate units allowed in a highlander list: ${duplicateUnits.join(', ')}`];
  }

  return [];
}
