<template>
  <div>
    <div class="two-tab-bar">
      <button
        :class="{ active: !rightTabActive }"
        type="button"
        @click="select(true)"
      >
        {{ props.leftLabel }}
      </button>
      <button
        :class="{ active: rightTabActive }"
        type="button"
        @click="select(false)"
      >
        {{ props.rightLabel }}
      </button>
    </div>
    <div v-if="!rightTabActive">
      <slot name="left" />
    </div>
    <div v-else>
      <slot name="right" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue';
import { useCollapsableState } from '../composables/useCollapsableState';

const props = defineProps<{
  leftLabel: string;
  rightLabel: string;
}>();

// Use a unique key for this tab set
const { collapsed: rightTabActive, toggle } = useCollapsableState(
  `twoTab:${props.rightLabel}-${props.leftLabel}`,
  false // default to left tab active (rightTabActive = false)
);

function select(left: boolean) {
  if (left !== !rightTabActive.value) {
    toggle();
  }
}
</script>
<style scoped>
.two-tab-bar {
  display: flex;
  gap: 0;
  margin-bottom: 1.2rem;
  width: 100%;
}
.two-tab-bar button {
  flex: 1 1 0;
  padding: 0.5em 1.2em;
  border: none;
  background: #eee;
  color: #333;
  font-weight: 600;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  transition: background 0.2s;
  text-align: center;
}
.two-tab-bar button.active {
  background: #fff;
  border-bottom: 2px solid #222;
  color: #222;
}
</style>
