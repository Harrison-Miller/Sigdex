<template>
  <div class="section-wrapper">
    <div class="section-divider"></div>
    <div class="section-header-row" @click="collapsed = !collapsed" style="cursor: pointer">
      <h2 class="section-title"><slot name="title" /></h2>
      <button class="collapse-btn" @click.stop="collapsed = !collapsed">
        <span v-if="collapsed">&#9654;</span>
        <span v-else>&#9660;</span>
      </button>
    </div>
    <div v-show="!collapsed" class="section-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps } from 'vue';
const props = defineProps<{ modelValue?: boolean }>();
const collapsed = ref(props.modelValue ?? false);
watch(
  () => props.modelValue,
  (val) => {
    if (typeof val === 'boolean') collapsed.value = val;
  }
);
import { defineEmits } from 'vue';
const emit = defineEmits(['update:modelValue']);
watch(collapsed, (val) => emit('update:modelValue', val));
</script>

<style scoped>
.section-wrapper {
  margin-bottom: 1.2em;
}
.section-divider {
  border-top: 1.5px solid #e0e0e0;
  margin: 1.2em 0 0.7em 0;
}
.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5em;
}
.section-title {
  font-size: 1.25em;
  font-weight: 600;
  margin: 0.2em 0 0.2em 0;
}
.collapse-btn {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  color: #888;
  padding: 0 0.2em;
  transition: color 0.2s;
}
.collapse-btn:hover {
  color: #222;
}
.section-content {
  margin-top: 0.5em;
}
</style>
