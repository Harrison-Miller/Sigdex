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
  const optionNames = options.map((opt) => opt.name.toLowerCase());

  // 1. Filter out Faction Terrain and Manifestations
  let filtered = units.filter((unit) => {
    const category = unit.category?.toLowerCase() || '';
    return category !== 'faction terrain' && category !== 'manifestation';
  });

  // 2. Filter out all heroes except those where the regiment option is the exact name or the regiment option is the exact name of one of the sub_hero_tags
  filtered = filtered.filter((unit) => {
    const category = unit.category?.toLowerCase() || '';
    if (category === 'hero') {
      const name = unit.name?.toLowerCase() || '';
      const tags = (unit.regimentTags || []).map((t) => t.toLowerCase());
      // Only keep hero if regiment option is exact name or exact sub_hero_tag
      return optionNames.some((optName) => name === optName || tags.includes(optName));
    }
    return true;
  });

  // 3. For all other units, filter by includes name, category, or keywords
  filtered = filtered.filter((unit) => {
    const category = unit.category?.toLowerCase() || '';
    if (category === 'hero') return true; // already handled
    const name = unit.name?.toLowerCase() || '';
    const keywords = (unit.keywords || []).map((k) => k.toLowerCase());
    // Compound option support: if option is multiple words, require all to be present in keywords
    return optionNames.some((optName) => {
      if (optName.includes(' ')) {
        const parts = optName.split(/\s+/);
        if (parts.every((part) => keywords.includes(part))) {
          return true;
        }
      }
      return (
        name.includes(optName) ||
        category.includes(optName) ||
        keywords.some((kw) => kw.includes(optName))
      );
    });
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
