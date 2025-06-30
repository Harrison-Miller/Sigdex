<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAllLists, saveList, deleteList, calculatePoints } from '../utils/list-manager';
import BackButton from '../components/BackButton.vue';
import SettingsButton from '../components/SettingsButton.vue';
import type { List } from '../common/ListData';
import ListRegiment from '../components/ListRegiment.vue';
import { loadArmy, loadLores } from '../army';
import type { Army } from '../common/ArmyData';
import ListSettingsModal from '../components/ListSettingsModal.vue';

const route = useRoute();
const router = useRouter();
const listName = route.params.name as string;
const list = ref<List | undefined>();
const showSettingsModal = ref(false);
const renameValue = ref('');
const lists = ref(getAllLists());
const armyData = ref<Army | null>(null);
const lores = ref<Map<string, any> | null>(null);
const loadingArmy = ref(false);

onMounted(async () => {
  const found = getAllLists().find((l) => l.name === listName);
  list.value = found;
  if (found) {
    loadingArmy.value = true;
    try {
      armyData.value = await loadArmy(found.faction);
      lores.value = await loadLores();
    } catch (e) {
      armyData.value = null;
      lores.value = null;
    } finally {
      loadingArmy.value = false;
    }
  }
});

const POINTS_CAP = 2000;

const pointsTotal = computed(() => {
  if (!list.value || !armyData.value) return 0;
  return calculatePoints(list.value, armyData.value, lores.value ?? undefined);
});

function addRegiment() {
  if (!list.value) return;
  list.value.regiments.push({ leader: { name: '' }, units: [] });
  // Save updated list to localStorage
  saveList(list.value);
}

function openSettings() {
  if (list.value) renameValue.value = list.value.name;
  showSettingsModal.value = true;
}
function closeSettings() {
  showSettingsModal.value = false;
}
function handleRename(newName: string) {
  if (!list.value) return;
  const oldName = list.value.name;
  if (oldName === newName) {
    closeSettings();
    return;
  }
  // Remove the old list first
  deleteList(oldName);
  list.value.name = newName;
  saveList(list.value);
  lists.value = getAllLists();
  closeSettings();
  router.replace({ name: 'ListBuilder', params: { name: newName } });
}
function handleDelete() {
  if (!list.value) return;
  deleteList(list.value.name);
  closeSettings();
  router.push({ name: 'Armies' });
}
function deleteRegiment(idx: number) {
  if (!list.value) return;
  list.value.regiments.splice(idx, 1);
  saveList(list.value);
}
function handleDeleteUnit(regimentIdx: number, unitIdx: number | string) {
  if (!list.value) return;
  if (!list.value.regiments[regimentIdx]) return;
  if (unitIdx === 'leader') {
    list.value.regiments[regimentIdx].leader = { name: '' };
  } else if (typeof unitIdx === 'number') {
    list.value.regiments[regimentIdx].units.splice(unitIdx, 1);
  }
  saveList(list.value);
}
</script>
<template>
  <div class="list-builder-view">
    <div class="header-bar">
      <BackButton />
      <SettingsButton class="settings-btn" :size="36" @click="openSettings" />
    </div>
    <h1 v-if="list">{{ list.name }}</h1>
    <div v-if="list" class="subheader">{{ list.faction }}</div>
    <div v-else class="not-found">List not found.</div>
    <div v-if="list">
      <div v-for="(regiment, idx) in list.regiments" :key="idx" class="regiment-block">
        <ListRegiment
          :regiment="regiment"
          :title="`Regiment ${idx + 1}`"
          :army="armyData"
          :armyName="list.faction"
          :settingsOpen="showSettingsModal"
          @delete="() => deleteRegiment(idx)"
          @delete-unit="(unitIdx) => handleDeleteUnit(idx, unitIdx)"
        />
      </div>
      <button v-if="list.regiments.length < 5" class="add-regiment-btn" @click="addRegiment">
        Add regiment
      </button>
    </div>
    <ListSettingsModal
      v-model="showSettingsModal"
      :initialName="list?.name || ''"
      :existingNames="lists.map((l) => l.name)"
      @rename="handleRename"
      @delete="handleDelete"
      @close="closeSettings"
    />
    <div class="points-fab" v-if="list && armyData">
      <span :class="{ 'over-cap': pointsTotal > POINTS_CAP }">
        {{ pointsTotal }} / {{ POINTS_CAP }} pts
      </span>
    </div>
  </div>
</template>

<style scoped>
.list-builder-view {
  padding: 2em 1em;
  max-width: 600px;
  margin: 0 auto;
}
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.2em;
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
.subheader {
  color: #666;
  font-size: 1.2em;
  margin-bottom: 2em;
}
.not-found {
  color: #a00;
  font-size: 1.2em;
  margin-top: 2em;
}
.add-regiment-btn {
  display: block;
  width: 100%;
  margin: 2em auto 0 auto;
  background: #a00;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.9em 0;
  font-size: 1.15em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 340px;
}
.add-regiment-btn:hover {
  background: #c00;
}
.points-fab {
  position: fixed;
  left: 2em;
  bottom: 2em;
  background: #fff;
  color: #222;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.13);
  padding: 0.5em 0.9em;
  font-size: 0.95em;
  font-weight: 600;
  z-index: 1200;
  border: 2px solid #a00;
  min-width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.points-fab .over-cap {
  color: #a00;
}
.points-fab span {
  font-size: 1em;
}
</style>
