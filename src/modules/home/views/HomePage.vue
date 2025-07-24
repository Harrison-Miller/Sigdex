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
    <h1 style="margin:0;margin-bottom:0.75em;">Sigdex</h1>
    <TwoTab
      v-model:left-active="leftActive"
      :left-label="'Browse'"
      :right-label="'Lists'"
    >
      <template #left>
        <div class="filters-bar">
          <FavoriteToggle
            :model-value="showOnlyFavorites"
            :disabled="armyFavorites.length === 0"
            @update:model-value="updateShowOnlyFavoritesState"
          />
        </div>
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
                :label="name"
                :points="lore.points"
                :favorite="armyFavorites.includes(name)"
                :show-favorite-toggle="true"
                @click="
                  () => $router.push({ name: 'ManifestationLore', params: { loreName: name } })
                "
                @toggle-favorite="(fav) => toggleArmyFavorite(name, fav)"
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
                :label="name"
                :points="regiment.points"
                :favorite="armyFavorites.includes(name)"
                :show-favorite-toggle="true"
                @click="() => goToRegimentOfRenown(name)"
                @toggle-favorite="(fav) => toggleArmyFavorite(name, fav)"
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
                <template v-if="army.armiesOfRenown && army.armiesOfRenown.length > 0">
                  <ListButtonSection
v-if="(showLegends && army.legends) || !army.legends"
                    :label="army.name"
                    :favorite="armyFavorites.includes(army.name)"
                    :show-favorite-toggle="true"
                    :legends="army.legends"
                    @click="selectArmy(army.name)"
                    @toggle-favorite="(fav) => toggleArmyFavorite(army.name, fav)"
                  >
                    <ul>
                      <li
                        v-for="aor in army.armiesOfRenown"
                        :key="aor.name"
                      >
                        <ListButton
v-if="(showLegends && aor.legends) || !aor.legends"
                          :label="aor.name"
                          :legends="aor.legends"
                          :show-favorite-toggle="false"
                          @click="selectArmy(army.name + ' - ' + aor.name)"
                        />
                      </li>
                    </ul>
                  </ListButtonSection>
                </template>
                <template v-else>
                  <ListButton
v-if="(showLegends && army.legends) || !army.legends"
                    :label="army.name"
                    :favorite="armyFavorites.includes(army.name)"
                    :show-favorite-toggle="true"
                    :legends="army.legends"
                    @click="selectArmy(army.name)"
                    @toggle-favorite="(fav) => toggleArmyFavorite(army.name, fav)"
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
    <div class="sigdex-version">Sigdex v{{ SIGDEX_VERSION }}</div>
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
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGame } from '../../shared/composables/useGame';
import ListButton from '../../shared/components/ListButton.vue';
import FavoriteToggle from '../../core/components/FavoriteToggle.vue';
import SettingsButton from '../../core/components/SettingsButton.vue';
import { SIGDEX_VERSION } from '../../../version';
import Section from '../../core/components/ContentSection.vue';
import ListList from '../components/ListList.vue';
import TwoTab from '../../core/components/TwoTab.vue';
import ListButtonSection from '../../shared/components/ListButtonSection.vue';
import {
  saveFavorite,
  removeFavorite,
  getFavorites,
  getFavoriteToggleState,
  setFavoriteToggleState,
  SHOW_LEGENDS_KEY,
} from '../../../favorites';
import { useStorage } from '@vueuse/core';

const router = useRouter();
const armyFavorites = ref<string[]>([]);
const showOnlyFavorites = ref(getFavoriteToggleState('army'));
const leftActive = ref(true);

const showLegends = useStorage(SHOW_LEGENDS_KEY, false);
// Load game data (reactive, not awaited)
const { game, loading, error } = useGame();

onMounted(() => {
  armyFavorites.value = getFavorites('army');
});

function selectArmy(army: string) {
  router.push({ name: 'UnitList', params: { armyName: army } });
}
function toggleArmyFavorite(army: string, fav: boolean) {
  if (fav) {
    saveFavorite('army', army);
    if (!armyFavorites.value.includes(army)) armyFavorites.value.push(army);
  } else {
    removeFavorite('army', army);
    armyFavorites.value = armyFavorites.value.filter((a) => a !== army);
  }
}
function updateShowOnlyFavoritesState(newVal: boolean) {
  showOnlyFavorites.value = newVal;
  setFavoriteToggleState('army', newVal);
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
    if (showOnlyFavorites.value && armyFavorites.value.length > 0) {
      filtered = armies.filter((army) => armyFavorites.value.includes(army.name));
    }
    return { name: String(name), armies: filtered };
  });
});

const filteredManifestationLores = computed(() => {
  if (!game.value) return [];
  // Use the keys (lore names) from the map
  const allLoreNames = Array.from(game.value.universalManifestationLores.entries());
  if (showOnlyFavorites.value && armyFavorites.value.length > 0) {
    return allLoreNames.filter(([loreName]) => armyFavorites.value.includes(loreName));
  }
  return allLoreNames;
});

const filteredRegimentsOfRenownList = computed(() => {
  if (!game.value) return [];
  let allRegiments = Array.from(game.value.regimentsOfRenown.entries());
  if (showOnlyFavorites.value && armyFavorites.value.length > 0) {
    allRegiments = allRegiments.filter(([name]) => armyFavorites.value.includes(name));
  }
  // Sort alphabetically by regiment name
  return allRegiments.sort((a, b) => a[0].localeCompare(b[0]));
});

function goToRegimentOfRenown(regiment: string) {
  router.push({ name: 'RegimentOfRenown', params: { regimentName: regiment } });
}

watch(armyFavorites, (favs) => {
  if (showOnlyFavorites.value && favs.length === 0) {
    showOnlyFavorites.value = false;
    setFavoriteToggleState('army', false);
  }
});
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
.filters-bar {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.2rem;
}
.lists-placeholder {
  text-align: center;
  color: #888;
  font-size: 1.1em;
  margin-top: 2em;
}
.sigdex-version {
  margin-top: 2rem;
  text-align: center;
  color: #888;
  font-size: 0.95em;
}
.error {
  color: #c00;
  text-align: center;
  margin-top: 1rem;
}
</style>
