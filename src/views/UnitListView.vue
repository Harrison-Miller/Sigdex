<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { loadArmy } from '../army';
import { ref, onMounted, watch, computed } from 'vue';
import type { Unit } from '../UnitData';
import ListButton from '../components/ListButton.vue';
import FavoriteToggle from '../components/FavoriteToggle.vue';
import BackButton from '../components/BackButton.vue';
import { isFavorite, saveFavorite, removeFavorite, getFavorites, getFavoriteToggleState, setFavoriteToggleState } from '../favorites';

// Accept army as a prop for this view
const props = defineProps<{ army?: string }>();

// Use prop if provided, otherwise fallback to route param
const route = useRoute();
const router = useRouter();
const army = props.army ?? (route.params.army as string);

const CATEGORY_ORDER = [
  'Hero',
  'Infantry',
  'Cavalry',
  'Beast',
  'Monster',
  'War Machine',
  'Manifestation',
  'Faction Terrain',
  'Other',
];

const categorizedUnits = ref<Record<string, Unit[]>>({});
const unitFavorites = ref<string[]>([]);
const showOnlyFavorites = ref(getFavoriteToggleState('unit'));

function updateShowOnlyFavoritesState(newVal: boolean) {
  showOnlyFavorites.value = newVal;
  setFavoriteToggleState('unit', newVal);
}

onMounted(async () => {
  unitFavorites.value = getFavorites('unit');
  try {
    const armyData = await loadArmy(army);
    const cats: Record<string, Unit[]> = {
      Hero: [], Infantry: [], Cavalry: [], Beast: [], Monster: [], 'War Machine': [], Manifestation: [], 'Faction Terrain': [], Other: []
    };
    for (const unit of armyData.units) {
      if (unit.keywords.map(k => k.toLowerCase()).includes('legends')) {
        // eslint-disable-next-line no-console
        console.log(`Skipping Legends unit: ${unit.name}`);
        continue;
      }
      let found = false;
      for (const cat of CATEGORY_ORDER.slice(0, -1)) {
        if (unit.keywords.some(k => k.toLowerCase() === cat.toLowerCase())) {
          cats[cat].push(unit);
          found = true;
          break;
        }
      }
      if (!found) cats['Other'].push(unit);
    }
    // Sort units alphabetically within each category
    for (const cat of CATEGORY_ORDER) {
      cats[cat].sort((a, b) => a.name.localeCompare(b.name));
    }
    categorizedUnits.value = cats;
  } catch (e) {
    categorizedUnits.value = {};
  }
});
function selectUnit(unit: string) {
  router.push({ name: 'UnitDetail', params: { army, unit } });
}
function toggleUnitFavorite(unit: string, fav: boolean) {
  if (fav) {
    saveFavorite('unit', unit);
    if (!unitFavorites.value.includes(unit)) unitFavorites.value.push(unit);
  } else {
    removeFavorite('unit', unit);
    unitFavorites.value = unitFavorites.value.filter(u => u !== unit);
  }
}

const filteredUnits = (cat: string) => {
  const units = categorizedUnits.value?.[cat] || [];
  if (showOnlyFavorites.value && hasAnyFavoriteInArmy.value) {
    return units.filter(x => unitFavorites.value.includes(x.name));
  }
  return units;
};

const hasAnyFavoriteInArmy = computed(() => {
  return Object.values(categorizedUnits.value).some(units =>
    units.some(u => unitFavorites.value.includes(u.name))
  );
});

watch(unitFavorites, favs => {
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
    </div>
    <div class="section-divider"></div>
    <template v-for="(cat, idx) in CATEGORY_ORDER" :key="cat">
      <div v-if="filteredUnits(cat).length">
        <div v-if="idx !== 0" class="section-divider"></div>
        <h2 class="section-title">{{ cat }}</h2>
        <ul>
          <li v-for="u in filteredUnits(cat)" :key="u.name">
            <router-link :to="{ name: 'UnitDetail', params: { army, unit: u.name } }" custom v-slot="{ navigate, href }">
              <ListButton
                :label="u.name"
                :favorite="unitFavorites.includes(u.name)"
                @click="navigate"
                @toggle-favorite="fav => toggleUnitFavorite(u.name, fav)"
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
</style>
