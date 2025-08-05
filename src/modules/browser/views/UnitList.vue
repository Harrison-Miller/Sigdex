<template>
  <FavoritesToggle
    v-if="!isAor"
    type="army"
    :name="armyName"
    />
  <div
    v-if="!loading && !error"
  >
    <h1 class="fancy-text">{{ displayLabel }}

                    <br v-if="displaySubLabel" />
              <span
                v-if="displaySubLabel"
                class="sub-label"
              >
                {{ displaySubLabel }}
              </span>
    </h1>
    <LegendsBadge big :legends="army.legends" style="margin-bottom: 1em;"/>
    <TwoTab
      v-model:left-active="leftActive"
      :left-label="'Warscrolls'"
      :right-label="'Rules'"
    >
      <template #left>
          <FilterBar
            @update="onFilterBarUpdate"
          />
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
                    favorite-type="unit"
                    :points="u.points"
                    :legends="u.legends"
                    :href="href"
                    :split-on-sub-label="true"
                    @click="navigate"
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
import { ref, computed } from 'vue';
import { useArmy } from '../../shared/composables/useGame';
import ListButton from '../../shared/components/ListButton.vue';
import ArmyRules from '../components/ArmyRules.vue';
import TwoTab from '../../core/components/TwoTab.vue';
import {
  SHOW_LEGENDS_KEY,
} from '../../../favorites';
import Section from '../../core/components/ContentSection.vue';
import LegendsBadge from '../../shared/components/badges/LegendsBadge.vue';
import { useStorage, useTitle } from '@vueuse/core';
import FilterBar from '../../shared/components/FilterBar.vue';
import { useFilterBar } from '../../shared/composables/useFilterBar';
import FavoritesToggle from '../../shared/components/FavoritesToggle.vue';
import { useFavorites } from '../../core/composables/useFavorite';

const props = defineProps<{ armyName?: string }>();

const showLegends = useStorage(SHOW_LEGENDS_KEY, false);

const route = useRoute();
const armyName = props.armyName ?? (route.params.armyName as string);
const isAor = computed(() => armyName.includes(' - '));

const splitLabel = computed(() => armyName.split(/ - /));
const displayLabel = computed(() => splitLabel.value[0]);
const displaySubLabel = computed(() => {
  if (splitLabel.value.length <= 1) return '';
  return splitLabel.value[1];
});

const { favorites } = useFavorites('unit');

const { searchQuery, showFavorites, sortMode, onFilterBarUpdate } = useFilterBar();

const leftActive = ref(true);

const { army, loading, error } = useArmy(armyName);

useTitle(`${armyName}`);

const filteredUnits = (units: any[]) => {
  let filtered = units;
  if (showFavorites.value) {
    filtered = filtered.filter((x) => favorites.value.includes(x.name));
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((x) => {
      const nameIncludes = x.name.toLowerCase().includes(query);
      const parts = query.split(',');
      const keywordIncludes = parts.every((part) => {
        const trimmed = part.trim();
        return trimmed && x.keywords.some((k: string) => k.toLowerCase().includes(trimmed));
      });
      return nameIncludes || keywordIncludes;
    });
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
</script>
<style src="../../home/views/list-shared.css" scoped></style>
<style scoped>
.sub-label {
  display: block;
  font-size: 0.5em;
  color: var(--text-muted);
  margin-top: 0.4em;
  font-family: 'system-ui', sans-serif;
}

.unit-list-header-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.army-rules-section {
  padding: 1.5em;
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
</style>

