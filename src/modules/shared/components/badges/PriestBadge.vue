<template>
	<PillBadge v-if="powerLevel" class="priest-badge" :big="big">
		<img src="/src/assets/icons/hands-praying-solid.svg" class="priest-icon" />
        lvl. {{ powerLevel }}
	</PillBadge>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import PillBadge from '../../../core/components/PillBadge.vue';
const { big, keywords } = defineProps<{
  big?: boolean;
  keywords?: string[];
}>();

const powerLevel = computed(() => {
  if (!keywords) return 0;
  const priestKeyword = keywords.find(k => k.toLowerCase().includes('priest'));
  // get power level from keyword like "Priest 3"
  if (priestKeyword) {
    const match = priestKeyword.match(/(\d+)/i);
    if (match) {
      return parseInt(match[0], 10);
    }
  }
  return 0;
});

</script>
<style scoped>
.priest-badge {
	background-color: var(--color-gray);
	color: #111;
  font-weight: 600;
}
.priest-icon {
  width: 1.2em;
  height: 1.2em;
  vertical-align: middle;
}
</style>