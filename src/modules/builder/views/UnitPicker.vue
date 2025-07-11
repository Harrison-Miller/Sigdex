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
    <template v-for="cat in UnitCategories" :key="cat">
      <Section v-if="categorizedBattleProfiles.get(cat)?.length">
        <template #title>{{ cat }}</template>
        <ul class="unit-list">
          <li v-for="bp in categorizedBattleProfiles.get(cat)" :key="bp.name" class="unit-row">
            <ListButton
              :label="bp.name"
              :points="bp.points"
              @click="() => goToDetail(bp)"
              class="unit-list-btn"
            />
            <button class="add-btn" @click="() => addUnitToRegiment(bp)" title="Add to Regiment">
              +
            </button>
          </li>
        </ul>
      </Section>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDefaultWeaponOptions } from '../../../list/models/unit';
import { formatRegimentOptions } from '../../../utils/formatter';
import ListButton from '../../shared/components/ListButton.vue';
import BackButton from '../../core/components/BackButton.vue';
import Section from '../../core/components/Section.vue';
import { useGame } from '../../shared/composables/useGame';
import { BattleProfile, type IBattleProfile } from '../../../parser/models/battleProfile';
import { UnitCategories, type UnitCategory } from '../../../parser/models/unit';
import { Army } from '../../../parser/models/army';
import { filterBattleProfilesByRegimentOptions } from '../filter';
import { useList } from '../../shared/composables/useList';
import { ListUnit } from '../../../list/models/unit';

const route = useRoute();
const router = useRouter();
const listId = route.params.id as string;
const regimentIdx = Number(route.params.regimentIdx);
const filter = (route.params.filter as string) || '';

const list = useList(listId);
const { game, loading } = useGame();
const army = computed(
  () =>
    game.value?.armies.get(list.value?.faction || '') ||
    new Army({ name: list.value?.faction || '' })
);
const search = ref('');

const filteredBPs = computed(() => {
  let us: IBattleProfile[] = [];
  switch (filter.toLowerCase()) {
    case 'leader':
      us =
        Array.from(army.value?.battleProfiles.values()).filter((u) => u.category === 'HERO') || [];
      us = us.filter((u) => u.companionLeader === ''); // filter out units that are companions
      break;
    case 'unit':
      if (leaderRegimentOptions.value.length > 0) {
        // If leader has regiment options, filter by those
        us = filterBattleProfilesByRegimentOptions(
          Array.from(army.value?.battleProfiles.values()),
          leaderRegimentOptions.value,
          leaderCompanionUnits.value
        );
      } else {
        // Otherwise, show all units except heroes
        console.warn(
          `No regiment options for leader ${leaderName.value}, showing all units except heroes`
        ); // TODO: this should never happen in practice, but my parsing doesn't always set this up correctly
        us =
          Array.from(army.value?.battleProfiles.values()).filter((u) => u.category !== 'HERO') ||
          [];
      }
      break;
    case 'terrain':
      us =
        Array.from(army.value?.battleProfiles.values()).filter(
          (u) => u.category === 'FACTION TERRAIN'
        ) || [];
      break;
    case 'aux':
      us =
        Array.from(army.value?.battleProfiles.values()).filter(
          (u) => u.category !== 'MANIFESTATION' && u.category !== 'FACTION TERRAIN'
        ) || [];
      break;
    default:
      us =
        Array.from(army.value?.battleProfiles.values()).filter(
          (u) => u.category === (filter.toUpperCase() as UnitCategory)
        ) || [];
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
const leaderName = computed(() => regiment.value?.leader?.name || '');
const leaderBattleProfile = computed(
  () =>
    army.value?.battleProfiles.get(leaderName.value) ||
    new BattleProfile({ name: leaderName.value })
);
const leaderRegimentOptions = computed(() => leaderBattleProfile.value?.regimentOptions || []);
const leaderCompanionUnits = computed(() => leaderBattleProfile.value?.companionUnits || []);
const showRegimentOptions = computed(
  () => filter === 'unit' && leaderRegimentOptions.value.length > 0
);
const formattedRegimentOptions = computed(() => formatRegimentOptions(leaderRegimentOptions.value));

const categorizedBattleProfiles = computed(() => {
  const cats: Map<string, IBattleProfile[]> = new Map();
  for (const bp of filteredBPs.value) {
    const cat = bp.category;
    if (!cats.has(cat)) cats.set(cat, []);
    cats.get(cat)?.push(bp);
  }
  // Sort bps within each category by selected mode
  for (const cat of Array.from(cats.keys())) {
    if (sortMode.value === 'points') {
      cats.get(cat)?.sort((a, b) => {
        if (a.points === b.points) return a.name.localeCompare(b.name);
        return a.points - b.points;
      });
    } else {
      cats.get(cat)?.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
  return cats;
});

function goToDetail(bp: IBattleProfile) {
  router.push({
    name: 'UnitDetail',
    params: { army: list.value?.faction || '', unit: bp.name },
  });
}

function addUnitToRegiment(bp: IBattleProfile) {
  if (!list.value) return;
  const unit = game.value?.units.get(bp.name) || undefined;
  if (!unit) {
    console.error(`Unit ${bp.name} not found in game data.`);
    return;
  }

  if (filter.toLowerCase() === 'terrain') {
    // Set as faction terrain
    list.value.factionTerrain = bp.name;
    router.back();
    return;
  }

  if (filter.toLowerCase() === 'aux') {
    if (!list.value.auxiliaryUnits) list.value.auxiliaryUnits = [];
    list.value.auxiliaryUnits.push(
      new ListUnit({
        name: unit.name,
        weaponOptions: getDefaultWeaponOptions(unit),
      })
    );
    router.back();
    return;
  }

  if (isNaN(regimentIdx) || !list.value.regiments[regimentIdx]) return;
  if (filter.toLowerCase() === 'leader') {
    list.value.regiments[regimentIdx].leader = new ListUnit({
      name: unit.name,
      weaponOptions: getDefaultWeaponOptions(unit),
    });
  } else {
    list.value.regiments[regimentIdx].units.push(
      new ListUnit({
        name: unit.name,
        weaponOptions: getDefaultWeaponOptions(unit),
      })
    );
  }

  // --- Companion auto-add logic ---
  if (filter === 'leader') {
    const leaderBp = army.value?.battleProfiles.get(unit.name);
    if (leaderBp) {
      for (const companionName of leaderBp.companionUnits) {
        const alreadyPresent = list.value.regiments[regimentIdx].units.some(
          (u) => u.name === companionName
        );
        if (!alreadyPresent) {
          // Find the companion unit in the game
          const companionUnit = game.value?.units.get(companionName) || undefined;
          if (companionUnit) {
            list.value.regiments[regimentIdx].units.push(
              new ListUnit({
                name: companionUnit.name,
                weaponOptions: getDefaultWeaponOptions(companionUnit),
              })
            );
          }
        }
      }
    }
  }
  router.back();
}
</script>
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
