<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { armyList } from '../army';
import { saveFavorite, removeFavorite, getFavorites, getFavoriteToggleState, setFavoriteToggleState } from '../favorites';
import ListButton from '../components/ListButton.vue';
import FavoriteToggle from '../components/FavoriteToggle.vue';
const router = useRouter();
const armyFavorites = ref<string[]>([]);
const showOnlyFavorites = ref(getFavoriteToggleState('army'));

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
    armyFavorites.value = armyFavorites.value.filter(a => a !== army);
  }
}
function updateShowOnlyFavoritesState(newVal: boolean) {
  showOnlyFavorites.value = newVal;
  setFavoriteToggleState('army', newVal);
}

const filteredArmyList = computed(() => {
  if (showOnlyFavorites.value && armyFavorites.value.length > 0) {
    return armyList.filter(a => armyFavorites.value.includes(a));
  }
  return armyList;
});

watch(armyFavorites, favs => {
  if (showOnlyFavorites.value && favs.length === 0) {
    showOnlyFavorites.value = false;
    setFavoriteToggleState('army', false);
  }
});
</script>
<template>
  <div class="list-container">
    <h1>Select an Army</h1>
    <div class="section-divider"></div>
    <div class="filters-bar">
      <FavoriteToggle
        :model-value="showOnlyFavorites"
        @update:modelValue="updateShowOnlyFavoritesState"
        :disabled="armyFavorites.length === 0"
      />
    </div>
    <div class="section-divider"></div>
    <ul>
      <li v-for="army in filteredArmyList" :key="army">
        <ListButton
          :label="army"
          :favorite="armyFavorites.includes(army)"
          @click="selectArmy(army)"
          @toggle-favorite="fav => toggleArmyFavorite(army, fav)"
        />
      </li>
    </ul>
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
</style>
