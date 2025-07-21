<template>
	<PillBadge v-if="legends" class="legends-badge" :big="big">
		Legends
	</PillBadge>
</template>
<script setup lang="ts">
import PillBadge from '../../../core/components/PillBadge.vue';
const { big, legends } = defineProps<{
  big?: boolean;
  legends?: boolean;
}>();
</script>
<style scoped>
.legends-badge {
	background-color: var(--color-purple);
	color: #fff;
}
</style>