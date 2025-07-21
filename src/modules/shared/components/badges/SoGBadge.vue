<template>
	<PillBadge v-if="sog" class="sog-badge" :big="big">
		SoG
	</PillBadge>
</template>
<script setup lang="ts">
import PillBadge from '../../../core/components/PillBadge.vue';
const { big, sog } = defineProps<{
  big?: boolean;
  sog?: boolean;
}>();
</script>
<style scoped>
.sog-badge {
	background-color: var(--color-green);
	color: #fff;
}
</style>