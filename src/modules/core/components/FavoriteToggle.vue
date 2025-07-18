<script setup lang="ts">
import { ref, watch, toRefs, computed } from 'vue';
const props = defineProps<{
  modelValue: boolean;
  disabled?: boolean;
  noText?: boolean;
  size?: number;
}>();
const emit = defineEmits(['update:modelValue']);
const { modelValue, disabled, noText, size } = toRefs(props);
const isActive = ref(!!modelValue.value);
watch(modelValue, (v) => {
  isActive.value = !!v; 
});
const showActive = computed(() => isActive.value && !disabled?.value);
const iconSize = computed(() => size?.value ?? 22);
function toggle() {
  if (disabled?.value) return;
  isActive.value = !isActive.value;
  emit('update:modelValue', isActive.value);
}
</script>
<template>
  <button
    class="favorite-toggle"
    :class="[showActive ? 'active' : '', !noText ? 'with-text' : '', disabled ? 'disabled' : '']"
    :disabled="disabled"
    @click="toggle"
  >
    <svg
      v-if="showActive"
      xmlns="http://www.w3.org/2000/svg"
      :width="iconSize"
      :height="iconSize"
      viewBox="0 0 24 24"
      fill="#ec4899"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      :width="iconSize"
      :height="iconSize"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#aaa"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
    <span v-if="!noText">Show Favorites</span>
  </button>
</template>
<style scoped>
.favorite-toggle {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4em;
  font-size: 1.1em;
  color: var(--color-pink);
  padding: 0.2em 0.6em;
  border-radius: 4px;
  transition:
    background 0.2s,
    color 0.2s;
}
.favorite-toggle.with-text {
  border: 1px solid var(--color-pink);
}
.favorite-toggle.active.with-text {
  background: none;
  border: 1px solid var(--color-pink);
}
.favorite-toggle svg {
  vertical-align: middle;
}
.favorite-toggle.disabled,
.favorite-toggle:disabled {
  color: var(--text-muted) !important;
  background: var(--bg-sub) !important;
  cursor: not-allowed !important;
  opacity: 0.7;
}
</style>
