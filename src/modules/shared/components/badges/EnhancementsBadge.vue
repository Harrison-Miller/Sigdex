<template>
	<PillBadge v-if="count" class="enhancements-badge" :big="big">
		<img v-for="i in count" :key="i" src="/assets/icons/sparkle.png" class="sparkle-icon" />
	</PillBadge>
</template>
<script setup lang="ts">
import PillBadge from '../../../core/components/PillBadge.vue';
const { big, count = undefined } = defineProps<{
  big?: boolean;
  count?: number;
}>();
</script>
<style scoped>
.enhancements-badge {
	background-color: var(--color-blue);
	color: #fff;
}
.sparkle-icon {
  width: 1.2em;
  height: 1.2em;
  margin: 0 2px;
  vertical-align: middle;
  filter: invert(1) brightness(2);
}
</style>