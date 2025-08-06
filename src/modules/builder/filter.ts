import type { BattleProfile, RegimentOption } from '../../parser/models/battleProfile';

/**
 * Filters units by regiment options in stages:
 * 1. Filter out Faction Terrain and Manifestations.
 * 2. Filter out all heroes except those where the regiment option is the exact name or the regiment option is the exact name of one of the sub_hero_tags.
 * 3. For all other units, filter by includes name, category, or keywords.
 */
export function filterBattleProfilesByRegimentOptions(
  units: BattleProfile[],
  options: RegimentOption[],
  companionUnits: string[]
): BattleProfile[] {
  if (!options || options.length === 0) return units;

  // 1. Filter out Faction Terrain and Manifestations
  let filtered = units.filter((unit) => {
    const category = unit.category?.toLowerCase() || '';
    return category !== 'faction terrain' && category !== 'manifestation';
  });

  // 2. Filter out all heroes except those where the regiment option is the exact name or the regiment option is the exact name of one of the sub_hero_tags
  filtered = filtered.filter((unit) => {
    const category = unit.category?.toLowerCase() || '';
    if (category === 'hero') {
      // Only keep hero if regiment option is exact name or exact sub_hero_tag
      return options.some((opt) => opt.unitNames.includes(unit.name) || unit.regimentTags.some((tag) => opt.subheroCategories.includes(tag)));
    }
    return true;
  });

  // 3. For all other units, filter by includes name, category, or keywords
  filtered = filtered.filter((unit) => {
    const category = unit.category?.toLowerCase() || '';
    if (category === 'hero') return true; // already handled
    return options.some((opt) => unit.matchesRegimentOption(opt));
  });

  // Readd companion units always - make sure not duplicated
  if (companionUnits && companionUnits.length > 0) {
    // first remove them so we don't duplicate
    filtered = filtered.filter((unit) => !companionUnits.includes(unit.name));
    const companions = units.filter((unit) => companionUnits.includes(unit.name));
    filtered.push(...companions);
  }

  return filtered;
}
