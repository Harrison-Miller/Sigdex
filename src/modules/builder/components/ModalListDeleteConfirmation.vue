<template>
  <ModalBox :model-value="modelValue" @close="$emit('close')">
    <div class="delete-confirm-content">
      <div class="delete-confirm-text">
        Are you sure you want to delete '{{ listName }}'?  
      </div>
      <CheckBox v-model="dontShowAgain" label="Don't show again" />
      <div class="delete-confirm-actions">
        <button class="btn-no" @click="$emit('close')">No</button>
        <button class="btn-yes" @click="confirmDelete">Yes</button>
      </div>
    </div>
  </ModalBox>
</template>
<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import ModalBox from '../../core/components/ModalBox.vue';
import CheckBox from '../../core/components/CheckBox.vue';
const { modelValue, listName } = defineProps<{
  modelValue: boolean;
  listName: string;
}>();
const emits = defineEmits(['close', 'confirm']);
const dontShowAgain = useStorage('listDeleteDontShowAgain', false);

function confirmDelete() {
  emits('confirm');
  emits('close');
}
</script>
<style scoped>
.delete-confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2em;
}
.delete-confirm-text {
  font-size: 1.15em;
  font-weight: 500;
  text-align: center;
  margin-bottom: 0.5em;
}
.delete-confirm-actions {
  display: flex;
  gap: 1.5em;
  justify-content: center;
  margin-top: 0.5em;
}
.btn-no, .btn-yes {
  min-width: 90px;
  padding: 0.6em 1.2em;
  border-radius: 6px;
  font-size: 1em;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-no {
  background: var(--bg-head, #eee);
  color: var(--text-main, #222);
}
.btn-yes {
  background: var(--danger, #e53e3e);
  color: #fff;
}
.btn-no:hover {
  filter: brightness(1.1);
}
.btn-yes:hover {
  filter: brightness(1.1);
}
</style>
