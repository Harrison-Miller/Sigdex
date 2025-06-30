<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Modal from './Modal.vue';
import ToggleBox from './ToggleBox.vue';
import type { Army } from '../common/ArmyData';
import type { ListUnit } from '../common/ListData';

const props = defineProps<{
  modelValue: boolean;
  unit: ListUnit;
  army: Army;
  regimentIdx: number;
  unitIdx: number | 'leader';
}>();
const emit = defineEmits(['close', 'update:modelValue', 'save']);

const armyUnit = computed(() => props.army.units.find((u) => u.name === props.unit.name));
const isReinforceable = computed(
  () => armyUnit.value?.notReinforcable !== true && armyUnit.value?.unit_size !== 1
);

const isGeneral = ref(!!props.unit.general);
const reinforced = ref(!!props.unit.reinforced);

watch(
  () => props.unit,
  (newUnit) => {
    isGeneral.value = !!newUnit.general;
    reinforced.value = !!newUnit.reinforced;
  }
);

function save() {
  // Create a copy of the current unit with updated fields
  const updatedUnit = {
    ...props.unit,
    general: isGeneral.value,
    reinforced: reinforced.value,
  };
  emit('save', {
    regimentIdx: props.regimentIdx,
    unitIdx: props.unitIdx,
    unit: updatedUnit,
  });
  emit('update:modelValue', false);
}
function close() {
  emit('close');
  emit('update:modelValue', false);
}
</script>
<template>
  <Modal :model-value="modelValue" @close="close">
    <div class="unit-settings-modal">
      <h2 class="unit-name">{{ unit.name }}</h2>
      <div v-if="unitIdx === 'leader'" class="option-row">
        <ToggleBox v-model="isGeneral">General</ToggleBox>
      </div>
      <div v-if="isReinforceable" class="option-row">
        <ToggleBox v-model="reinforced">Reinforce</ToggleBox>
      </div>
      <div class="modal-actions">
        <button class="save-btn" @click="save">Save</button>
        <button class="cancel-btn" @click="close">Cancel</button>
      </div>
    </div>
  </Modal>
</template>
<style scoped>
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
</style>
