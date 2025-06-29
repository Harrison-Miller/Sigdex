import { Army } from '../common/ArmyData';
import { parseArtifacts } from './artifacts';
import { parseHeroicTraits } from './heroictraits';
import { parseArmyManifestationLores, parseArmyPrayerLores, parseArmySpellLores } from './lores';
import { parsePoints } from './points';
import { parseUnits } from './units';
import { parseBattleTraits } from './battletraits';
import { parseBattleFormations } from './formations';
import { parseCategories } from './categories';

export function parseArmy(gameInfo: Element, unitLibrary: Element, armyInfo: Element): Army {
  const categories = parseCategories(gameInfo);
  const armyCategories = parseCategories(armyInfo);
  for (const [id, name] of armyCategories) {
    if (!categories.has(id)) {
      categories.set(id, name);
    }
  }

  const points = parsePoints(armyInfo);
  const units = parseUnits(unitLibrary, armyInfo, points, categories);

  const artifacts = parseArtifacts(armyInfo);
  const heroicTraits = parseHeroicTraits(armyInfo);

  const manifestationLores = parseArmyManifestationLores(armyInfo);
  const spellLores = parseArmySpellLores(armyInfo);
  const prayerLores = parseArmyPrayerLores(armyInfo);

  const battleTraits = parseBattleTraits(armyInfo);
  const formations = parseBattleFormations(armyInfo);

  return new Army(
    units,
    artifacts,
    heroicTraits,
    manifestationLores,
    spellLores,
    prayerLores,
    battleTraits,
    formations
  );
}
