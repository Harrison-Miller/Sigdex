<template>
  <div
    v-if="$props.modelValue"
    class="modal-overlay"
    @click.self="$emit('close')"
  >
    <div class="modal">
      <slot />
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ modelValue: boolean }>();
defineEmits(['close', 'update:modelValue']);
</script>
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}
.modal {
  background: #fff;
  color: #222;
  border-radius: 12px;
  padding: 2em 1.5em 1.5em 1.5em;
  min-width: 320px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}
@media (max-width: 600px) {
  .modal {
    min-width: 0;
    width: 95vw;
    padding: 1.2em 0.5em 1em 0.5em;
  }
}
</style>
