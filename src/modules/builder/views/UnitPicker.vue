<template>
  <h2>Select a Unit</h2>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <div
      v-if="showRegimentOptions"
      class="regiment-options-bar"
      v-html="formattedRegimentOptions"
    />
    <ToggleBox
      v-if="showMultiAdd"
      v-model="multiAdd"
      style="margin-bottom: 0.5em;"
      :mini="true"
    > Multi-Add </ToggleBox>
    <FilterBar
      placeholder="Name or keyword1, keyword2..."
      @update="onFilterBarUpdate"
    />
    <template
      v-for="cat in unitPickerCategories"
      :key="cat"
    >
      <Section v-if="categorizeListItems.get(cat)?.length">
        <template #title>{{ cat }}</template>
        <ul class="unit-list">
          <template v-for="item in categorizeListItems.get(cat)" :key="item.name">
          <li v-if="(showLegends && item.legends) || !item.legends" class="unit-row">
            <ListButton
              :label="item.name"
              :favorite-type="isRoR ? 'army' : 'unit'"
              :points="item.points"
              :legends="item.legends"
              :split-on-sub-label="true"
              class="unit-list-btn"
              @click="() => addUnitToRegiment(item)"
            />
            <button
              class="detail-btn"
              title="Add to Regiment"
              @click="() => goToDetail(item)"
            >
              <FontAwesomeIcon icon="eye" />
            </button>
          </li>
          </template>
        </ul>
      </Section>
    </template>
    <ToggleBox v-if="!isRoR" v-model="overrideRegimentOptions">Override</ToggleBox>
    <div v-if="!isRoR" style="color: #888; font-size: 0.95em; margin-top: 0.2em;">
      Only use the override if you think the regiment options are wrong. You may need to disable validation in the list settings.
    </div>
  </div>
  <ListIndicator
    v-if="list && game"
    :list="list"
    :game="game"
  />
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatRegimentOptions } from '../../../utils/formatter';
import ListButton from '../../shared/components/ListButton.vue';
import Section from '../../core/components/ContentSection.vue';
import { useGame } from '../../shared/composables/useGame';
import { BattleProfile } from '../../../parser/models/battleProfile';
import { UnitCategoriesOrder, type UnitCategory } from '../../../parser/models/unit';
import { Army } from '../../../parser/models/army';
import { filterBattleProfilesByRegimentOptions } from '../filter';
import { useList } from '../../shared/composables/useList';
import { ListUnit } from '../../../list/models/unit';
import { assignRoR } from '../ror';
import { useUnitSettings } from '../../shared/composables/useUnitSettings';
import ToggleBox from '../../core/components/ToggleBox.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useStorage } from '@vueuse/core';
import { SHOW_LEGENDS_KEY } from '../../../favorites';
import FilterBar from '../../shared/components/FilterBar.vue';
import { useFilterBar } from '../../shared/composables/useFilterBar';
import { useFavorites } from '../../core/composables/useFavorite';
import ListIndicator from '../components/ListIndicator.vue';

const route = useRoute();
const router = useRouter();
const listId = route.params.id as string;
const regimentIdx = Number(route.params.regimentIdx);
const filter = (route.params.filter as string) || '';
const overrideRegimentOptions = ref(false);
const showLegends = useStorage(SHOW_LEGENDS_KEY, false);
const multiAdd = useStorage('unit-picker-multi-add', false);
const showMultiAdd = computed(() => {
  return filter.toLowerCase() === 'unit' || filter.toLowerCase() === 'aux';
});

const { favorites: armyFavorites } = useFavorites('army');
const { favorites: unitFavorites } = useFavorites('unit');

const list = useList(listId);
const { game, loading } = useGame();
const army = computed(
  () =>
    game.value?.armies.get(list.value?.faction || '') ||
    new Army({ name: list.value?.faction || '' })
);

const { searchQuery, showFavorites, sortMode, onFilterBarUpdate } = useFilterBar();

const unitPickerCategories = [...UnitCategoriesOrder, 'Regiments of Renown'];

const isRoR = filter.toLowerCase() === 'ror';

const availableRoRs = computed<UnitPickerListItem[]>(() => {
  if (!isRoR || !army.value || !game.value) return [];
  // army.value.regimentsOfRenown is a Set or array of RoR names
  const rorNames = Array.from(army.value.regimentsOfRenown || []);
  // Map to { name, points, legends } objects (points can be looked up from game.regimentsOfRenown)
  return rorNames.map(name => {
    const ror = game.value?.regimentsOfRenown.get(name);
    return {
      name,
      points: ror?.points ?? 0,
      legends: false,
      keywords: [],
    };
  }).filter(r => r.points > 0);
});

const filteredBPs = computed(() => {
  if (!game.value) return [];
  if (overrideRegimentOptions.value) { 
        return Array.from(army.value?.battleProfiles.values()).filter(
          (u) => u.category !== 'MANIFESTATION' && u.category !== 'FACTION TERRAIN'
        ) || [];
  }

  let us: BattleProfile[] = [];
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

  us = us.filter((u) => u.name !== 'Auto-Endrin'); // Exclude Auto-Endrin from unit picker since it's not a real unit

  return us;
});

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

interface UnitPickerListItem {
  name: string;
  points: number;
  legends: boolean;
  keywords: string[];
};

const categorizeListItems = computed(() => {
  if (isRoR) {
    // For RoR, show all available RoRs in a single category
    let items= availableRoRs.value;
    if (showFavorites.value) {
      items = items.filter((u) => armyFavorites.value.includes(u.name));
    }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter((x) => {
      return x.name.toLowerCase().includes(query);
    });
  }
    // sort by points or name
    if (sortMode.value === 'points') {
      items = items.sort((a, b) => {
        const pointsA = a.points || 0;
        const pointsB = b.points || 0;
        if (pointsA !== pointsB) {
          return pointsA - pointsB;
        }
        return a.name.localeCompare(b.name);
      });
    } else {
      items = items.sort((a, b) => a.name.localeCompare(b.name));
    }
    return new Map<string, UnitPickerListItem[]>([['Regiments of Renown', items]]);
  }


  let items = filteredBPs.value;
  if (showFavorites.value) {
    items = items.filter((u) => unitFavorites.value.includes(u.name));
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter((x) => {
      const nameIncludes = x.name.toLowerCase().includes(query);
      const parts = query.split(',');
      const keywordIncludes = parts.every((part) => {
        const trimmed = part.trim();
        return trimmed && x.keywords.some((k: string) => k.toLowerCase().includes(trimmed));
      });
      return nameIncludes || keywordIncludes;
    });
  }

  const cats: Map<string, UnitPickerListItem[]> = new Map();
  for (const bp of items) {
    const cat = bp.category;
    if (!cats.has(cat)) cats.set(cat, []);
    cats.get(cat)?.push({
      name: bp.name,
      points: bp.points,
      legends: bp.legends,
      keywords: bp.keywords,
    });
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

function goToDetail(item: UnitPickerListItem) {
  if (isRoR) {
    // For RoR, navigate to RegimentOfRenown view
    router.push({ name: 'RegimentOfRenown', params: { regimentName: item.name } });
  } else {
    router.push({
      name: 'UnitDetail',
      params: { armyName: list.value?.faction || '', unitName: item.name },
    });
  }
}

function toastAddedUnit(unitName: string) {
  if (multiAdd.value) {
    window.$toast?.(`+ ${unitName}`);
  }
}


function returnToList() {
  if (multiAdd.value && showMultiAdd.value) {
    return;
  }
  router.back();
}

function addUnitToRegiment(item: UnitPickerListItem) {
  if (!list.value) return;
  list.value.modifiedAt = new Date();

  if (isRoR && game.value) {
    assignRoR(item.name, list.value, game.value);
    router.back();
    return;
  }

  const unit = game.value?.units.get(item.name) || undefined;
  if (!unit) {
    console.error(`Unit ${item.name} not found in game data.`);
    return;
  }
   const unitSettings = useUnitSettings(unit);

  if (filter.toLowerCase() === 'terrain') {
    // Set as faction terrain
    list.value.factionTerrain = item.name;
    router.back();
    return;
  }

  if (filter.toLowerCase() === 'aux') {
    if (!list.value.auxiliaryUnits) list.value.auxiliaryUnits = [];
   
    list.value.auxiliaryUnits.push(
      new ListUnit({
        name: unit.name,
        weaponOptions: unitSettings.value.weaponOptions,
      })
    );
    toastAddedUnit(unit.name);
    returnToList();
    return;
  }

  if (isNaN(regimentIdx) || !list.value.regiments[regimentIdx]) return;
  if (filter.toLowerCase() === 'leader') {
    list.value.regiments[regimentIdx].leader = new ListUnit({
      name: unit.name,
      weaponOptions: unitSettings.value.weaponOptions,
    });
  } else {
    list.value.regiments[regimentIdx].units.push(
      new ListUnit({
        name: unit.name,
        weaponOptions: unitSettings.value.weaponOptions,
      })
    );
    toastAddedUnit(unit.name);
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
            const companionUnitSettings = useUnitSettings(companionUnit);
            list.value.regiments[regimentIdx].units.push(
              new ListUnit({
                name: companionUnit.name,
                weaponOptions: companionUnitSettings.value.weaponOptions,
              })
            );
          }
        }
      }
    }
  }
  returnToList();
}
</script>
<style scoped>
.unit-picker-view {
  max-width: 400px;
  margin: 2rem auto;
  text-align: center;
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
.detail-btn {
  min-width: 44px;
  min-height: 44px;
  height: auto;
  font-size: 1.3em;
  background: var(--primary);
  color: #fff;
  border: 1.5px solid var(--border-color);
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.25em;
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
.detail-btn:hover {
  filter: brightness(1.1);
}
.regiment-options-bar {
  background: var(--bg-sub);
  border: 1.5px solid var(--border-color);
  border-radius: 7px;
  padding: 0.7em 1.1em 0.7em 1.1em;
  margin-bottom: 1.1em;
  font-size: 1.04em;
  color: var(--text-main);
}
.regiment-options-bar ul {
  margin: 0;
  padding-left: 1.1em;
  list-style-type: disc inside;
}
.regiment-options-bar li {
  margin: 0.05em 0 0.05em 0;
  padding: 0;
  /* text-indent: 0; */
  display: list-item;
}
</style>
