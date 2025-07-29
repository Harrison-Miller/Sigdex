<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  size?: number;
  icon: string;
}>();
const emit = defineEmits(['click']);
const iconSize = props.size ?? 36;
</script>
<template>
  <button
    class="circle-btn"
    aria-label="Action"
    @click="emit('click')"
  >
    <FontAwesomeIcon
class="bg-sub text-muted"
      :icon="icon"
      :style="{
        fontSize: iconSize + 'px',
        borderRadius: '50%',
        width: iconSize + 'px',
        height: iconSize + 'px',
        padding: iconSize * 0.22 + 'px',
      }"
    />
  </button>
</template>
<style scoped>
.circle-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.circle-btn:hover {
  background: var(--bg-selected);
}
</style>
