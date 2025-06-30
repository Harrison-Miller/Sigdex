<template>
  <Modal
    :model-value="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <div class="modal settings-modal">
      <h3>List Settings</h3>
      <label>
        Rename List
        <input v-model="renameValue" type="text" placeholder="New list name" />
      </label>
      <div v-if="renameValue && !isRenameUnique" class="error-message">
        A list with this name already exists.
      </div>
      <div class="modal-actions single-action">
        <button class="save-btn" @click="emitRename" :disabled="!renameValue || !isRenameUnique">
          Rename
        </button>
      </div>
      <hr />
      <button class="delete-btn" @click="emitDelete">Delete List</button>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import Modal from './Modal.vue';

const props = defineProps<{
  modelValue: boolean;
  initialName: string;
  existingNames: string[];
}>();
const emit = defineEmits(['update:modelValue', 'rename', 'delete', 'close']);

const renameValue = ref(props.initialName);

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      renameValue.value = props.initialName;
    }
  }
);

const isRenameUnique = computed(() => {
  const trimmed = renameValue.value.trim();
  if (!trimmed) return false;
  return !props.existingNames.includes(trimmed) || trimmed === props.initialName;
});

function emitRename() {
  if (!renameValue.value.trim() || !isRenameUnique.value) return;
  emit('rename', renameValue.value.trim());
  emit('update:modelValue', false);
}
function emitDelete() {
  emit('delete');
  emit('update:modelValue', false);
}
function handleClose() {
  emit('update:modelValue', false);
  emit('close');
}
</script>
<style scoped>
.settings-modal {
  min-width: 320px;
  max-width: 95vw;
}
.settings-modal label {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  font-weight: 500;
  margin-bottom: 1em;
}
.settings-modal input[type='text'] {
  width: 100%;
  font-size: 1.1em;
  padding: 0.7em 0.9em;
  border-radius: 6px;
  border: 1px solid #bbb;
  margin-top: 0.3em;
  box-sizing: border-box;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
  margin-top: 0.5em;
}
.modal-actions.single-action {
  justify-content: center;
  gap: 0;
}
.save-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1.2em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.save-btn:disabled {
  background: #ccc;
  color: #888;
  cursor: not-allowed;
}
.save-btn:not(:disabled):hover {
  background: #1565c0;
}
.delete-btn {
  background: #a00;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1.2em;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.2em;
  width: 100%;
  transition: background 0.2s;
}
.delete-btn:hover {
  background: #c00;
}
.error-message {
  color: #d00;
  font-size: 0.9em;
  margin-top: 0.5em;
}
</style>
