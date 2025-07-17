<template>
  <div>
    <BackButton class="floating-back-btn" />
    <h2>Create New List</h2>
    <div class="form-content">
      <TextInput
        v-model="name"
        type="text"
        label="Name"
        placeholder="List name"
        @keyup.enter="handleCreate"
      />
      <div v-if="nameError" class="input-error">
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
      <div class="form-actions">
        <button
          class="create-btn"
          :disabled="!isNameValid"
          @click="handleCreate"
        >
          Create
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import OptionSelect from '../../core/components/OptionSelect.vue';
import TextInput from '../../core/components/TextInput.vue';
import BackButton from '../../core/components/BackButton.vue';
import { LIST_NAME_MAX_LENGTH } from '../../../list/manage';
import { useGame } from '../../shared/composables/useGame';
import { createList } from '../../../list/manage';
import { setDefaultArmyOptions } from '../../../list/models/list';

const router = useRouter();
const initialFaction = 'Cities of Sigmar';
const name = ref('');
const faction = ref(initialFaction);

const { game } = useGame();

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
  if (!game.value) return list;
  for (const key of game.value.armyList.keys()) {
    list.set(key, []);
  }
  game.value.armyList.forEach((armies, alliance) => {
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

function handleCreate() {
  if (!isNameValid.value) return;
  const army = game.value?.armies.get(faction.value);
  if (!army) {
    console.error(`Army not found: ${faction.value}`);
    return;
  }
  const list = setDefaultArmyOptions({ name: name.value.trim(), faction: faction.value }, army);
  const id = createList(list);
  router.replace({ name: 'ListBuilder', params: { id } });
}
</script>
<style scoped>
.create-list-view {
  max-width: 420px;
  margin: 2.5rem auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  padding: 2.2em 2em 1.5em 2em;
  color: #222;
  position: relative;
}
.floating-back-btn {
  position: absolute;
  top: 1.1em;
  left: 1.1em;
  z-index: 10;
}
.create-list-view h2 {
  margin: 0 0 1em 0;
  font-size: 1.5em;
  font-weight: 700;
  text-align: center;
}
.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}
.form-actions {
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
.input-error {
  color: #c00;
  font-size: 0.95em;
  margin-top: 0.2em;
}
</style>
