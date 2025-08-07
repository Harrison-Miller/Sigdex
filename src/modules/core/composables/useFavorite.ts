import { useStorage } from '@vueuse/core';
import { FAVORITES_KEY } from '../../../favorites';

/**
 * useFavorite - composable for managing favorite state.
 *
 * @param type The type of favorite (e.g., 'army', 'unit')
 * @param key The unique key for the favorite item
 * @returns { isFavorited, toggleFavorite }
 */
export function useFavorite(type: 'army' | 'unit' | 'faq', key: string) {
	const isFavorited = useStorage(
		FAVORITES_KEY,
		false,
		localStorage,
		{
			serializer: {
				read: (v: string) => {
					try {
						const allFavorites = JSON.parse(v) as Record<string, string[]>;
						return allFavorites[type]?.includes(key) ?? false;
					} catch {
						return false;
					}
				},
				write: (val: boolean) => {
					const stored = localStorage.getItem(FAVORITES_KEY);
					let allFavorites: Record<string, string[]> = {};
					if (stored) {
						try {
							allFavorites = JSON.parse(stored);
						} catch {
							allFavorites = {};
						}
					}

					if (val) {
						allFavorites[type] = [...(allFavorites[type] || []), key];
					} else {
						allFavorites[type] = (allFavorites[type] || []).filter((item) => item !== key);
					}

					return JSON.stringify(allFavorites);
				},
			},
		}
	);

	function toggleFavorite() {
		isFavorited.value = !isFavorited.value;
	}

	return { isFavorited, toggleFavorite };
}

/**
 * useFavorites - composable for managing all favorites of a given type.
 *
 * @param type The type of favorite (e.g., 'army' | 'unit')
 * @returns { favorites }
 */
export function useFavorites(type: 'army' | 'unit' | 'faq') {
	const favorites = useStorage<string[]>(
		FAVORITES_KEY, [], localStorage,
		{
			serializer: {
				read: (v: string) => {
					try {
						const allFavorites = JSON.parse(v) as Record<string, string[]>;
						return allFavorites[type] ?? [];
					} catch {
						return [];
					}
				},
				write: (arr: string[]) => {
					const stored = localStorage.getItem(FAVORITES_KEY);
					let allFavorites: Record<string, string[]> = {};
					if (stored) {
						try {
							allFavorites = JSON.parse(stored);
						} catch {
							allFavorites = {};
						}
					}
					allFavorites[type] = arr;
					return JSON.stringify(allFavorites);
				}
			}
		}
	);

	return { favorites };
}
