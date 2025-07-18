<template>
  <div class="section-wrapper">
    <div class="section-divider" />
    <div
      class="section-header-row"
      style="cursor: pointer"
      @click="toggle()"
    >
      <h2 class="section-title"><slot name="title" /></h2>
      <button
        class="collapse-btn"
        @click.stop="toggle()"
      >
        <span v-if="collapsed">&#9654;</span>
        <span v-else>&#9660;</span>
      </button>
    </div>
    <div
      v-show="!collapsed"
      class="section-content"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { useCollapsableState } from '../composables/useCollapsableState';
const props = defineProps<{ defaultCollapsed?: boolean; collapseKey?: string }>();
const { collapsed, toggle } = useCollapsableState(
  props.collapseKey ?? '',
  props.defaultCollapsed ?? false
);
</script>

<style scoped>
.section-wrapper {
  margin-bottom: 1.2em;
}
.section-divider {
  border-top: 1.5px solid var(--border-color);
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
  color: var(--text-muted);
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
