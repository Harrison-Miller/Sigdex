<template>
	<PillBadge v-if="reinforced" class="reinforced-badge" :big="big">
		Reinforced
	</PillBadge>
</template>
<script setup lang="ts">
import PillBadge from '../../../core/components/PillBadge.vue';
const { big, reinforced } = defineProps<{
  big?: boolean;
  reinforced?: boolean;
}>();
</script>
<style scoped>
.reinforced-badge {
	background-color: var(--color-yellow);
	color: #111;
	font-weight: 800;
}
</style>