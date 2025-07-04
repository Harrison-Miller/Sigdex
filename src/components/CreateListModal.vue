<template>
  <Modal
    :model-value="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <div class="modal-content">
      <h3>Create New List</h3>
      <label>
        Name
        <input v-model="name" type="text" placeholder="List name" />
      </label>
      <label>
        Army
        <select v-model="faction">
          <optgroup label="Order">
            <option
              v-for="army in allArmies.filter((a) => a.grandAlliance === 'Order')"
              :key="army.name"
              :value="army.name"
            >
              {{ army.name }}
            </option>
          </optgroup>
          <optgroup label="Chaos">
            <option
              v-for="army in allArmies.filter((a) => a.grandAlliance === 'Chaos')"
              :key="army.name"
              :value="army.name"
            >
              {{ army.name }}
            </option>
          </optgroup>
          <optgroup label="Death">
            <option
              v-for="army in allArmies.filter((a) => a.grandAlliance === 'Death')"
              :key="army.name"
              :value="army.name"
            >
              {{ army.name }}
            </option>
          </optgroup>
          <optgroup label="Destruction">
            <option
              v-for="army in allArmies.filter((a) => a.grandAlliance === 'Destruction')"
              :key="army.name"
              :value="army.name"
            >
              {{ army.name }}
            </option>
          </optgroup>
        </select>
      </label>
      <div class="modal-actions">
        <button @click="handleClose">Cancel</button>
        <button class="create-btn" @click="emitCreate" :disabled="!isNameValid">Create</button>
        <button class="import-btn" @click="goToImport">Import</button>
      </div>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import Modal from './Modal.vue';
import { allArmies } from '../common/ArmyData';
import { useRouter } from 'vue-router';

const props = defineProps<{
  modelValue: boolean;
  initialName?: string;
  initialFaction?: string;
}>();
const emit = defineEmits(['update:modelValue', 'create', 'close']);

const name = ref(props.initialName || '');
const faction = ref(props.initialFaction || allArmies[0]?.name || '');

const isNameValid = computed(() => !!name.value.trim());

const router = useRouter();
function emitCreate() {
  if (!isNameValid.value) return;
  emit('create', { name: name.value.trim(), faction: faction.value });
  emit('update:modelValue', false);
}
function handleClose() {
  emit('update:modelValue', false);
  emit('close');
}
function goToImport() {
  router.push({ name: 'ListImport' });
}
</script>
<style scoped>
.modal-content {
  /* Matches modal content styling from ListListComponent */
  background: none;
  color: inherit;
  border-radius: 0;
  padding: 0;
  min-width: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}
.modal-content h3 {
  margin: 0 0 0.5em 0;
  font-size: 1.3em;
}
.modal-content label {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  font-weight: 500;
}
.modal-content input,
.modal-content select {
  padding: 0.5em;
  border-radius: 6px;
  border: 1px solid #bbb;
  font-size: 1em;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
  margin-top: 0.5em;
}
.create-btn {
  background: #a00;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1.2em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.create-btn:disabled {
  background: #ccc;
  color: #888;
  cursor: not-allowed;
}
.create-btn:not(:disabled):hover {
  background: #c00;
}

.import-btn {
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1.2em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.import-btn:hover {
  background: #388e3c;
}
</style>
