<template>
	<PillBadge v-if="powerLevel" class="wizard-badge" :big="big">
		<img src="/src/assets/icons/hat-wizard-solid.svg" class="wizard-icon" />
        lvl. {{ powerLevel }}
	</PillBadge>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import PillBadge from '../../../core/components/PillBadge.vue';
const { big, keywords = [] } = defineProps<{
  big?: boolean;
  keywords?: string[];
}>();

const powerLevel = computed(() => {
  if (!keywords) return 0;
  const wizardKeyword = keywords.find(k => k.toLowerCase().includes('wizard'));
  // get power level from keyword like "Wizard 3"
  if (wizardKeyword) {
    const match = wizardKeyword.match(/(\d+)/i);
    if (match) {
      return parseInt(match[0], 10);
    }
  }
  return 0;
});

</script>
<style scoped>
.wizard-badge {
	background-color: var(--color-gray);
	color: #fff;
    font-weight: 600;
}
.wizard-icon {
  width: 1.2em;
  height: 1.2em;
  vertical-align: middle;
  filter: invert(1) brightness(2);
}
</style>