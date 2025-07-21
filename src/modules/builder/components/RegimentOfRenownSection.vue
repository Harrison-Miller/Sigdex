<template>
  <Section
    :default-collapsed="collapsed"
    collapse-key="regimentOfRenown"
  >
    <template #title>
      <span>{{ props.modelValueName || 'Regiment Of Renown' }}</span>
      <PointsBadge :points="rorPoints" style="margin-left: 0.4em;"/>
      <button
        v-if="props.modelValueName"
        class="eye-btn"
        title="View Regiment Of Renown"
        @click.stop="goToRegimentOfRenown"
      >
        <font-awesome-icon icon="eye" />
      </button>
      <button
        class="delete-ror-btn"
        title="Delete Regiment Of Renown"
        @click.stop="handleDeleteRor"
      >
        <font-awesome-icon icon="trash" />
      </button>
    </template>
    <div v-if="modelValueUnits && modelValueUnits.length > 0">
      <div
        v-for="(unit, i) in modelValueUnits"
        :key="unit?.name + i"
        class="ror-unit-row"
      >
        <ListButton
          :label="unit.name"
          :show-reinforced="unit.reinforced"
          :show-ellipsis="true"
          :enhancement-count="unit.getEnhancementCount()"
          @click="() => goToUnitDetail(unit.name)"
          @ellipsis="() => goToRorUnitSettings(i)"
        />
      </div>
    </div>
    <button
      v-if="!props.modelValueName"
      class="add-ror-btn"
      @click="handleAddRorUnit"
    >
      + Regiment Of Renown
    </button>
  </Section>
</template>
<script lang="ts" setup>
import Section from '../../core/components/ContentSection.vue';
import { ref, computed } from 'vue';
import ListButton from '../../shared/components/ListButton.vue';
import { useRouter } from 'vue-router';
import { ListUnit } from '../../../list/models/unit';
import type { Game } from '../../../parser/models/game';
import PointsBadge from '../../shared/components/badges/PointsBadge.vue';

const props = defineProps<{
  modelValueName: string;
  modelValueUnits: ListUnit[];
  game: Game;
  listId: string;
}>();
const rorPoints = computed(() => {
  if (!props.modelValueName || !props.game) return 0;
  const ror = props.game.regimentsOfRenown?.get(props.modelValueName);
  return ror?.points ?? 0;
});
const emit = defineEmits(['update:modelValueName', 'update:modelValueUnits']);

const router = useRouter();
const collapsed = ref(!props.modelValueUnits || props.modelValueUnits.length === 0);

function handleAddRorUnit() {
  router.push({
    name: 'UnitPicker',
    params: { id: props.listId, regimentIdx: '0', filter: 'ror' },
  });
}

function handleDeleteRor() {
  emit('update:modelValueName', '');
  emit('update:modelValueUnits', []);
}

function goToRorUnitSettings(unitIdx: number) {
  router.push({
    name: 'BuilderUnitSettings',
    params: {
      id: props.listId,
      regimentIdx: '500',
      unitIdx: unitIdx.toString(),
    },
  });
}

function goToUnitDetail(unitName: string) {
  if (!unitName) return;
  router.push({
    name: 'UnitDetail',
    params: { armyName: 'UniversalUnits', unitName: unitName },
  });
}

function goToRegimentOfRenown() {
  if (!props.modelValueName) return;
  router.push({
    name: 'RegimentOfRenown',
    params: { regimentName: props.modelValueName },
  });
}
</script>
<style scoped>
.ror-unit-row {
  display: flex;
  align-items: stretch;
  margin-bottom: 0.7em;
}
.add-ror-btn {
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
.add-ror-btn:hover {
  filter: brightness(1.1);
}
.delete-ror-btn {
  background: none;
  color: var(--danger);
  border: none;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  margin-left: 0.7em;
  transition: color 0.18s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  padding: 0;
  box-shadow: none;
}
.delete-ror-btn:hover {
  filter: brightness(1.1);
}
.eye-btn {
  background: none;
  color: var(--primary);
  border: none;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  margin-left: 0.7em;
  transition: color 0.18s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  padding: 0;
  box-shadow: none;
}
.eye-btn:hover {
  filter: brightness(1.1);
}
</style>
