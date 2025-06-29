<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { orderArmies, chaosArmies, deathArmies, destructionArmies } from '../common/ArmyData';
import { universalManifestationLores } from '../common/ManifestationData';
import {
  saveFavorite,
  removeFavorite,
  getFavorites,
  getFavoriteToggleState,
  setFavoriteToggleState,
} from '../favorites';
import ListButton from '../components/ListButton.vue';
import FavoriteToggle from '../components/FavoriteToggle.vue';
import SettingsButton from '../components/SettingsButton.vue';
import { SIGDEX_VERSION } from '../version';
import Section from '../components/Section.vue';
import ListListComponent from '../components/ListListComponent.vue';
const router = useRouter();
const armyFavorites = ref<string[]>([]);
const showOnlyFavorites = ref(getFavoriteToggleState('army'));
const activeTab = ref<'browse' | 'lists'>('browse');

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

const grandAlliances = [
  { name: 'Order', armies: orderArmies },
  { name: 'Chaos', armies: chaosArmies },
  { name: 'Death', armies: deathArmies },
  { name: 'Destruction', armies: destructionArmies },
];

const filteredArmiesByAlliance = computed(() => {
  return grandAlliances.map(({ name, armies }) => {
    let filtered = armies;
    if (showOnlyFavorites.value && armyFavorites.value.length > 0) {
      filtered = armies.filter((a) => armyFavorites.value.includes(a.name));
    }
    return { name, armies: filtered };
  });
});

const filteredManifestationLores = computed(() => {
  if (showOnlyFavorites.value && armyFavorites.value.length > 0) {
    return universalManifestationLores.filter((lore) => armyFavorites.value.includes(lore));
  }
  return universalManifestationLores;
});

watch(armyFavorites, (favs) => {
  if (showOnlyFavorites.value && favs.length === 0) {
    showOnlyFavorites.value = false;
    setFavoriteToggleState('army', false);
  }
});
</script>
<template>
  <div class="list-container">
    <div class="header-bar">
      <SettingsButton class="settings-btn" :size="36" @click="goToSettings" />
      <h1>Select an Army</h1>
    </div>
    <div class="tab-bar">
      <button :class="{ active: activeTab === 'browse' }" @click="activeTab = 'browse'">
        Browse
      </button>
      <button :class="{ active: activeTab === 'lists' }" @click="activeTab = 'lists'">Lists</button>
    </div>
    <div v-if="activeTab === 'browse'">
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
              <ListButton
                :label="army.name"
                :favorite="armyFavorites.includes(army.name)"
                :showFavoriteToggle="true"
                @click="selectArmy(army.name)"
                @toggle-favorite="(fav) => toggleArmyFavorite(army.name, fav)"
              />
            </li>
          </ul>
        </Section>
      </div>
    </div>
    <div v-else-if="activeTab === 'lists'">
      <ListListComponent />
    </div>
    <div class="sigdex-version">Sigdex v{{ SIGDEX_VERSION }}</div>
  </div>
</template>
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
</style>
