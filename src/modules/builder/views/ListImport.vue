<template>
  <div class="list-import-wrapper">
    <BackButton />
    <div class="list-import-view">
      <div class="import-header">
        <h1 class="import-title">Import List</h1>
      </div>
      <div class="import-container">
        <label for="import-textarea">Paste your exported list here:</label>
        <textarea
          id="import-textarea"
          v-model="importText"
          class="import-textarea"
          aria-label="Import list content"
        />
        <div class="import-actions-centered">
          <button @click="handleBack">Cancel</button>
          <button
            class="import-btn"
            :disabled="!canImport"
            @click="handleImport"
          >
            Import
          </button>
        </div>
        <div
          v-if="error"
          class="import-error"
        >
          {{ error }}
        </div>
      </div>
    </div>
    <ModalBox v-model="showCreateModal">
      <h2>Confirm Import</h2>
      <TextInput
        v-model="createName"
        label="List Name:"
        placeholder="List name"
        style="width: 98%;"
      />
      <div class="import-summary">
        <div>Summary:</div>
        <ul>
          <li v-if="importedList?.faction">{{ importedList.faction }}</li>
          <li v-if="importedList?.formation">{{ importedList.formation }}</li>
          <li>Regiments: {{ importedList?.regiments?.length ?? 0 }}</li>
          <li v-if="importedList?.factionTerrain">Faction Terrain: {{ importedList.factionTerrain }}</li>
          <li v-if="importedList?.regimentOfRenown">Regiment of Renown: {{ importedList.regimentOfRenown }}</li>
          <li v-if="importedList?.auxiliaryUnits && importedList.auxiliaryUnits.length > 0">
            Auxiliary Units: {{ importedList.auxiliaryUnits.length }}
          </li>
          <li v-if="importedList?.spellLore">Spell Lore: {{ importedList.spellLore }}</li>
          <li v-if="importedList?.prayerLore">Prayer Lore: {{ importedList.prayerLore }}</li>
          <li v-if="importedList?.manifestationLore">Manifestation Lore: {{ importedList.manifestationLore }}</li>
        </ul>
      </div>
      <div class="modal-actions-centered">
        <button @click="() => showCreateModal = false">Cancel</button>
        <button class="import-btn" :disabled="!createName.trim()" @click="handleCreate">Confirm</button>
      </div>
    </ModalBox>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { importList } from '../importList';
import BackButton from '../../core/components/BackButton.vue';
import { useGame } from '../../shared/composables/useGame';
import { createList } from '../../../list/manage';
import ModalBox from '../../core/components/ModalBox.vue';
import TextInput from '../../core/components/TextInput.vue';

const router = useRouter();
const importText = ref('');
const error = ref<string | null>(null);
const { game } = useGame();

const canImport = computed(
  () => importText.value.trim().length > 0
);

const showCreateModal = ref(false);
const importedList = ref<any>(null);
const createName = ref('');

function handleBack() {
  router.back();
}

function handleImport() {
  if (!game.value) {
    error.value = 'Game data not loaded.';
    return;
  }
  try {
    const imported = importList(importText.value, game.value);
    importedList.value = imported;
    // Use imported name or fallback
    createName.value = imported.name?.trim() || (imported.faction ? `${imported.faction} Import` : 'Imported List');
    showCreateModal.value = true;
    error.value = null;
  } catch (e: any) {
    error.value = e.message || 'Failed to import list.';
  }
}

function handleCreate() {
  if (!importedList.value) return;
  importedList.value.name = createName.value;
  const id = createList(importedList.value);
  showCreateModal.value = false;
  router.replace({ name: 'ListBuilder', params: { id } });
}
</script>
<style scoped>
.list-import-wrapper {
  padding: 2rem;
}
.import-header {
  margin-bottom: 1rem;
}
.import-title {
  font-size: 1.5rem;
  font-weight: bold;
}
.import-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.import-textarea {
  width: 100%;
  min-height: 550px;
  font-family: monospace;
  font-size: 1rem;
}
.import-actions-centered {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}
.modal-actions-centered {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.2em;
}
.import-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}
.import-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.import-error {
  color: #c00;
  font-weight: bold;
}
.import-summary {
  margin-bottom: 1em;
  font-size: 1em;
  color: #333;
}
.import-summary ul {
  padding: 0;
  list-style: disc inside;
  text-align: left;
}
</style>
