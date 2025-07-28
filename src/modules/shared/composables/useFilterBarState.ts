import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

// In-memory cache for the session (per tab)
const filterBarState = new Map<string, { searchQuery: string; favorites: boolean; sortMode: 'alpha' | 'points' }>();

/**
 * useFilterBarState - composable for persistent filter bar state per route.
 *
 * @param defaultState Default state for the filter bar
 * @returns { state, updateState }
 */
export function useFilterBarState(defaultState: { searchQuery: string; favorites: boolean; sortMode: 'alpha' | 'points' }) {
	const route = useRoute();
	const stateKey = route.fullPath;

	// Initialize state with default values or cached values
	const state = ref(
		filterBarState.has(stateKey)
			? filterBarState.get(stateKey)!
			: { ...defaultState }
	);

	// Update the cache whenever the state changes
	function updateState<K extends keyof typeof defaultState>(key: K, value: typeof defaultState[K]) {
		state.value[key] = value;
		filterBarState.set(stateKey, { ...state.value });
	}

	// Watch for route changes and update state accordingly
	watch(
		() => route.fullPath,
		(newPath) => {
			if (filterBarState.has(newPath)) {
				state.value = { ...filterBarState.get(newPath)! };
			} else {
				state.value = { ...defaultState };
			}
		}
	);

	return { state, updateState };
}
