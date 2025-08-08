<template>
  <label class="checkbox-label">
    <input
      type="checkbox"
      :checked="modelValue"
      class="checkbox-input"
      @change="updateValue"
    />
    <span class="checkbox-custom"></span>
    <span v-if="label" class="checkbox-text">{{ label }}</span>
  </label>
</template>
<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  label?: string;
}>();

const emit = defineEmits(['update:modelValue']);

function updateValue(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
}

</script>
<style scoped>
.checkbox-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.checkbox-custom {
  width: 1.1em;
  height: 1.1em;
  border: 2px solid var(--border-color, #888);
  border-radius: 4px;
  background: var(--bg-main, #fff);
  margin-right: 0.5em;
  display: inline-block;
  transition: border-color 0.2s, background 0.2s;
  position: relative;
  vertical-align: middle;
}
.checkbox-input:checked + .checkbox-custom {
  background: var(--success);
  border-color: var(--success);
}
.checkbox-custom::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0.8em;
  height: 0.8em;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
}
.checkbox-input:checked + .checkbox-custom::after {
  opacity: 1;
}
.checkbox-text {
  font-size: 1em;
  color: var(--text-main, #222);
}
</style>
