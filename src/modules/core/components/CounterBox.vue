<template>
  <div class="counter-box">
    <button
      class="counter-btn"
      :disabled="modelValue <= min"
      :class="{ disabled: modelValue <= min }"
      @click="decrement"
    >
      -
    </button>
    <span class="counter-value">{{ modelValue }}</span>
    <button
      class="counter-btn"
      :disabled="modelValue >= max"
      :class="{ disabled: modelValue >= max }"
      @click="increment"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
}>();
const emit = defineEmits(['update:modelValue']);
const min = computed(() => props.min ?? 0);
const max = computed(() => props.max ?? 99);
const step = computed(() => props.step ?? 1);
function increment() {
  if (props.modelValue < max.value)
    emit('update:modelValue', Math.min(props.modelValue + step.value, max.value));
}
function decrement() {
  if (props.modelValue > min.value)
    emit('update:modelValue', Math.max(props.modelValue - step.value, min.value));
}
</script>

<style scoped>
.counter-box {
  display: flex;
  align-items: center;
  gap: 0;
}
.counter-btn {
  width: 2em;
  height: 2em;
  border: 1.5px solid #bbb;
  background: #f5f6fa;
  color: #333;
  font-size: 1.3em;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  cursor: pointer;
  user-select: none;
  transition:
    background 0.15s,
    color 0.15s;
  padding: 0;
}
.counter-btn.disabled,
.counter-btn:disabled {
  background: #e0e1e6;
  color: #aaa;
  cursor: not-allowed;
  border-color: #ccc;
}
.counter-btn:active {
  background: #e0e1e6;
}
.counter-btn:first-child {
  border-top-left-radius: 7px;
  border-bottom-left-radius: 7px;
  border-right: none;
}
.counter-btn:last-child {
  border-top-right-radius: 7px;
  border-bottom-right-radius: 7px;
  border-left: none;
}
.counter-value {
  min-width: 2.5em;
  height: 2.35em;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-top: 1.5px solid #bbb;
  border-bottom: 1.5px solid #bbb;
  border-left: none;
  border-right: none;
  font-size: 1.1em;
  font-weight: 500;
  box-sizing: border-box;
  line-height: 2em;
  padding: 0;
}
</style>
