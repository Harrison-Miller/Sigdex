<template>
	<div :class="pillClass">
		<slot></slot>
	</div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const { big } = defineProps<{
  big?: boolean;
}>();

const pillClass = computed(() => (
  big ? 'big-pill-badge' : 'small-pill-badge'
));
</script>
<style scoped>
.small-pill-badge {
	background-color: red;
	border-radius: 18px;
	padding: 4px 8px;
	font-size: 0.8em;
	display: inline-block;
}
.big-pill-badge {
	background-color: red;
	border-radius: 20px;
	padding: 6px 12px;
	font-size: 1.2em;
	display: inline-block;
}
</style>