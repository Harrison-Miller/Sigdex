<template>
  <div>
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
      <label class="select-label">
        Army
        <OptionSelect
          v-model="selectedArmy"
          style="width: 100%; max-width: 100%;"
          :options="armyOptions"
          placeholder="Select an army"
        />
      </label>
      <label class="select-label">
        Variant
        <OptionSelect
          v-model="faction"
          style="width: 100%; max-width: 100%;"
          :options="aorOptions"
          placeholder="Select variant (optional)"
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
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import OptionSelect from '../../core/components/OptionSelect.vue';
import TextInput from '../../core/components/TextInput.vue';
import { LIST_NAME_MAX_LENGTH } from '../../../list/manage';
import { useGame } from '../../shared/composables/useGame';
import { createList } from '../../../list/manage';
import { setDefaultArmyOptions } from '../../../list/models/list';
import { SHOW_LEGENDS_KEY } from '../../../favorites';
import { useStorage } from '@vueuse/core';

const router = useRouter();
const initialArmy = 'Cities of Sigmar';
const name = ref(`New List ${new Date().toLocaleDateString('en-US')}`);
const selectedArmy = ref(initialArmy);
const faction = ref(initialArmy);

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

const showLegends = useStorage(SHOW_LEGENDS_KEY, false);

// Only armies (no AoRs) for the first dropdown
const armyOptions = computed(() => {
  const list: Map<string, string[]> = new Map();
  if (!game.value) return list;
  for (const key of game.value.armyList.keys()) {
    list.set(key, []);
  }
  game.value.armyList.forEach((armies, alliance) => {
    armies.forEach((army) => {
      if (!showLegends.value && army.legends) return;
      list.get(alliance)?.push(army.name);
    });
  });
  return list;
});

// AoRs for the selected army, always include the army name as first option
const aorOptions = computed(() => {
  if (!game.value) return [selectedArmy.value];
  const army = game.value.armies.get(selectedArmy.value);
  if (!army) return [selectedArmy.value];
  const options = [army.name];
  if (army.armiesOfRenown && army.armiesOfRenown.length > 0) {
    army.armiesOfRenown.forEach((aor) => {
      const aorData = game.value?.armies.get(`${army.name} - ${aor}`);
      if (!aorData) return;
      if (!showLegends.value && aorData.legends) return;
      options.push(`${army.name} - ${aor}`);
    });
  }
  return options;
});

// Reset the AoR dropdown to the army name when the army changes
watch(selectedArmy, (newArmy) => {
faction.value = newArmy as string;
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
.form-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1.2em;
}
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.2em;
}
.select-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 0.5em;
  font-weight: 600;
}
.create-btn {
  flex: 1 1 0;
  min-width: 220px;
  background: var(--success);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7em 1.6em;
  font-size: 1.15em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin: 0 auto;
  display: block;
}
.create-btn:disabled {
  background: var(--bg-head);
  color: var(--text-muted);
  cursor: not-allowed;
}
.create-btn:not(:disabled):hover {
  background: var(--success);
  filter: brightness(1.1);
}
.input-error {
  color: var(--danger);
  font-size: 0.95em;
  margin-top: 0.2em;
}
</style>
