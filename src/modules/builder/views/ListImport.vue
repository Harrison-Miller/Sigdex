<template>
  <div class="list-import-wrapper">
    <CircleIconButton
      icon="camera"
      :size="36"
      class="floating-camera-btn"
      @click="triggerImageInput"
    />
    <div class="list-import-view">
      <div class="import-header">
        <h1>Import List</h1>
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
          <button
            class="import-btn large"
            :disabled="!canImport"
            @click="handleImport"
          >
            Import
          </button>
        <input
          ref="imageInput"
          type="file"
          accept="image/*"
          capture="environment"
          style="display: none;"
          @change="handleImageUpload"
        />
        </div>
        <div v-if="error" class="import-error">
          <template v-if="error === 'Processing image...'">
            <span class="spinner"></span> Processing image...
          </template>
          <template v-else>
            {{ error }}
          </template>
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
import { Tesseract } from 'tesseract.ts';
import CircleIconButton from '../../core/components/CircleIconButton.vue';
import { useRouter } from 'vue-router';
import { importList } from '../importList';
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

const imageInput = ref<HTMLInputElement | null>(null);

function triggerImageInput() {
  imageInput.value?.click();
}

function handleImageUpload(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (!files || files.length === 0) return;
  const file = files[0];
  // Stub OCR: simulate extracting text from image
  stubOcrFromImage(file);
}

async function stubOcrFromImage(file: File) {
  try {
    error.value = 'Processing image...';
    const imageUrl = URL.createObjectURL(file);
    const result = await Tesseract.recognize(imageUrl).catch((err: any) => { throw err; });
    console.log('OCR Result:', result);
    console.log('Extracted Text:', result.text);
    importText.value = result.text || '';
    error.value = null;
    handleImport();
    URL.revokeObjectURL(imageUrl);
  } catch (err: any) {
    error.value = 'OCR failed: ' + (err.message || err);
  }
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
/* Float BackButton above content */
.list-import-wrapper {
  position: relative;
  height: 100vh;
}
.floating-camera-btn {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  background: var(--bg-main);
}
.list-import-view {
  padding: 20px 10px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.import-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* margin-bottom: 20px; */
  flex-shrink: 0;
  gap: 12px;
}
.import-title {
  margin: 0;
  font-size: 0.5rem;
  font-weight: bold;
}
.import-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.import-textarea {
  background: var(--bg-sub);
  color: var(--text-main);
  width: 100%;
  min-height: 550px;
  max-height: 700px;
  font-family: monospace;
  font-size: 1rem;
}
@media (max-width: 600px) {
  .import-textarea {
    min-height: 60vh;
    max-height: 60vh;
    font-size: 1em;
  }
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
  background: var(--success);
  color: white;
  border: none;
  padding: 0.7rem 2.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.15em;
  font-weight: 600;
  min-width: 180px;
  display: block;
  margin: 0 auto;
}
.import-btn.large {
  min-width: 220px;
  font-size: 1.18em;
  padding: 0.9rem 2.6rem;
}
.import-btn:disabled {
  background: var(--bg-sub);
  color: var(--text-muted);
  cursor: not-allowed;
}
.import-error {
  color: var(--danger);
  font-weight: bold;
}
.spinner {
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  border: 2px solid var(--text-muted);
  border-top: 2px solid var(--success);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 0.5em;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.import-summary {
  margin-bottom: 1em;
  font-size: 1em;
  color: var(--text-main);
}
.import-summary ul {
  padding: 0;
  list-style: disc inside;
  text-align: left;
}
</style>
