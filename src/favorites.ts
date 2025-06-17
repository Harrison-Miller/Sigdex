// favorites.ts
// Utility for saving and retrieving favorites for armies and units

const FAVORITES_KEY = 'sigdex-favorites';

export type FavoriteType = 'army' | 'unit';

export function getFavorites(type: FavoriteType): string[] {
  const data = localStorage.getItem(FAVORITES_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed[type]) ? parsed[type] : [];
  } catch {
    return [];
  }
}

export function saveFavorite(type: FavoriteType, name: string) {
  const data = localStorage.getItem(FAVORITES_KEY);
  let parsed: Record<string, string[]> = { army: [], unit: [] };
  if (data) {
    try {
      parsed = JSON.parse(data);
    } catch {}
  }
  if (!parsed[type].includes(name)) {
    parsed[type].push(name);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(parsed));
  }
}

export function removeFavorite(type: FavoriteType, name: string) {
  const data = localStorage.getItem(FAVORITES_KEY);
  let parsed: Record<string, string[]> = { army: [], unit: [] };
  if (data) {
    try {
      parsed = JSON.parse(data);
    } catch {}
  }
  parsed[type] = parsed[type].filter((n) => n !== name);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(parsed));
}

export function isFavorite(type: FavoriteType, name: string): boolean {
  return getFavorites(type).includes(name);
}

export function getFavoriteToggleState(type: FavoriteType): boolean {
  return localStorage.getItem(`sigdex-${type}-fav-toggle`) === 'true';
}

export function setFavoriteToggleState(type: FavoriteType, value: boolean) {
  localStorage.setItem(`sigdex-${type}-fav-toggle`, String(value));
}

export function clearAllFavorites() {
  localStorage.removeItem(FAVORITES_KEY);
  // Optionally clear favorite toggle states
  localStorage.removeItem('sigdex-army-fav-toggle');
  localStorage.removeItem('sigdex-unit-fav-toggle');
}
