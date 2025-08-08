<template>
  <label class="text-input-label">
    {{ label }}
    <div class="text-input-container">
      <input
        v-bind="$attrs"
        :type="type"
        :value="modelValue"
        class="text-input"
        :class="{ 'has-clear-button': showClearButton && modelValue }"
        @input="onInput"
      >
      <button
        v-if="showClearButton && modelValue"
        type="button"
        class="clear-button"
        aria-label="Clear input"
        @click="clearInput"
      >
        ×
      </button>
    </div>
  </label>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
defineProps<{
  modelValue: string;
  type?: string;
  label?: string;
  showClearButton?: boolean;
}>();
const emit = defineEmits(['update:modelValue']);

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | null;
  emit('update:modelValue', target?.value ?? '');
}

function clearInput() {
  emit('update:modelValue', '');
}
</script>

<style scoped>
.text-input-label {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  font-weight: 500;
}

.text-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.text-input {
  padding: 0.5em;
  border-radius: 6px;
  background: var(--bg-head);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-size: 1em;
  width: 100%;
}

.text-input.has-clear-button {
  padding-right: 2.5em;
}

.text-input:focus {
  outline: none;
  background: var(--bg-sub);
  border-color: var(--border-primary);
  box-shadow: 0 0 0 2px rgba(66, 165, 245, 0.2);
}

.clear-button {
  position: absolute;
  right: 0.5em;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.2em;
  line-height: 1;
  padding: 0.2em;
  cursor: pointer;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5em;
  height: 1.5em;
}

.clear-button:hover {
  background: var(--bg-selected);
  color: var(--text-main);
}

.clear-button:focus {
  outline: none;
  background: var(--bg-selected);
  box-shadow: 0 0 0 2px rgba(66, 165, 245, 0.2);
}
</style>
