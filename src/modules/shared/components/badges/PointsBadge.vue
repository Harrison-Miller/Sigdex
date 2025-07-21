<template>
	<PillBadge v-if="points" class="points-badge" :big="big">
		{{ points }} pts
	</PillBadge>
</template>
<script setup lang="ts">
import PillBadge from '../../../core/components/PillBadge.vue';
const { big, points } = defineProps<{
  big?: boolean;
  points?: number;
}>();
</script>
<style scoped>
.points-badge {
	background: var(--color-red);
	color: #fff;
}
</style>