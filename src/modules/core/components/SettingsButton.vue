<script setup lang="ts">
const props = defineProps<{ size?: number }>();
const emit = defineEmits(['click']);
const iconSize = props.size ?? 36;
</script>
<template>
  <button
    class="circle-btn"
    aria-label="Back"
    @click="emit('click')"
  >
    <font-awesome-icon
class="bg-sub text-muted"
      icon="fa-solid fa-gear"
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
