<script setup lang="ts">
import { useRoute } from 'vue-router';
import { loadArmy } from '../army';
import { ref, onMounted, watch, computed } from 'vue';
import type { Unit } from '../common/UnitData';
import ListButton from '../components/ListButton.vue';
import FavoriteToggle from '../components/FavoriteToggle.vue';
import BackButton from '../components/BackButton.vue';
import ArmyRules from '../components/ArmyRules.vue';
import {
  saveFavorite,
  removeFavorite,
  getFavorites,
  getArmyUnitFavoriteToggleState,
  setArmyUnitFavoriteToggleState,
} from '../favorites';
import { POSSIBLE_CATEGORIES } from '../common/UnitData';
import Section from '../components/Section.vue';

// Accept army as a prop for this view
const props = defineProps<{ army?: string }>();

// Use prop if provided, otherwise fallback to route param
const route = useRoute();
const army = props.army ?? (route.params.army as string);

const CATEGORY_ORDER = POSSIBLE_CATEGORIES;

const categorizedUnits = ref<Record<string, Unit[]>>({});
const unitFavorites = ref<string[]>([]);
const showOnlyFavorites = ref(getArmyUnitFavoriteToggleState(army));
const sortMode = ref<'alpha' | 'points'>('alpha');
const sortLabel = computed(() => (sortMode.value === 'alpha' ? 'A-Z' : 'Points'));
const activeTab = ref<'warscrolls' | 'rules'>('warscrolls');
const loadedArmy = ref<any>(null);

function updateShowOnlyFavoritesState(newVal: boolean) {
  showOnlyFavorites.value = newVal;
  setArmyUnitFavoriteToggleState(army, newVal);
}

onMounted(async () => {
  unitFavorites.value = getFavorites('unit');
  showOnlyFavorites.value = getArmyUnitFavoriteToggleState(army);
  try {
    const armyData = await loadArmy(army);
    loadedArmy.value = armyData;
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
    loadedArmy.value = null;
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
    setArmyUnitFavoriteToggleState(army, false);
  }
});
</script>
<template>
  <BackButton :size="36" class="unit-list-back" />
  <div class="list-container">
    <h1>{{ army }}</h1>
    <div class="tab-bar">
      <button :class="{ active: activeTab === 'warscrolls' }" @click="activeTab = 'warscrolls'">
        Warscrolls
      </button>
      <button :class="{ active: activeTab === 'rules' }" @click="activeTab = 'rules'">Rules</button>
    </div>
    <div v-if="activeTab === 'warscrolls'">
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
      <template v-for="cat in CATEGORY_ORDER" :key="cat">
        <Section v-if="filteredUnits(cat).length">
          <template #title>{{ cat }}</template>
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
        </Section>
      </template>
    </div>
    <div v-else-if="activeTab === 'rules'">
      <ArmyRules :army="loadedArmy" />
    </div>
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

.tab-bar {
  display: flex;
  gap: 0;
  margin-bottom: 1.2rem;
  width: 100%;
}

.tab-bar button {
  flex: 1 1 0;
  padding: 0.5em 1.2em;
  border: none;
  background: #eee;
  color: #333;
  font-weight: 600;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  transition: background 0.2s;
  text-align: center;
}

.tab-bar button.active {
  background: #fff;
  border-bottom: 2px solid #222;
  color: #222;
}

.army-rules-section {
  padding: 1.5em;
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
</style>
