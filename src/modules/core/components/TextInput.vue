<template>
  <label class="text-input-label">
    {{ label }}
    <input
      v-bind="$attrs"
      :type="type"
      :value="modelValue"
      class="text-input"
      @input="onInput"
    >
  </label>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
defineProps<{
  modelValue: string;
  type?: string;
  label: string;
}>();
const emit = defineEmits(['update:modelValue']);

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | null;
  emit('update:modelValue', target?.value ?? '');
}
</script>

<style scoped>
.text-input-label {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  font-weight: 500;
}
.text-input {
  padding: 0.5em;
  border-radius: 6px;
  border: 1px solid #bbb;
  font-size: 1em;
}
</style>
