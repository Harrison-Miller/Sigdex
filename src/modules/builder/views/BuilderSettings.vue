<template>
  <CircleIconButton
    class="settings-duplicate-btn"
    icon="fa-solid fa-copy"
    :size="32"
    @click="duplicateList"
  />
  <div class="modal settings-modal">
    <h1>List Settings</h1>
    <h2>{{ listName }}</h2>
    <label class="validator-label">
      Validation
      <OptionSelect
        v-model="validator"
        :options="VALIDATOR_NAMES"
        class="validator-select"
      />
    </label>
    <label class="points-cap-label">
      Points Cap
      <CounterBox
        v-model="pointsCap"
        :min="250"
        :max="5000"
        :step="250"
        class="points-cap-counter"
      />
    </label>
    <TextInput
      v-model="newName"
      type="text"
      label="Rename List"
      placeholder="New list name"
    />
    <div
      v-if="nameError"
      class="input-error"
    >
      {{ nameError }}
    </div>
    <div
      class="modal-actions single-action"
      style="margin-top: 1.2em"
    >
      <button
        class="save-btn"
        :disabled="!isNameValid"
        @click="renameCurrentList"
      >
        Rename
      </button>
    </div>
    <div class="divider"></div>
    <button
      class="delete-btn"
      @click="deleteCurrentList"
    >
      Delete List
    </button>
  </div>
</template>
<script setup lang="ts">
import CounterBox from '../../core/components/CounterBox.vue';
import OptionSelect from '../../core/components/OptionSelect.vue';
import { ref, computed, watch } from 'vue';
import TextInput from '../../core/components/TextInput.vue';
import { deleteList, useList } from '../../shared/composables/useList';
import { useRoute, useRouter } from 'vue-router';
import { createList, getAllLists, LIST_NAME_MAX_LENGTH } from '../../../list/manage';
import { VALIDATOR_NAMES } from '../../../validation/run';
import { List } from '../../../list/models/list';
import CircleIconButton from '../../core/components/CircleIconButton.vue';


const route = useRoute();
const listId = route.params.id as string;
const list = useList(listId);
const listName = computed(() => list.value?.name || '');
const newName = ref(listName.value);

const isNameValid = computed(() => {
  const trimmed = newName.value.trim();
  return !!trimmed && trimmed.length <= LIST_NAME_MAX_LENGTH;
});

const nameError = computed(() => {
  const trimmed = newName.value.trim();
  if (!trimmed) return '';
  if (trimmed.length > LIST_NAME_MAX_LENGTH) {
    return `List name must be at most ${LIST_NAME_MAX_LENGTH} characters.`;
  }
  return '';
});

const pointsCap = ref(list.value?.pointsCap ?? 2000);
watch(pointsCap, (val) => {
  if (list.value) {
    list.value.pointsCap = val;
    list.value.modifiedAt = new Date();
  }
});
watch(list, (val) => {
  if (val) {
    pointsCap.value = val.pointsCap;
    list.value.modifiedAt = new Date();
  }
});

// Validator logic
const validator = ref(list.value?.validator ?? 'standard');
watch(validator, (val) => {
  if (list.value) {
    list.value.validator = val;
    list.value.modifiedAt = new Date();
  }
});
watch(list, (val) => {
  if (val) {
    validator.value = val.validator ?? 'standard';
    list.value.modifiedAt = new Date();
  }
});
const router = useRouter();

function deleteCurrentList() {
  deleteList(listId);
  router.push({ path: '/' });
}

function renameCurrentList() {
  if (list.value) {
    list.value.name = newName.value;
    list.value.modifiedAt = new Date();
  }
}

function duplicateList() {
  const newList = new List({...list.value });
  const nameCount = getAllLists().filter(l => l.name.startsWith(list.value.name)).length;
  newList.name = `${list.value.name} (Copy${nameCount > 0 ? ` ${nameCount}` : ''})`;
  const id = createList(newList);
  if (!id) return;
  router.back();
  router.replace({ name: 'ListBuilder', params: { id } });
}

</script>
<style scoped>
.divider {
  width: 100%;
  height: 1px;
  background: var(--border-color);
  margin: 0.5em 0;
}
.settings-duplicate-btn {
  position: absolute;
  top: 1.2em;
  right: 1.2em;
  z-index: 20;
}
.delete-btn:hover {
  filter: brightness(1.1);
}
.input-error {
  color: var(--danger);
  font-size: 0.95em;
  margin-top: 0.2em;
}
.validator-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.2em;
  font-weight: 500;
}
.points-cap-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.2em;
  font-weight: 500;
}
.points-cap-counter {
  margin-top: 0.3em;
  max-width: 10em;
  align-self: center;
}

.save-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7em 4.2em;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.save-btn:disabled {
  background: var(--bg-sub);
  color: var(--text-muted);
  cursor: not-allowed;
}
.save-btn:not(:disabled):hover {
  filter: brightness(1.1);
}
.delete-btn {
  background: var(--danger);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7em 1.2em;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.2em;
  width: 80%;
  transition: background 0.2s;
}
.delete-btn:hover {
  filter: brightness(1.1);
}
</style>
