<template>
  <BackButton class="unit-settings-back-btn" />
  <div v-if="list && army && unit && unitData">
    <h2 class="unit-name">{{ unit.name }}</h2>
    <div v-if="unitIdx === 'leader'" class="option-row">
      <ToggleBox v-model="general">General</ToggleBox>
    </div>
    <div v-if="isReinforceable" class="option-row">
      <ToggleBox v-model="reinforced">Reinforce</ToggleBox>
    </div>
    <WeaponOptionsSelection v-model="unit" :unit-data="unitData" />
    <EnhancementsSelection v-model="unit" :unit-data="unitData" :army="army" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { getList, saveList } from '../../../utils/list-manager';
import { loadArmy } from '../../../army';
import { computedAsync } from '@vueuse/core';
import { useRoute } from 'vue-router';
import ToggleBox from '../../../components/ToggleBox.vue';
import WeaponOptionsSelection from '../components/WeaponOptionsSelection.vue';
import EnhancementsSelection from '../components/EnhancementsSelection.vue';
import BackButton from '../../../components/BackButton.vue';

const route = useRoute();
const listId = route.params.id as string;
const regimentIdx = Number(route.params.regimentIdx);
const unitIdx = route.params.unitIdx as number | 'leader';

const list = ref(getList(listId));

watch(
  list,
  () => {
    if (!list.value) return;
    saveList(list.value);
  },
  { deep: true }
);

// getter and setter for the unit
const unit = computed({
  get: () => {
    if (unitIdx === 'leader') {
      return list.value?.regiments[regimentIdx]?.leader;
    }

    return list.value?.regiments[regimentIdx]?.units[unitIdx];
  },
  set: (value) => {
    if (!list.value || !value) return;
    if (unitIdx === 'leader') {
      list.value.regiments[regimentIdx].leader = value;
    } else {
      list.value.regiments[regimentIdx].units[unitIdx] = value;
    }
  },
});

watch(
  unit,
  (newVal) => {
    unit.value = newVal;
  },
  { deep: true }
);

// Ensure general and reinforced are always booleans
const general = computed({
  get: () => Boolean(unit.value?.general),
  set: (val: boolean) => {
    if (unit.value) unit.value.general = val;
  },
});

const reinforced = computed({
  get: () => Boolean(unit.value?.reinforced),
  set: (val: boolean) => {
    if (unit.value) unit.value.reinforced = val;
  },
});

const army = computedAsync(async () => {
  if (!list.value?.faction) return undefined;
  return await loadArmy(list.value.faction);
});

const unitData = computed(() => army.value?.units.find((u) => u.name === unit.value?.name));

// TODO: pull this out
const isReinforceable = computed(
  () => unitData.value?.notReinforcable !== true && unitData.value?.unit_size !== 1
);
</script>
<style scoped>
.unit-settings-back-btn {
  position: absolute;
  left: 1.2em;
  top: 1.2em;
  z-index: 2;
}
.unit-settings-modal {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.unit-name {
  font-size: 1.3em;
  font-weight: 600;
  margin-bottom: 0.5em;
}
.option-row {
  margin-bottom: 0.7em;
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  align-items: center;
}
.scrollable-options {
  max-height: 320px;
  overflow-y: auto;
  width: 100%;
  margin-bottom: 1em;
}
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1em;
  margin-top: 1.2em;
}
.save-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.6em 1.3em;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.save-btn:hover {
  background: #1251a2;
}
.cancel-btn {
  background: #f5f5f5;
  color: #a00;
  border: 1.5px solid #a00;
  border-radius: 6px;
  padding: 0.6em 1.3em;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s,
    border 0.18s;
}
.cancel-btn:hover {
  background: #a00;
  color: #fff;
  border-color: #a00;
}
.enhancement-count {
  font-weight: 500;
  font-size: 0.9em;
  color: #666;
  margin-left: 0.3em;
}
</style>
