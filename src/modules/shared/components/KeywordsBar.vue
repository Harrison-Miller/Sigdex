<script setup lang="ts">
import { formatText } from '../../../utils/formatter';
const props = defineProps<{ keywords?: string[] | null }>();
</script>
<template>
  <div
    v-if="props.keywords && props.keywords.length"
    class="keywords-bar"
  >
    <span
      v-for="kw in props.keywords"
      :key="kw"
      class="keyword"
    >
    {{ formatText(kw) }}
    <img v-if="kw.toLowerCase().includes('champion')" src="/assets/icons/wreath-laurel-solid.svg" alt="Champion" class="champion-icon" />
  </span>
  </div>
</template>
<style scoped>
.keywords-bar {
  background: var(--bg-head);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  /* color: var(--color-white); */
  margin-top: 0.5rem;
  display: inline-block;
  border: 1.5px solid var(--border-color);
}

.keyword {
  background: var(--bg-selected);
  border-radius: 4px;
  padding: 0.1em 0.5em;
  font-weight: 500;
  margin-right: 0.3em;
  margin-bottom: 0.3em;
  white-space: nowrap;
  display: inline-block;
}

.champion-icon {
  height: 1.2em;
  margin-left: 0.4em;
  vertical-align: middle;
  /* default: no filter */
}
.dark .champion-icon {
  filter: invert(1) brightness(1.6);
}
</style>
