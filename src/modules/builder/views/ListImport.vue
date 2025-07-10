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
        ></textarea>
        <label for="list-name">List Name:</label>
        <input id="list-name" v-model="listName" type="text" placeholder="List name" />
        <div class="import-actions">
          <button @click="handleBack">Cancel</button>
          <button class="import-btn" @click="handleImport" :disabled="!canImport">Import</button>
        </div>
        <div v-if="error" class="import-error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { importList } from '../importList';
import { createList } from '../../../utils/list-manager';
import BackButton from '../../core/components/BackButton.vue';
import { useGame } from '../../shared/composables/useGame';

const router = useRouter();
const importText = ref('');
const listName = ref('');
const error = ref<string | null>(null);
const { game } = useGame();

const canImport = computed(
  () => importText.value.trim().length > 0 && listName.value.trim().length > 0
);

function handleBack() {
  router.back();
}

async function handleImport() {
  if (!game.value) {
    error.value = 'Game data not loaded.';
    return;
  }

  error.value = null;
  try {
    const imported = await importList(importText.value, game.value);
    imported.name = listName.value;
    createList(imported);
    router.push({ name: 'ListBuilder', params: { id: imported.id } });
  } catch (e: any) {
    error.value = e?.message || 'Failed to import list.';
  }
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
.import-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
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
</style>
