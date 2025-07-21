<template>
	<PillBadge v-if="general" class="general-badge" :big="big">
		General
	</PillBadge>
</template>
<script setup lang="ts">
import PillBadge from '../../../core/components/PillBadge.vue';
const { big, general } = defineProps<{
  big?: boolean;
  general?: boolean;
}>();
</script>
<style scoped>
.general-badge {
	background-color: var(--color-yellow);
	color: #111;
	font-weight: 800;
}
</style>