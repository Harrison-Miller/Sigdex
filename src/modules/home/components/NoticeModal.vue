<template>
  <div
    v-if="visible"
    class="notice-modal-overlay"
    @mousedown.self="close"
  >
    <div class="notice-modal">
      <button
        class="notice-modal-close"
        @click="close"
      >
        &times;
      </button>
      <h2>{{ notice.title }}</h2>
      <div
        class="notice-modal-body"
        v-html="notice.body"
      />
      <div class="notice-modal-timestamp">{{ formattedTimestamp }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps<{
  notice: { title: string; body: string; timestamp: string };
  visible: boolean;
}>();
const emit = defineEmits(['close']);

function close() {
  emit('close');
}

const formattedTimestamp = computed(() => {
  const date = new Date(props.notice.timestamp);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
});
</script>

<style scoped>
.notice-modal-overlay {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.notice-modal {
  background: var(--bg-head);
  color: var(--text-main);
  border-radius: 10px;
  max-width: 400px;
  width: 90vw;
  padding: 2em 1.5em 1.5em 1.5em;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
  position: relative;
}
.notice-modal-close {
  position: absolute;
  right: 0.2em;
  top: 0.2em;
  background: none;
  border: none;
  font-size: 2em;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.2em;
}
.notice-modal-body {
  margin: 1em 0;
}
.notice-modal-timestamp {
  font-size: 0.9em;
  color: var(--text-muted);
  text-align: right;
}
</style>
