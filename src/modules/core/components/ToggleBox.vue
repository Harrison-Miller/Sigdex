<template>
  <label
    class="toggle-box"
    :class="{ checked: modelValue, mini: mini }"
  >
    <span class="toggle-label"><slot /></span>
    <span class="toggle-slider" />
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement)?.checked ?? false)"
    >
  </label>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; mini?: boolean }>();
defineEmits(['update:modelValue']);
</script>

<style scoped>
.toggle-box {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  gap: 0.7em;
}
.toggle-box input[type='checkbox'] {
  display: none;
}
.toggle-label {
  font-size: 1.5em;
  color: var(--text-main);
  margin-right: 0.2em;
}
.toggle-slider {
  width: 76px;
  height: 44px;
  background: var(--bg-sub);
  border-radius: 24px;
  position: relative;
  transition: background 0.18s;
  border: 2px solid var(--border-color);
}
.toggle-slider::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 6px;
  width: 32px;
  height: 32px;
  background: var(--bg-main);
  border-radius: 50%;
  transition: transform 0.18s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.toggle-box.checked .toggle-slider {
  background: var(--success);
}
.toggle-box.checked .toggle-slider::before {
  transform: translateX(32px);
  background: var(--bg-main);
}

/* Mini version styles */
.toggle-box.mini .toggle-label {
  font-size: 1em;
}
.toggle-box.mini .toggle-slider {
  width: 50px;
  height: 28px;
}
.toggle-box.mini .toggle-slider::before {
  width: 20px;
  height: 20px;
  left: 4px;
  top: 4px;
}
.toggle-box.mini.checked .toggle-slider::before {
  transform: translateX(22px);
}
</style>
