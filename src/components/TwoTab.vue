<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
const props = defineProps<{
  leftLabel: string;
  rightLabel: string;
  leftActive: boolean;
}>();
const emit = defineEmits(['update:leftActive']);
function select(left: boolean) {
  emit('update:leftActive', left);
}
</script>
<template>
  <div>
    <div class="two-tab-bar">
      <button :class="{ active: props.leftActive }" @click="select(true)" type="button">
        {{ props.leftLabel }}
      </button>
      <button :class="{ active: !props.leftActive }" @click="select(false)" type="button">
        {{ props.rightLabel }}
      </button>
    </div>
    <div v-if="props.leftActive">
      <slot name="left" />
    </div>
    <div v-else>
      <slot name="right" />
    </div>
  </div>
</template>
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
