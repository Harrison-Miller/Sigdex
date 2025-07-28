// favorites.ts
// Utility for saving and retrieving favorites for armies and units

export const SHOW_LEGENDS_KEY = 'sigdex-show-legends';

export const FAVORITES_KEY = 'sigdex-favorites';

export type FavoriteType = 'army' | 'unit';

export function clearAllFavorites() {
  localStorage.removeItem(FAVORITES_KEY);
  // Optionally clear favorite toggle states
  localStorage.removeItem('sigdex-army-fav-toggle');
  localStorage.removeItem('sigdex-unit-fav-toggle');
  // Remove all per-army unit favorite toggles
  Object.keys(localStorage)
    .filter((k) => k.startsWith('sigdex-unit-fav-toggle:'))
    .forEach((k) => localStorage.removeItem(k));
}
