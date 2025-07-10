<template>
  <div class="list-container">
    <div class="header-bar">
      <SettingsButton class="settings-btn" :size="36" @click="goToSettings" />
      <h1>Select an Army</h1>
    </div>
    <TwoTab :left-label="'Browse'" :right-label="'Lists'" v-model:leftActive="leftActive">
      <template #left>
        <div class="filters-bar">
          <FavoriteToggle
            :model-value="showOnlyFavorites"
            @update:modelValue="updateShowOnlyFavoritesState"
            :disabled="armyFavorites.length === 0"
          />
        </div>
        <Section v-if="filteredManifestationLores && filteredManifestationLores.length > 0">
          <template #title>Universal Manifestations</template>
          <ul>
            <li v-for="lore in filteredManifestationLores" :key="lore">
              <ListButton
                :label="lore"
                :favorite="armyFavorites.includes(lore)"
                :showFavoriteToggle="true"
                @click="() => $router.push({ name: 'ManifestationLore', params: { lore } })"
                @toggle-favorite="(fav) => toggleArmyFavorite(lore, fav)"
              />
            </li>
          </ul>
        </Section>
        <div v-for="alliance in filteredArmiesByAlliance" :key="alliance.name">
          <Section v-if="alliance && alliance.armies.length > 0">
            <template #title>{{ alliance.name }}</template>
            <ul>
              <li v-for="army in alliance.armies" :key="army.name">
                <template v-if="army.armiesOfRenown && army.armiesOfRenown.length > 0">
                  <ListButtonSection
                    :label="army.name"
                    :favorite="armyFavorites.includes(army.name)"
                    :showFavoriteToggle="true"
                    @click="selectArmy(army.name)"
                    @toggle-favorite="(fav) => toggleArmyFavorite(army.name, fav)"
                  >
                    <ul>
                      <li v-for="aor in army.armiesOfRenown" :key="aor">
                        <ListButton
                          :label="aor"
                          :showFavoriteToggle="false"
                          @click="selectArmy(army.name + ' - ' + aor)"
                        />
                      </li>
                    </ul>
                  </ListButtonSection>
                </template>
                <template v-else>
                  <ListButton
                    :label="army.name"
                    :favorite="armyFavorites.includes(army.name)"
                    :showFavoriteToggle="true"
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
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGame } from '../modules/shared/composables/useGame';
import ListButton from '../modules/shared/components/ListButton.vue';
import FavoriteToggle from '../modules/core/components/FavoriteToggle.vue';
import SettingsButton from '../modules/core/components/SettingsButton.vue';
import { SIGDEX_VERSION } from '../version';
import Section from '../modules/core/components/Section.vue';
import ListList from '../components/ListList.vue';
import TwoTab from '../modules/core/components/TwoTab.vue';
import ListButtonSection from '../modules/shared/components/ListButtonSection.vue';
import {
  saveFavorite,
  removeFavorite,
  getFavorites,
  getFavoriteToggleState,
  setFavoriteToggleState,
} from '../favorites';

const router = useRouter();
const armyFavorites = ref<string[]>([]);
const showOnlyFavorites = ref(getFavoriteToggleState('army'));
const leftActive = ref(true);

// Load game data (reactive, not awaited)
const { game, loading, error } = useGame();

onMounted(() => {
  armyFavorites.value = getFavorites('army');
});

function selectArmy(army: string) {
  router.push({ name: 'UnitList', params: { army } });
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
  const allLoreNames = Array.from(game.value.universalManifestationLores.keys());
  if (showOnlyFavorites.value && armyFavorites.value.length > 0) {
    return allLoreNames.filter((loreName) => armyFavorites.value.includes(loreName));
  }
  return allLoreNames;
});

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
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 1.2rem;
}
.settings-btn {
  align-self: flex-end;
  margin-bottom: 0.5rem;
  position: static;
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
