<template>
  <div class="list-export-wrapper">
    <BackButton />
    <div class="list-export-view">
      <div class="export-header">
        <button
          class="copy-button"
          aria-label="Copy to clipboard"
          @click="copyToClipboard"
        >
          <font-awesome-icon icon="fa-solid fa-copy" />
          Copy to Clipboard
        </button>
        <h1
          v-if="list"
          class="export-title"
        >
          {{ list.name }} - Export
        </h1>
      </div>
      <div
        v-if="list && !loading"
        class="export-container"
      >
        <textarea
          :value="exportedText"
          readonly
          class="export-textarea"
          aria-label="Exported list content"
        />
      </div>
      <div
        v-else
        class="not-found"
      >
        List not found or army data not loaded.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { exportList } from '../exportList';
import BackButton from '../../core/components/BackButton.vue';
import { useGame } from '../../shared/composables/useGame';
import { useList } from '../../shared/composables/useList';

const route = useRoute();
const id = route.params.id as string;
const list = useList(id);
const { game, loading } = useGame();

const exportedText = computed(() => {
  if (!list.value || !game.value) return '';
  return exportList(list.value, game.value);
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
  background: var(--bg-sub);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: normal;
  transition:
    background 0.2s,
    color 0.2s;
}

.copy-button:hover {
  background: var(--bg-head);
  color: var(--text-main);
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
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 14px;
  line-height: 1.4;
  background: var(--bg-head);
  color: var(--text-main);
  resize: none;
  outline: none;
  overflow: auto;
  box-sizing: border-box;
}

@media (max-width: 600px) {
  .export-textarea {
    min-height: 60vh;
    max-height: 70vh;
    font-size: 1em;
  }
}

.export-textarea:focus {
  border-color: var(--primary);
  background: var(--bg-sub);
}

.not-found {
  padding: 32px;
  text-align: center;
  color: var(--text-muted);
  font-size: 1.1rem;
}
</style>
