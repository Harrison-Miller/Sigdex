import { Army } from '../common/ArmyData';
import { parseArtifacts } from './artifacts';
import { parseHeroicTraits } from './heroictraits';
import { parseArmyManifestationLores, parseArmyPrayerLores, parseArmySpellLores } from './lores';
import { parsePoints } from './points';
import { parseUnits } from './units';

export function parseArmy(unitLibrary: Element, armyInfo: Element): Army {
  const points = parsePoints(armyInfo);
  const units = parseUnits(unitLibrary, points);

  const artifacts = parseArtifacts(armyInfo);
  const heroicTraits = parseHeroicTraits(armyInfo);

  const manifestationLores = parseArmyManifestationLores(armyInfo);
  const spellLores = parseArmySpellLores(armyInfo);
  const prayerLores = parseArmyPrayerLores(armyInfo);

  return new Army(units, artifacts, heroicTraits, manifestationLores, spellLores, prayerLores);
}
