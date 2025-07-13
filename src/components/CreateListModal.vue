
<script setup lang="ts">
import { ref, computed } from 'vue';
import Modal from './ModalBox.vue';
import { useRouter } from 'vue-router';
import type { GrandAlliance } from '../parser/models/army';
import OptionSelect from '../modules/core/components/OptionSelect.vue';
import TextInput from '../modules/core/components/TextInput.vue';
import type { IArmyListItem } from '../parser/models/game';

const props = defineProps<{
  modelValue: boolean;
  initialFaction: string;
  armyList: Map<GrandAlliance, IArmyListItem[]>;
}>();
const emit = defineEmits(['update:modelValue', 'create', 'close']);

const name = ref('');
const faction = ref(props.initialFaction);

import { LIST_NAME_MAX_LENGTH } from '../list/manage';

const isNameValid = computed(() => {
  const trimmed = name.value.trim();
  return !!trimmed && trimmed.length <= LIST_NAME_MAX_LENGTH;
});

const nameError = computed(() => {
  const trimmed = name.value.trim();
  if (!trimmed) return '';
  if (trimmed.length > LIST_NAME_MAX_LENGTH) {
    return `List name must be at most ${LIST_NAME_MAX_LENGTH} characters.`;
  }
  return '';
});

const flattenedArmyList = computed(() => {
  const list: Map<string, string[]> = new Map();
  for (const key of props.armyList.keys()) {
    list.set(key, []);
  }

  props.armyList.forEach((armies, alliance) => {
    armies.forEach((army) => {
      list.get(alliance)?.push(army.name);
      if (army.armiesOfRenown) {
        army.armiesOfRenown.forEach((aor) => {
          list.get(alliance)?.push(`${army.name} - ${aor}`);
        });
      }
    });
  });
  return list;
});

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
<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <div class="modal-content">
      <h3>Create New List</h3>
      <TextInput
        v-model="name"
        type="text"
        label="Name"
        placeholder="List name"
        @keyup.enter="emitCreate"
      />
      <div
        v-if="nameError"
        class="input-error"
      >
        {{ nameError }}
      </div>
      <label>
        Army
        <OptionSelect
          v-model="faction"
          :options="flattenedArmyList"
          placeholder="Select an army"
        />
      </label>
      <div class="modal-actions">
        <button @click="handleClose">Cancel</button>
        <button
          class="create-btn"
          :disabled="!isNameValid"
          @click="emitCreate"
        >
          Create
        </button>
        <button
          class="import-btn"
          @click="goToImport"
        >
          Import
        </button>
      </div>
    </div>
  </Modal>
</template>
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
<style scoped>
.input-error {
  color: #c00;
  font-size: 0.95em;
  margin-top: 0.2em;
}
</style>
