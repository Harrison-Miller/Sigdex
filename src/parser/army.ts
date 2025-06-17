import { Army } from '../common/ArmyData';
import { parsePoints } from './points';
import { parseUnits } from './units';

export function parseArmy(unitLibrary: Element, armyInfo: Element): Army {
  const points = parsePoints(armyInfo);
  const units = parseUnits(unitLibrary, points);
  return new Army(units);
}
