import type { List } from '../../list/models/list';
import type { ListValidator } from '../validator';

export const sogChecks: ListValidator[] = [checkBothSoGAndRegularUnitNotPresent];

function checkBothSoGAndRegularUnitNotPresent(list: List): string[] {
  const errors: string[] = [];

  const units = list.allUnits().map((unit) => unit.name);

  const scourgePattern = /(.*) \(Scourge of Ghyran\)$/;
  const scourgeMap = new Map<string, boolean>();
  for (const name of units) {
    const match = name.match(scourgePattern);
    if (match) {
      scourgeMap.set(match[1], true);
    }
  }
  for (const name of units) {
    if (!name.endsWith(' (Scourge of Ghyran)') && scourgeMap.has(name)) {
      errors.push(
        `Cannot include both '${name}' and '${name} (Scourge of Ghyran)' in the same list.`
      );
    }
  }
  return errors;
}