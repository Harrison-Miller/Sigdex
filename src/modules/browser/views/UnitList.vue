<template>
  <BackButton :size="36" />
  <div
    v-if="!loading && !error"
  >
    <h1>{{ armyName }}</h1>
    <LegendsBadge big :legends="army.legends" style="margin-bottom: 1em;"/>
    <TwoTab
      v-model:left-active="leftActive"
      :left-label="'Warscrolls'"
      :right-label="'Rules'"
    >
      <template #left>
        <div class="filters-bar">
          <FavoriteToggle
            :model-value="showOnlyFavorites"
            :disabled="!hasAnyFavoriteInArmy"
            @update:model-value="updateShowOnlyFavoritesState"
          />
          <button
            class="sort-toggle"
            :class="sortMode === 'points' ? 'points' : 'alpha'"
            :title="sortMode === 'alpha' ? 'Sort by points' : 'Sort A-Z'"
            @click="toggleSortMode"
          >
            Sort: {{ sortLabel }}
          </button>
        </div>
        <template
          v-for="[cat, units] in Array.from(army.unitList.entries())"
          :key="cat"
        >
          <Section
            v-if="filteredUnits(units).length"
            :collapse-key="cat"
          >
            <template #title>{{ cat }}</template>
            <ul>
              <template v-for="u in filteredUnits(units)" :key="u.name">
              <li v-if="(showLegends && u.legends) || !u.legends">
                <router-link
                  v-slot="{ navigate, href }"
                  :to="{ name: 'UnitDetail', params: { armyName: armyName, unitName: u.name } }"
                  custom
                >
                  <ListButton
                    :label="u.name"
                    :favorite="unitFavorites.includes(u.name)"
                    :show-favorite-toggle="true"
                    :points="u.points"
                    :legends="u.legends"
                    :href="href"
                    @click="navigate"
                    @toggle-favorite="(fav: boolean) => toggleUnitFavorite(u.name, fav)"
                  />
                </router-link>
              </li>
            </template>
            </ul>
          </Section>
        </template>
      </template>
      <template #right>
        <ArmyRules :army="army" />
      </template>
    </TwoTab>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onMounted, watch, computed } from 'vue';
import { useArmy } from '../../shared/composables/useGame';
import ListButton from '../../shared/components/ListButton.vue';
import FavoriteToggle from '../../core/components/FavoriteToggle.vue';
import BackButton from '../../core/components/BackButton.vue';
import ArmyRules from '../components/ArmyRules.vue';
import TwoTab from '../../core/components/TwoTab.vue';
import {
  saveFavorite,
  removeFavorite,
  getFavorites,
  getArmyUnitFavoriteToggleState,
  setArmyUnitFavoriteToggleState,
  SHOW_LEGENDS_KEY,
} from '../../../favorites';
import Section from '../../core/components/ContentSection.vue';
import LegendsBadge from '../../shared/components/badges/LegendsBadge.vue';
import { useStorage } from '@vueuse/core';

// Accept army as a prop for this view
const props = defineProps<{ armyName?: string }>();

const showLegends = useStorage(SHOW_LEGENDS_KEY, false);

// Use prop if provided, otherwise fallback to route param
const route = useRoute();
const armyName = props.armyName ?? (route.params.armyName as string);

const unitFavorites = ref<string[]>([]);
const showOnlyFavorites = ref(getArmyUnitFavoriteToggleState(armyName));
const sortMode = ref<'alpha' | 'points'>('alpha');
const sortLabel = computed(() => (sortMode.value === 'alpha' ? 'A-Z' : 'Points'));
const leftActive = ref(true);

// Use the new useArmy composable
const { army, loading, error } = useArmy(armyName);

function updateShowOnlyFavoritesState(newVal: boolean) {
  showOnlyFavorites.value = newVal;
  setArmyUnitFavoriteToggleState(armyName, newVal);
}

onMounted(() => {
  unitFavorites.value = getFavorites('unit');
  showOnlyFavorites.value = getArmyUnitFavoriteToggleState(armyName);
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

const filteredUnits = (units: any[]) => {
  let filtered = units;
  if (showOnlyFavorites.value && hasAnyFavoriteInArmy.value) {
    filtered = filtered.filter((x) => unitFavorites.value.includes(x.name));
  }
  if (sortMode.value === 'points') {
    filtered = [...filtered].sort((a, b) => {
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
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }
  return filtered;
};

const hasAnyFavoriteInArmy = computed(() => {
  return Array.from(army.value.unitList.values()).some((units) =>
    units.some((u) => unitFavorites.value.includes(u.name))
  );
});

watch(unitFavorites, (favs) => {
  if (showOnlyFavorites.value && favs.length === 0) {
    showOnlyFavorites.value = false;
    setArmyUnitFavoriteToggleState(armyName, false);
  }
});
</script>
<style src="../../home/views/list-shared.css" scoped></style>
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

.sort-toggle {
  background: var(--bg-sub);
  border: 1.5px solid var(--border-color);
  color: var(--text-main);
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
.sort-toggle.points {
  background: var(--color-red);
  color: #fff;
  border: 1.5px solid var(--color-red);
}
.sort-toggle.alpha {
  background: var(--bg-sub);
  color: var(--text-main);
  border: 1.5px solid var(--border-color);
}
.sort-toggle:hover {
  filter: brightness(0.95);
}

.army-rules-section {
  padding: 1.5em;
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
</style>
