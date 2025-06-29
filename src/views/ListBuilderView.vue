<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAllLists, saveList, deleteList, calculatePoints } from '../utils/list-manager';
import BackButton from '../components/BackButton.vue';
import SettingsButton from '../components/SettingsButton.vue';
import type { List } from '../common/ListData';
import ListRegimentComponent from '../components/ListRegimentComponent.vue';
import { loadArmy, loadLores } from '../army';
import type { Army } from '../common/ArmyData';

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

const isRenameUnique = computed(() => {
  const trimmed = renameValue.value.trim();
  if (!trimmed) return false;
  return !lists.value.some((l) => l.name === trimmed && l.name !== list.value?.name);
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
function doRename() {
  const trimmed = renameValue.value.trim();
  if (!trimmed || !isRenameUnique.value || !list.value) return;
  const oldName = list.value.name;
  if (oldName === trimmed) {
    closeSettings();
    return;
  }
  // Remove the old list first
  deleteList(oldName);
  list.value.name = trimmed;
  saveList(list.value);
  lists.value = getAllLists();
  closeSettings();
  router.replace({ name: 'ListBuilder', params: { name: trimmed } });
}
function doDelete() {
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
        <ListRegimentComponent
          :regiment="regiment"
          :title="`Regiment ${idx + 1}`"
          :army="armyData"
          :armyName="list.faction"
          @delete="() => deleteRegiment(idx)"
          @delete-unit="(unitIdx) => handleDeleteUnit(idx, unitIdx)"
        />
      </div>
      <button v-if="list.regiments.length < 5" class="add-regiment-btn" @click="addRegiment">
        Add regiment
      </button>
    </div>
    <div v-if="showSettingsModal" class="modal-overlay" @click.self="closeSettings">
      <div class="modal settings-modal">
        <h3>List Settings</h3>
        <label>
          Rename List
          <input v-model="renameValue" type="text" placeholder="New list name" />
        </label>
        <div v-if="renameValue && !isRenameUnique" class="error-message">
          A list with this name already exists.
        </div>
        <div class="modal-actions">
          <button @click="closeSettings">Cancel</button>
          <button class="save-btn" @click="doRename" :disabled="!renameValue || !isRenameUnique">
            Rename
          </button>
        </div>
        <hr />
        <button class="delete-btn" @click="doDelete">Delete List</button>
      </div>
    </div>
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}
.settings-modal {
  min-width: 320px;
  max-width: 95vw;
}
.modal {
  background: #fff;
  color: #222;
  border-radius: 12px;
  padding: 2em 1.5em 1.5em 1.5em;
  min-width: 320px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}
.settings-modal label {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  font-weight: 500;
  margin-bottom: 1em;
}
.settings-modal input[type='text'] {
  width: 100%;
  font-size: 1.1em;
  padding: 0.7em 0.9em;
  border-radius: 6px;
  border: 1px solid #bbb;
  margin-top: 0.3em;
  box-sizing: border-box;
}
.save-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1.2em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.save-btn:disabled {
  background: #ccc;
  color: #888;
  cursor: not-allowed;
}
.save-btn:not(:disabled):hover {
  background: #1565c0;
}
.delete-btn {
  background: #a00;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1.2em;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.2em;
  width: 100%;
  transition: background 0.2s;
}
.delete-btn:hover {
  background: #c00;
}
.error-message {
  color: #d00;
  font-size: 0.9em;
  margin-top: 0.5em;
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
