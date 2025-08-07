<template>
  <div>
    <div class="header-bar">
      <div class="floating-header-buttons">
        <SettingsButton
          class="settings-btn"
          :size="36"
          @click="goToSettings"
        />
      </div>
    </div>
    <img
      alt="Sigdex Logo"
      class="sigdex-logo"
    />
    <TwoTab
      v-model:left-active="leftActive"
      :left-label="'Browse'"
      :right-label="'Lists'"
    >
      <template #left>
        <FilterBar
          @update="onFilterBarUpdate"
        />
        <Section
          v-if="filteredFAQData && filteredFAQData.data && filteredFAQData.data.length > 0"
          :default-collapsed="true"
          :collapse-key="'faq'"
        >
          <template #title>FAQ</template>
          <div v-if="faqLoading">Loading FAQ...</div>
          <div v-else-if="faqError" class="error">{{ faqError }}</div>
          <div v-else-if="filteredFAQData">
            <FAQSection
              v-for="(section, i) in filteredFAQData.data"
              :key="'faq-section-' + i"
              :section="section"
            />
          </div>
        </Section>
        <Section
          v-if="filteredManifestationLores && filteredManifestationLores.length > 0"
          :default-collapsed="true"
          :collapse-key="'universal-manifestations'"
        >
          <template #title>Universal Manifestations</template>
          <ul>
            <li
              v-for="[name, lore] in filteredManifestationLores"
              :key="name"
            >
              <ListButton
style="width: calc(100% - 22px - 0.9em);"
                :label="name"
                :points="lore.points"
                favorite-type="army"
                @click="
                  () => $router.push({ name: 'ManifestationLore', params: { loreName: name } })
                "
              />
            </li>
          </ul>
        </Section>
        <!-- Regiments of Renown Section -->
        <Section
          v-if="filteredRegimentsOfRenownList.length > 0"
          :default-collapsed="true"
          collapse-key="regiments-of-renown"
        >
          <template #title>Regiments of Renown</template>
          <ul>
            <li
              v-for="[name, regiment] in filteredRegimentsOfRenownList"
              :key="name"
            >
              <ListButton
style="width: calc(100% - 22px - 0.9em);"
                :label="name"
                :points="regiment.points"
                favorite-type="army"
                @click="() => goToRegimentOfRenown(name)"
              />
            </li>
          </ul>
        </Section>
        <div
          v-for="alliance in filteredArmiesByAlliance"
          :key="alliance.name"
        >
          <Section
            v-if="alliance && alliance.armies.length > 0"
            :collapse-key="'alliance-' + alliance.name"
          >
            <template #title>{{ alliance.name }}</template>
            <ul>
              <li
                v-for="army in alliance.armies"
                :key="army.name"
              >
                <template v-if="hasAoRsToShow(army)">
                  <ListButtonSection
v-if="(showLegends && army.legends) || !army.legends"
                    :label="army.name"
                    favorite-type="army"
                    :legends="army.legends"
                    @click="selectArmy(army.name)"
                  >
                  <template v-for="aor in army.armiesOfRenown" :key="aor.name">
                        <ListButton
v-if="(showLegends && aor.legends) || !aor.legends"
                          :label="aor.name"
                          :legends="aor.legends"
                          @click="selectArmy(army.name + ' - ' + aor.name)"
                        />
                  </template>
                  </ListButtonSection>
                </template>
                <template v-else>
                  <ListButton
v-if="(showLegends && army.legends) || !army.legends"
                    style="width: calc(100% - 22px - 0.9em);"
                    :label="army.name"
                    favorite-type="army"
                    :legends="army.legends"
                    @click="selectArmy(army.name)"
                  />
                </template>
              </li>
            </ul>
          </Section>
        </div>
      </template>
      <template #right>
        <ListList />
      </template>
    </TwoTab>
    <div v-if="loading">Loading game data...</div>
    <div
      v-if="error"
      class="error"
    >
      {{ error }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGame } from '../../shared/composables/useGame';
import { useFAQ } from '../../shared/composables/useFAQ';
import ListButton from '../../shared/components/ListButton.vue';
import SettingsButton from '../../core/components/SettingsButton.vue'
import Section from '../../core/components/ContentSection.vue';
import ListList from '../components/ListList.vue';
import TwoTab from '../../core/components/TwoTab.vue';
import ListButtonSection from '../../shared/components/ListButtonSection.vue';
import FAQSection from '../../shared/faq/FAQSection.vue';
import {
  SHOW_LEGENDS_KEY,
} from '../../../favorites';
import { useStorage, useTitle } from '@vueuse/core';
import type { ArmyListItem } from '../../../parser/models/game';
import FilterBar from '../../shared/components/FilterBar.vue';
import { useFilterBar } from '../../shared/composables/useFilterBar';
import { useFavorites } from '../../core/composables/useFavorite';
import { useFAQSearch } from '../../shared/composables/useFAQSearch';

const router = useRouter();
const { favorites } = useFavorites('army');
const { favorites: faqFavorites } = useFavorites('faq');
const leftActive = ref(true);

useTitle('Sigdex');

const showLegends = useStorage(SHOW_LEGENDS_KEY, false);
// Load game data (reactive, not awaited)
const { game, loading, error } = useGame();

// Load FAQ data
const { faq: faqData, loading: faqLoading, error: faqError } = useFAQ();

const { searchQuery, showFavorites, sortMode, onFilterBarUpdate } = useFilterBar();

// Filter FAQ data based on search query and favorites
const filteredFAQData = useFAQSearch(faqData, searchQuery, {
  showFavorites,
  favorites: faqFavorites
});

function hasAoRsToShow(army: ArmyListItem): boolean {
  return army.armiesOfRenown && army.armiesOfRenown.filter((aor) => {
    return (showLegends.value && aor.legends) || !aor.legends;
  }).length > 0;
}

function selectArmy(army: string) {
  router.push({ name: 'UnitList', params: { armyName: army } });
}

function goToSettings() {
  router.push({ name: 'Settings' });
}

// Use game data for grand alliances and armies
const filteredArmiesByAlliance = computed(() => {
  if (!game.value) return [];
  // game.value.armyList is Map<GrandAlliance, IArmyListItem[]>
  return Array.from(game.value.armyList.entries()).map(([name, armies]) => {
    let filtered = armies;
    if (showFavorites.value) {
      filtered = armies.filter((army) => favorites.value.includes(army.name));
    }
    if (searchQuery.value) {
      filtered = filtered.filter((army) =>
        army.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          army.armiesOfRenown.some((aor) =>
            aor.name.toLowerCase().includes(searchQuery.value.toLowerCase())
          )
      );
    }

    // always sort alpha, armies don't have points
    filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    return { name: String(name), armies: filtered };
  });
});

const filteredManifestationLores = computed(() => {
  if (!game.value) return [];
  // Use the keys (lore names) from the map
  const allLoreNames = Array.from(game.value.universalManifestationLores.entries());
  if (showFavorites.value) {
    return allLoreNames.filter(([loreName]) => favorites.value.includes(loreName));
  }
  if (searchQuery.value) {
    return allLoreNames.filter(([loreName]) =>
      loreName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  // sort by points or alpha
  if (sortMode.value === 'points') {
    return allLoreNames.sort((a, b) => {
      const pointsA = game.value?.universalManifestationLores.get(a[0])?.points || 0;
      const pointsB = game.value?.universalManifestationLores.get(b[0])?.points || 0;
      if (pointsA !== pointsB) {
        return pointsA - pointsB;
      }
      return a[0].localeCompare(b[0]);
    });
  } else {
    return allLoreNames.sort((a, b) => a[0].localeCompare(b[0]));
  }
  return allLoreNames;
});

const filteredRegimentsOfRenownList = computed(() => {
  if (!game.value) return [];
  let allRegiments = Array.from(game.value.regimentsOfRenown.entries());
  if (showFavorites.value) {
    allRegiments = allRegiments.filter(([name]) => favorites.value.includes(name));
  }
  if (searchQuery.value) {
    allRegiments = allRegiments.filter(([name]) =>
      name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  // Sort by points or alpha
  if (sortMode.value === 'points') {
    allRegiments.sort((a, b) => {
      const pointsA = game.value?.regimentsOfRenown.get(a[0])?.points || 0;
      const pointsB = game.value?.regimentsOfRenown.get(b[0])?.points || 0;
      if (pointsA !== pointsB) {
        return pointsA - pointsB;
      }
      return a[0].localeCompare(b[0]);
    });
  } else {
    allRegiments.sort((a, b) => a[0].localeCompare(b[0]));
  }
  // Sort alphabetically by regiment name
  return allRegiments;
});

function goToRegimentOfRenown(regiment: string) {
  router.push({ name: 'RegimentOfRenown', params: { regimentName: regiment } });
}
</script>
<style src="./list-shared.css" scoped></style>
<style scoped>
.header-bar {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 48px;
  margin-bottom: 0.5em;
}

.floating-header-buttons {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  padding: 0.3em 0.3em 0 0;
}

.settings-btn {
  background: none;
  border: none;
  border-radius: 50%;
  box-shadow: none;
  color: #555;
  cursor: pointer;
  z-index: 2;
}

.settings-btn:hover {
  background: #e5e5e5;
}
.lists-placeholder {
  text-align: center;
  color: #888;
  font-size: 1.1em;
  margin-top: 2em;
}
.error {
  color: #c00;
  text-align: center;
  margin-top: 1rem;
}
.sigdex-logo {
  display: block;
  margin: 0 auto 1em;
  max-width: 200px;
  height: auto;
  content: url('/src/assets/sigdex_logo_black.png');
}

.dark .sigdex-logo {
  content: url('/src/assets/sigdex_logo_white.png');
}
</style>
