<template>
  <Section
    :default-collapsed="collapsed"
    collapse-key="auxiliaryUnits"
  >
    <template #title>Auxillary Units</template>
    <div v-if="props.modelValue.length > 0">
      <div
        v-for="(unit, i) in props.modelValue"
        :key="unit?.name + i"
        class="unit-row"
      >
        <ListButton
          :label="unit.name"
          :points="battleProfiles.get(unit.name)?.points"
          :show-reinforced="unit.reinforced"
          :legends="battleProfiles.get(unit.name)?.legends"
          :enhancement-count="unit.getEnhancementCount()"
          :split-on-sub-label="true"
          @click="
            () =>
              router &&
              router.push({
                name: 'UnitDetail',
                params: { armyName: armyName, unitName: unit.name },
              })
          "
        />
        <button
          class="unit-settings-btn"
          title="Unit Settings"
          @click="() => goToAuxUnitSettings(i)"
        >
          <font-awesome-icon icon="gear" />
        </button>
      </div>
    </div>
    <button
      class="add-unit-btn"
      style="margin-top: 0.7em"
      @click="handleAddAuxUnit"
    >
      + Auxillary Unit
    </button>
  </Section>
</template>
<script lang="ts" setup>
import Section from '../../core/components/ContentSection.vue';
import { ref } from 'vue';
import ListButton from '../../shared/components/ListButton.vue';
import { useRouter } from 'vue-router';
import { ListUnit } from '../../../list/models/unit';
import type { BattleProfile } from '../../../parser/models/battleProfile';

const props = defineProps<{
  modelValue: ListUnit[];
  battleProfiles: Map<string, BattleProfile>;
  armyName: string;
  listId: string;
}>();
// const emit = defineEmits(['update:modelValue', 'update']);

const router = useRouter();

const collapsed = ref(props.modelValue.length === 0);

function handleAddAuxUnit() {
  router.push({
    name: 'UnitPicker',
    params: { id: props.listId, regimentIdx: '0', filter: 'aux' },
  });
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

.unit-row {
  display: flex;
  align-items: stretch;
  margin-bottom: 0.5em;
}

.add-unit-btn {
  width: 100%;
  background: var(--primary);
  color: #fff;
  border: 2px solid var(--border-color);
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

.add-unit-btn:hover {
  filter: brightness(1.1);
}

.unit-settings-btn {
  min-width: 67px;
  min-height: 44px;
  height: auto;
  font-size: 1.3em;
  background: var(--bg-head);
  color: var(--text-main);
  border: 1.5px solid var(--border-color);
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.25em;
  margin-right: 0;
  margin-top: 0;
  margin-bottom: 0;
  box-sizing: border-box;
  transition:
    background 0.18s,
    color 0.18s,
    border 0.18s;
}

.unit-settings-btn:hover {
  background: var(--bg-sub);
}
</style>
