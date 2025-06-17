<script setup lang="ts">
import { useRoute } from 'vue-router';
import { loadArmy } from '../army';
import { ref, onMounted, watch, computed } from 'vue';
import type { Unit } from '../common/UnitData';
import ListButton from '../components/ListButton.vue';
import FavoriteToggle from '../components/FavoriteToggle.vue';
import BackButton from '../components/BackButton.vue';
import {
  saveFavorite,
  removeFavorite,
  getFavorites,
  getFavoriteToggleState,
  setFavoriteToggleState,
} from '../favorites';
import { POSSIBLE_CATEGORIES } from '../common/UnitData';

// Accept army as a prop for this view
const props = defineProps<{ army?: string }>();

// Use prop if provided, otherwise fallback to route param
const route = useRoute();
const army = props.army ?? (route.params.army as string);

const CATEGORY_ORDER = POSSIBLE_CATEGORIES;

const categorizedUnits = ref<Record<string, Unit[]>>({});
const unitFavorites = ref<string[]>([]);
const showOnlyFavorites = ref(getFavoriteToggleState('unit'));
const sortMode = ref<'alpha' | 'points'>('alpha');
const sortLabel = computed(() => (sortMode.value === 'alpha' ? 'A-Z' : 'Points'));

function updateShowOnlyFavoritesState(newVal: boolean) {
  showOnlyFavorites.value = newVal;
  setFavoriteToggleState('unit', newVal);
}

onMounted(async () => {
  unitFavorites.value = getFavorites('unit');
  try {
    const armyData = await loadArmy(army);
    const cats: Record<string, Unit[]> = {
      Hero: [],
      Infantry: [],
      Cavalry: [],
      Beast: [],
      Monster: [],
      'War Machine': [],
      Manifestation: [],
      'Faction Terrain': [],
      Other: [],
    };

    for (const unit of armyData.units) {
      const cat = unit.category;
      if (!cat) continue; // Skip units without a category
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(unit);
    }

    // Sort units alphabetically within each category
    for (const cat of CATEGORY_ORDER) {
      if (!cats[cat]) continue; // Skip if category has no units
      if (cats[cat].length === 0) continue; // Skip empty categories
      cats[cat].sort((a, b) => a.name.localeCompare(b.name));
    }
    categorizedUnits.value = cats;
  } catch (e) {
    categorizedUnits.value = {};
  }
});
function toggleUnitFavorite(unit: string, fav: boolean) {
  if (fav) {
    saveFavorite('unit', unit);
    if (!unitFavorites.value.includes(unit)) unitFavorites.value.push(unit);
  } else {
    removeFavorite('unit', unit);
    unitFavorites.value = unitFavorites.value.filter((u) => u !== unit);
  }
}

function toggleSortMode() {
  sortMode.value = sortMode.value === 'alpha' ? 'points' : 'alpha';
}

const filteredUnits = (cat: string) => {
  let units = categorizedUnits.value?.[cat] || [];
  if (showOnlyFavorites.value && hasAnyFavoriteInArmy.value) {
    units = units.filter((x) => unitFavorites.value.includes(x.name));
  }
  if (sortMode.value === 'points') {
    units = [...units].sort((a, b) => {
      if (typeof a.points === 'number' && typeof b.points === 'number') {
        return a.points - b.points;
      } else if (typeof a.points === 'number') {
        return -1;
      } else if (typeof b.points === 'number') {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  } else {
    units = [...units].sort((a, b) => a.name.localeCompare(b.name));
  }
  return units;
};

const hasAnyFavoriteInArmy = computed(() => {
  return Object.values(categorizedUnits.value).some((units) =>
    units.some((u) => unitFavorites.value.includes(u.name))
  );
});

watch(unitFavorites, (favs) => {
  if (showOnlyFavorites.value && favs.length === 0) {
    showOnlyFavorites.value = false;
    setFavoriteToggleState('unit', false);
  }
});
</script>
<template>
  <BackButton :size="36" class="unit-list-back" />
  <div class="list-container">
    <h1>{{ army }}</h1>
    <div class="section-divider"></div>
    <div class="filters-bar">
      <FavoriteToggle
        :model-value="showOnlyFavorites"
        @update:modelValue="updateShowOnlyFavoritesState"
        :disabled="!hasAnyFavoriteInArmy"
      />
      <button
        class="sort-toggle"
        @click="toggleSortMode"
        :title="sortMode === 'alpha' ? 'Sort by points' : 'Sort A-Z'"
      >
        Sort: {{ sortLabel }}
      </button>
    </div>
    <div class="section-divider"></div>
    <template v-for="(cat, idx) in CATEGORY_ORDER" :key="cat">
      <div v-if="filteredUnits(cat).length">
        <div v-if="idx !== 0" class="section-divider"></div>
        <h2 class="section-title">{{ cat }}</h2>
        <ul>
          <li v-for="u in filteredUnits(cat)" :key="u.name">
            <router-link
              :to="{ name: 'UnitDetail', params: { army, unit: u.name } }"
              custom
              v-slot="{ navigate, href }"
            >
              <ListButton
                :label="u.name"
                :favorite="unitFavorites.includes(u.name)"
                :showFavoriteToggle="true"
                :points="u.points"
                @click="navigate"
                @toggle-favorite="(fav) => toggleUnitFavorite(u.name, fav)"
                :href="href"
              />
            </router-link>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
<style src="./list-shared.css" scoped></style>
<style scoped>
.filters-bar {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.2rem;
}

.favorite-toggle {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4em;
  font-size: 1.1em;
  color: #ec4899;
  padding: 0.2em 0.6em;
  border-radius: 4px;
  transition: background 0.2s;
}

.favorite-toggle.active {
  background: #ffe4f3;
}

.favorite-toggle svg {
  vertical-align: middle;
}

.unit-list-header-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.unit-list-back {
  margin-bottom: 0.5rem;
}

.sort-toggle {
  background: #fff;
  border: 1.5px solid #8b0000;
  color: #8b0000;
  font-size: 1em;
  font-weight: 500;
  border-radius: 4px;
  padding: 0.2em 1em;
  margin-left: 0.5em;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border 0.2s;
}

.sort-toggle:hover {
  background: #8b0000;
  color: #fff;
}
</style>
