<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAllLists, saveList, setupDefaultWeaponOptions } from '../utils/list-manager';
import { loadArmy } from '../army';
import { filterUnitsByRegimentOptions, POSSIBLE_CATEGORIES } from '../common/UnitData';
import { formatRegimentOptions } from '../utils/formatter';
import type { List } from '../common/ListData';
import type { Army } from '../common/ArmyData';
import type { Unit } from '../common/UnitData';
import ListButton from '../components/ListButton.vue';
import BackButton from '../components/BackButton.vue';
import Section from '../components/Section.vue';

const route = useRoute();
const router = useRouter();
const listName = route.params.listName as string;
const regimentIdx = Number(route.params.regimentIdx);
const filter = (route.query.filter as string) || '';

const list = ref<List | undefined>();
const army = ref<Army | null>(null);
const loading = ref(true);
const search = ref('');

onMounted(async () => {
  const found = getAllLists().find((l) => l.name === listName);
  list.value = found;
  if (found) {
    army.value = await loadArmy(found.faction);
  }
  loading.value = false;
});

const units = computed(() => (army.value ? army.value.units : []));

const filteredUnits = computed(() => {
  let us = units.value;
  if (filter === 'unit') {
    // If leader exists and has regiment_options, filter by those
    const regiment = list.value?.regiments?.[regimentIdx];
    const leaderName = regiment?.leader?.name;
    const leaderUnit = leaderName ? us.find((u) => u.name === leaderName) : undefined;
    const options = [
      ...(leaderUnit?.regiment_options || []),
      ...(leaderUnit?.sub_hero_options || []),
    ];
    if (options.length > 0) {
      us = filterUnitsByRegimentOptions(us, options);
    } else {
      // No leader or no options: filter out heroes
      us = us.filter((u) => u.category?.toLowerCase() !== 'hero');
    }
  } else if (filter) {
    if (filter.toLowerCase() === 'terrain') {
      us = us.filter((u) => (u.category || '').toLowerCase() === 'faction terrain');
    } else if (filter.toLowerCase() === 'aux') {
      // For aux, allow all units except manifestations and faction terrain
      us = us.filter((u) => {
        const cat = (u.category || '').toLowerCase();
        return cat !== 'manifestation' && cat !== 'faction terrain';
      });
    } else {
      const actualFilter = filter.toLowerCase() == 'leader' ? 'Hero' : filter;
      us = us.filter((u) => u.category?.toLowerCase() === actualFilter.toLowerCase());
    }
  }
  if (search.value) {
    us = us.filter((u) => u.name.toLowerCase().includes(search.value.toLowerCase()));
  }
  return us;
});

const sortMode = ref<'alpha' | 'points'>('alpha');
const sortLabel = computed(() => (sortMode.value === 'alpha' ? 'A-Z' : 'Points'));
function toggleSortMode() {
  sortMode.value = sortMode.value === 'alpha' ? 'points' : 'alpha';
}

const regiment = computed(() => list.value?.regiments?.[regimentIdx]);
const leaderName = computed(() => regiment.value?.leader?.name);
const leaderUnit = computed(() =>
  leaderName.value ? units.value.find((u) => u.name === leaderName.value) : undefined
);
const leaderRegimentOptions = computed(() => leaderUnit.value?.regiment_options || []);
const leaderSubHeroOptions = computed(() => leaderUnit.value?.sub_hero_options || []);
const showRegimentOptions = computed(
  () =>
    filter === 'unit' &&
    leaderUnit.value &&
    (leaderRegimentOptions.value.length > 0 || leaderSubHeroOptions.value.length > 0)
);
const formattedRegimentOptions = computed(() =>
  showRegimentOptions.value
    ? formatRegimentOptions(leaderSubHeroOptions.value, leaderRegimentOptions.value)
    : ''
);

const categorizedUnits = computed(() => {
  const cats: Record<string, Unit[]> = {};
  for (const cat of POSSIBLE_CATEGORIES) {
    cats[cat] = [];
  }
  for (const unit of filteredUnits.value) {
    const cat = unit.category || 'Other';
    if (!cats[cat]) cats[cat] = [];
    cats[cat].push(unit);
  }
  // Sort units within each category by selected mode
  for (const cat of POSSIBLE_CATEGORIES) {
    if (cats[cat]) {
      if (sortMode.value === 'points') {
        cats[cat].sort((a, b) => {
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
        cats[cat].sort((a, b) => a.name.localeCompare(b.name));
      }
    }
  }
  return cats;
});

function goToDetail(unit: Unit) {
  router.push({
    name: 'UnitDetail',
    params: { army: list.value?.faction || '', unit: unit.name },
  });
}

function addUnitToRegiment(unit: Unit) {
  if (!list.value) return;
  if (filter.toLowerCase() === 'terrain') {
    // Set as faction terrain
    list.value.faction_terrain = unit.name;
    saveList(list.value);
    router.back();
    return;
  }
  if (filter.toLowerCase() === 'aux') {
    if (!list.value.auxiallary_units) list.value.auxiallary_units = [];
    list.value.auxiallary_units.push({
      name: unit.name,
      weapon_options: army.value ? setupDefaultWeaponOptions(unit.name, army.value) : undefined,
    });
    saveList(list.value);
    router.back();
    return;
  }
  if (isNaN(regimentIdx) || !list.value.regiments[regimentIdx]) return;
  if (filter.toLowerCase() === 'leader') {
    list.value.regiments[regimentIdx].leader = {
      name: unit.name,
      weapon_options: army.value ? setupDefaultWeaponOptions(unit.name, army.value) : undefined,
    };
  } else {
    list.value.regiments[regimentIdx].units.push({
      name: unit.name,
      weapon_options: army.value ? setupDefaultWeaponOptions(unit.name, army.value) : undefined,
    });
  }
  saveList(list.value);
  router.back();
}
</script>
<template>
  <BackButton />
  <h2>Select a Unit</h2>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <div
      v-if="showRegimentOptions"
      class="regiment-options-bar"
      v-html="formattedRegimentOptions"
    ></div>
    <div class="filters-bar">
      <input v-model="search" placeholder="Search units..." class="search-bar" />
      <button
        class="sort-toggle"
        @click="toggleSortMode"
        :title="sortMode === 'alpha' ? 'Sort by points' : 'Sort A-Z'"
      >
        Sort: {{ sortLabel }}
      </button>
    </div>
    <template v-for="cat in POSSIBLE_CATEGORIES" :key="cat">
      <Section v-if="categorizedUnits[cat] && categorizedUnits[cat].length">
        <template #title>{{ cat }}</template>
        <ul class="unit-list">
          <li v-for="unit in categorizedUnits[cat]" :key="unit.name" class="unit-row">
            <ListButton
              :label="unit.name"
              :points="unit.points"
              @click="() => goToDetail(unit)"
              class="unit-list-btn"
            />
            <button class="add-btn" @click="() => addUnitToRegiment(unit)" title="Add to Regiment">
              +
            </button>
          </li>
        </ul>
      </Section>
    </template>
  </div>
</template>
<style scoped>
.unit-picker-view {
  max-width: 400px;
  margin: 2rem auto;
  text-align: center;
}
.filters-bar {
  display: flex;
  gap: 1em;
  margin-bottom: 1.2em;
  justify-content: center;
}
.search-bar {
  width: 100%;
  max-width: 340px;
  font-size: 1.1em;
  padding: 0.6em 1em;
  border-radius: 6px;
  border: 1.5px solid #bbb;
  background: #fafafa;
  box-sizing: border-box;
  margin: 0 auto;
  transition: border 0.18s;
}
.search-bar:focus {
  border: 1.5px solid #1976d2;
  outline: none;
}
.unit-list {
  padding: 0;
  margin: 0;
  list-style: none;
}
.unit-row {
  display: flex;
  align-items: stretch;
  gap: 0;
  margin-bottom: 0.7em;
  width: 100%;
}
.unit-list-btn {
  flex: 1 1 0;
}
.add-btn {
  min-width: 44px;
  min-height: 44px;
  height: auto;
  font-size: 1.3em;
  background: #f5f5f5;
  color: #1976d2;
  border: 1.5px solid #1976d2;
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.1em;
  margin-right: 0;
  margin-top: 0;
  margin-bottom: 0;
  padding: 0 1em;
  box-sizing: border-box;
  transition:
    background 0.18s,
    color 0.18s,
    border 0.18s;
}
.add-btn:hover {
  background: #1976d2;
  color: #fff;
  border-color: #1976d2;
}
.regiment-options-bar {
  background: #f3f7ff;
  border: 1.5px solid #b3c6e6;
  border-radius: 7px;
  padding: 0.7em 1.1em 0.7em 1.1em;
  margin-bottom: 1.1em;
  font-size: 1.04em;
  color: #1a237e;
}
.regiment-options-bar ul {
  margin: 0;
  padding-left: 1.1em;
  list-style-type: disc;
  list-style-position: inside;
}
.regiment-options-bar li {
  margin: 0.05em 0 0.05em 0;
  padding: 0;
  text-indent: 0;
  display: list-item;
}
.sort-toggle {
  font-size: 1em;
  padding: 0.5em 1.1em;
  border-radius: 6px;
  border: 1.5px solid #1976d2;
  background: #f5f5f5;
  color: #1976d2;
  cursor: pointer;
  margin-left: 0.5em;
  transition:
    background 0.18s,
    color 0.18s;
}
.sort-toggle:hover {
  background: #1976d2;
  color: #fff;
}
</style>
