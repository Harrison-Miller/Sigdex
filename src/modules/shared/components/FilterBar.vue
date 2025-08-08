<template>
  <div class="filters-bar">
	<TextInput
		:model-value="searchQuery"
		:placeholder="placeholder"
		class="search-input"
    :show-clear-button="true"
		@update:model-value="(value) => searchQuery = value"
	/>
	<button
		class="sort-toggle"
		:class="sortToggleClass"
		@click="toggleSortMode"
	>
		<FontAwesomeIcon :icon="sortToggleIcon" />
	</button>
	<button
		class="favorite-toggle"
		:class="favoriteToggleClass"
		@click="toggleFavorites"
	>
		<FontAwesomeIcon icon="star" />
	</button>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import TextInput from '../../core/components/TextInput.vue';
import { useFilterBarState } from '../composables/useFilterBarState';

const { placeholder = 'Search...' } = defineProps<{
  placeholder?: string;
}>();

const emit = defineEmits(['update']);

const { state, updateState } = useFilterBarState({
  searchQuery: '',
  favorites: false,
  sortMode: 'alpha' as 'alpha' | 'points',
});

onMounted(() => {
  emit('update', { ...state.value });
});

watch(state, (newState) => {
  emit('update', { ...newState });
}, { deep: true });

const searchQuery = computed({
  get: () => state.value.searchQuery,
  set: (value) => updateState('searchQuery', value),
});

const sortToggleClass = computed(() =>
  state.value.sortMode === 'points' ? 'points' : 'alpha'
);

const sortToggleIcon = computed(() =>
  state.value.sortMode === 'alpha' ? 'arrow-down-a-z' : 'arrow-down-1-9'
);

const favoriteToggleClass = computed(() => ({ active: state.value.favorites }));

function toggleSortMode() {
  const newMode = state.value.sortMode === 'alpha' ? 'points' : 'alpha';
  updateState('sortMode', newMode);
}

function toggleFavorites() {
  updateState('favorites', !state.value.favorites);
}
</script>

<style scoped>
.filters-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 0.4rem;
  margin: 0;
  margin-bottom: 1.2rem;
  width: 100%;
}

.search-input {
  flex: 1;
  /* max-width: 600px; */
}

.sort-toggle,
.favorite-toggle {
  background: var(--bg-sub);
  border: 1.5px solid var(--border-color);
  color: var(--text-main);
  font-size: 1.5em;
  font-weight: 500;
  border-radius: 4px;
  padding: 0.3em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s,
    color 0.2s,
    border 0.2s;
}
.sort-toggle.points {
  background: var(--color-red);
  color: #fff;
  border: 1.5px solid var(--color-red);
}
.favorite-toggle.active {
  background: var(--color-yellow);
  color: #fff;
  border: 1.5px solid var(--color-yellow);
}
.sort-toggle.alpha {
  background: var(--bg-sub);
  color: var(--text-main);
  border: 1.5px solid var(--border-color);
}
.sort-toggle:hover,
.favorite-toggle:hover {
  filter: brightness(0.95);
}
</style>
