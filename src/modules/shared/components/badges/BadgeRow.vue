<template>
  <div class="badges-row" :class="{ 'badges-row-inline': inline }">
    <slot />
  </div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue';
const { inline } = defineProps<{
  inline?: boolean;
}>();
</script>
<style scoped>
.badges-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5em;
  margin-top: 0.25em;
}
.badges-row-inline {
  display: inline-flex;
  margin-left: 0.5em;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-top: 0;
}
</style>