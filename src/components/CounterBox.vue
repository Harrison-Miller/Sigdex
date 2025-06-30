<template>
  <div class="counter-box">
    <button class="counter-btn" @click="decrement" :disabled="modelValue <= min">-</button>
    <span class="counter-value">{{ modelValue }}</span>
    <button class="counter-btn" @click="increment" :disabled="modelValue >= max">+</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
}>();
const emit = defineEmits(['update:modelValue']);
const min = computed(() => props.min ?? 0);
const max = computed(() => props.max ?? 99);
function increment() {
  if (props.modelValue < max.value) emit('update:modelValue', props.modelValue + 1);
}
function decrement() {
  if (props.modelValue > min.value) emit('update:modelValue', props.modelValue - 1);
}
</script>

<style scoped>
.counter-box {
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.counter-btn {
  background: #f5f5f5;
  border: 1.5px solid #1976d2;
  color: #1976d2;
  border-radius: 6px;
  width: 2em;
  height: 2em;
  font-size: 1.2em;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s,
    border 0.18s;
}
.counter-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.counter-value {
  min-width: 2em;
  text-align: center;
  font-size: 1.1em;
  font-weight: 500;
}
</style>
