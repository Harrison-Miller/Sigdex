import { ref } from 'vue';

/**
 * useFilterBar - composable for managing filter bar state.
 *
 * @returns { searchQuery, showFavorites, sortMode, onFilterBarUpdate }
 */
export function useFilterBar() {
	const searchQuery = ref('');
	const showFavorites = ref(false);
	const sortMode = ref<'alpha' | 'points'>('alpha');

	function onFilterBarUpdate(update: { [key: string]: any }) {
		if (update.searchQuery !== undefined) {
			searchQuery.value = update.searchQuery;
		}
		if (update.favorites !== undefined) {
			showFavorites.value = update.favorites;
		}
		if (update.sortMode !== undefined) {
			sortMode.value = update.sortMode;
		}
	}

	return { searchQuery, showFavorites, sortMode, onFilterBarUpdate };
}
