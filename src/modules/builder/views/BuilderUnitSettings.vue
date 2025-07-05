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
    <EnhancementsSelection v-if="!isUnique" v-model="unit" :unit-data="unitData" :army="army" />
  </div>
</template>
<script setup lang="ts">
// Unique check: unit is unique if it has the 'unique' keyword
const isUnique = computed(() => {
  if (!unitData.value) return false;
  return (unitData.value.keywords || []).some((k: string) => k.toLowerCase() === 'unique');
});
import { ref, computed, watch } from 'vue';
import { getList, saveList } from '../../../utils/list-manager';
import { loadArmy } from '../../../army';
import { computedAsync } from '@vueuse/core';
import { useRoute } from 'vue-router';
import ToggleBox from '../../core/components/ToggleBox.vue';
import WeaponOptionsSelection from '../components/WeaponOptionsSelection.vue';
import EnhancementsSelection from '../components/EnhancementsSelection.vue';
import BackButton from '../../core/components/BackButton.vue';

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
    if (regimentIdx === 999) {
      return list.value?.auxiliary_units?.[unitIdx as number];
    }
    if (unitIdx === 'leader') {
      return list.value?.regiments[regimentIdx]?.leader;
    }
    return list.value?.regiments[regimentIdx]?.units[unitIdx];
  },
  set: (value) => {
    if (!list.value || !value) return;
    if (regimentIdx === 999) {
      if (list.value.auxiliary_units) {
        list.value.auxiliary_units[unitIdx as number] = value;
      }
    } else if (unitIdx === 'leader') {
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
.enhancement-count {
  font-weight: 500;
  font-size: 0.9em;
  color: #666;
  margin-left: 0.3em;
}
</style>
