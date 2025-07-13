<template>
  <BackButton class="settings-back-btn" />
  <div class="modal settings-modal">
    <h1>List Settings</h1>
    <h2>{{ listName }}</h2>
    <label class="validator-label">
      Validation
      <OptionSelect
        v-model="validator"
        :options="validatorOptions"
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
    <hr>
    <button
      class="delete-btn"
      @click="deleteCurrentList"
    >
      Delete List
    </button>
  </div>
</template>
<script setup lang="ts">

import BackButton from '../../core/components/BackButton.vue';
import CounterBox from '../../core/components/CounterBox.vue';
import OptionSelect from '../../core/components/OptionSelect.vue';
import { ref, computed, watch } from 'vue';
import TextInput from '../../core/components/TextInput.vue';
import { useList } from '../../shared/composables/useList';
import { useRoute, useRouter } from 'vue-router';
import { LIST_NAME_MAX_LENGTH } from '../../../list/manage';


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
  if (list.value) list.value.pointsCap = val;
});
watch(list, (val) => {
  if (val) pointsCap.value = val.pointsCap;
});

// Validator logic
const validatorOptions = ['standard', 'highlander', 'disabled'];
const validator = ref(list.value?.validator ?? 'standard');
watch(validator, (val) => {
  if (list.value) list.value.validator = val;
});
watch(list, (val) => {
  if (val) validator.value = val.validator ?? 'standard';
});
const router = useRouter();

function deleteCurrentList() {
  list.value = null;
  router.push({ path: '/' });
}

function renameCurrentList() {
  if (list.value) {
    list.value.name = newName.value;
  }
}
</script>
<style scoped>
.delete-btn:hover {
  background: #c00;
}
.input-error {
  color: #c00;
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
</style>
