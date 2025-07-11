<template>
  <Section :model-value="internalCollapsed" @update:modelValue="internalCollapsed = $event">
    <template #title>Auxillary Units</template>
    <div v-if="props.modelValue.length > 0">
      <div v-for="(unit, i) in props.modelValue" :key="unit?.name + i" class="aux-unit-row">
        <ListButton
          :label="unit.name"
          :points="battleProfiles.get(unit.name)?.points"
          :show-reinforced="unit.reinforced"
          :show-ellipsis="true"
          :enhancement-count="unit.getEnhancementCount()"
          @click="
            () =>
              router &&
              router.push({
                name: 'UnitDetail',
                params: { army: armyName, unit: unit.name },
              })
          "
          @ellipsis="() => goToAuxUnitSettings(i)"
        />
        <button
          class="delete-terrain-btn"
          @click="() => handleDeleteAuxUnit(i)"
          title="Delete Auxillary Unit"
        >
          <font-awesome-icon icon="trash" />
        </button>
      </div>
    </div>
    <button class="add-terrain-btn" style="margin-top: 0.7em" @click="handleAddAuxUnit">
      + Auxillary Unit
    </button>
  </Section>
</template>
<script lang="ts" setup>
import Section from '../../core/components/Section.vue';
import { ref, watch, onMounted } from 'vue';
import ListButton from '../../shared/components/ListButton.vue';
import { useRouter } from 'vue-router';
import { ListUnit } from '../../../list/models/unit';
import type { IBattleProfile } from '../../../parser/models/battleProfile';

const props = defineProps<{
  modelValue: ListUnit[];
  battleProfiles: Map<string, IBattleProfile>;
  armyName: string;
  listId: string;
}>();
const emit = defineEmits(['update:modelValue', 'update']);

const router = useRouter();

const internalCollapsed = ref(true);

onMounted(() => {
  if (props.modelValue.length > 0) {
    internalCollapsed.value = false;
  } else {
    internalCollapsed.value = true;
  }
});

watch(
  () => props.modelValue,
  (val) => {
    if (val.length > 0) {
      internalCollapsed.value = false;
    } else {
      internalCollapsed.value = true;
    }
  },
  { immediate: false }
);

function handleAddAuxUnit() {
  router.push({
    name: 'UnitPicker',
    params: { id: props.listId, regimentIdx: '0', filter: 'aux' },
  });
}

function handleDeleteAuxUnit(idx: number) {
  const newUnits = [...props.modelValue];
  newUnits.splice(idx, 1);
  emit('update:modelValue', newUnits);
}

function goToAuxUnitSettings(unitIdx: number) {
  router.push({
    name: 'BuilderUnitSettings',
    params: {
      id: props.listId,
      regimentIdx: '999',
      unitIdx: unitIdx.toString(),
    },
  });
}
</script>
<style scoped>
@import '../views/listbuilder.css';

.aux-unit-row {
  display: flex;
  align-items: stretch;
  /* margin-bottom: 0.5em; */
}

.add-terrain-btn {
  width: 100%;
  background: #f5f5f5;
  color: #1976d2;
  border: 2px dashed #1976d2;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  padding: 0.7em 1.2em;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-terrain-btn:hover {
  background: #1976d2;
  color: #fff;
}

.delete-terrain-btn {
  min-width: 44px;
  min-height: 44px;
  height: auto;
  font-size: 1.3em;
  background: #f5f5f5;
  color: #a00;
  border: 1.5px solid #a00;
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.1em;
  margin-right: 0;
  margin-top: 0;
  margin-bottom: 0;
  box-sizing: border-box;
  transition:
    background 0.18s,
    color 0.18s,
    border 0.18s;
}

.delete-terrain-btn:hover {
  background: #a00;
  color: #fff;
  border-color: #a00;
}
</style>
