<template>
  <div class="list-export-wrapper">
    <BackButton />
    <div class="list-export-view">
      <div class="export-header">
        <button class="copy-button" @click="copyToClipboard" aria-label="Copy to clipboard">
          <font-awesome-icon icon="fa-solid fa-copy" />
          Copy to Clipboard
        </button>
        <h1 class="export-title" v-if="list">{{ list.name }} - Export</h1>
      </div>
      <div v-if="list && armyData" class="export-container">
        <textarea
          :value="exportedText"
          readonly
          class="export-textarea"
          aria-label="Exported list content"
        ></textarea>
      </div>
      <div v-else class="not-found">List not found or army data not loaded.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getList } from '../../../utils/list-manager';
import type { List } from '../../../common/ListData';
import { loadArmy, loadLores } from '../../../army';
import type { Army } from '../../../common/ArmyData';
import type { Lore } from '../../../common/ManifestationData';
import { exportList } from '../exportList';
import BackButton from '../../core/components/BackButton.vue';

const route = useRoute();
const list = ref<List | undefined>();
const armyData = ref<Army | undefined>();
const lores = ref<Map<string, Lore>>();

const exportedText = computed(() => {
  if (!list.value || !armyData.value) return '';
  return exportList(list.value, armyData.value, lores.value);
});

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(exportedText.value);
    // You could add a toast notification here
    console.log('List copied to clipboard');
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = exportedText.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    list.value = getList(id);
    if (list.value) {
      try {
        armyData.value = await loadArmy(list.value.faction);
        lores.value = await loadLores();
      } catch (error) {
        console.error('Error loading army data:', error);
      }
    }
  }
});
</script>

<style scoped>
.list-export-wrapper {
  position: relative;
  height: 100vh;
}

.list-export-view {
  padding: 20px 10px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.export-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
  gap: 12px;
}

.export-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  color: black;
  border: 1px solid black;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: normal;
  transition:
    background 0.2s,
    color 0.2s;
}

.copy-button:hover {
  background: black;
  color: white;
}

.copy-button:active {
  transform: translateY(1px);
}

.export-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.export-textarea {
  flex: 1;
  width: 100%;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 14px;
  line-height: 1.4;
  background: #fafafa;
  resize: none;
  outline: none;
  overflow: auto;
  box-sizing: border-box;
}

.export-textarea:focus {
  border-color: #007bff;
  background: white;
}

.not-found {
  padding: 32px;
  text-align: center;
  color: #666;
  font-size: 1.1rem;
}
</style>
