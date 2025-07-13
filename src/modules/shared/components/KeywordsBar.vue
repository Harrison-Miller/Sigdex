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
      v-html="formatText(kw)"
    />
  </div>
</template>
<style scoped>
.keywords-bar {
  background: #fff;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: #222;
  margin-top: 0.5rem;
  display: inline-block;
  border: 1.5px solid #222;
}

.keyword {
  background: #d6d6d6;
  border-radius: 4px;
  padding: 0.1em 0.5em;
  font-weight: 500;
  margin-right: 0.3em;
  margin-bottom: 0.3em;
  white-space: nowrap;
  display: inline-block;
}
</style>
