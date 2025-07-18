<template>
  <div class="unit-settings-header-bar">
    <BackButton class="unit-settings-back-btn" />
    <CircleIconButton
v-if="!isRoRUnit && !isLeader"
      class="duplicate-btn"
      :size="36"
      icon="fa-clone"
      @click="duplicateUnit"
    />
  </div>
  <div v-if="!loading && list && unit">
    <h2 class="unit-name">{{ unit.name }}</h2>
    <div
      v-if="unitIdx === 'leader'"
      class="option-row"
    >
      <ToggleBox v-model="unit.general">General</ToggleBox>
    </div>
    <div
      v-if="!isRoRUnit && bp.reinforceable"
      class="option-row"
    >
      <ToggleBox v-model="unit.reinforced">Reinforce</ToggleBox>
    </div>
    <WeaponOptionsSelection
      v-model="unit"
      :unit-data="unitData"
    />
    <EnhancementsSelection
      v-if="!isRoRUnit && !unitData.hasKeyword('unique')"
      v-model="unit"
      :unit-data="unitData"
      :army="army"
    />
    <div v-if="!isRoRUnit" class="delete-row">
      <button class="delete-btn" @click="onDeleteUnit">Delete</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import CircleIconButton from '../../core/components/CircleIconButton.vue';
import { useRoute, useRouter } from 'vue-router';
import ToggleBox from '../../core/components/ToggleBox.vue';
import WeaponOptionsSelection from '../components/WeaponOptionsSelection.vue';
import EnhancementsSelection from '../components/EnhancementsSelection.vue';
import BackButton from '../../core/components/BackButton.vue';
import { useGame } from '../../shared/composables/useGame';
import { useList } from '../../shared/composables/useList';
import { Army } from '../../../parser/models/army';
import { Unit } from '../../../parser/models/unit';
import { BattleProfile } from '../../../parser/models/battleProfile';
import { ListUnit } from '../../../list/models/unit';

const route = useRoute();
const router = useRouter();
const listId = route.params.id as string;
const regimentIdx = Number(route.params.regimentIdx);
const unitIdx = route.params.unitIdx as number | 'leader';

const list = useList(listId);

const { game, loading } = useGame();

const isLeader = unitIdx === 'leader';
const isRoRUnit = regimentIdx === 500;
const isAuxiliaryUnit = regimentIdx === 999;

const army = computed(() => game.value?.armies.get(list.value?.faction || '') || new Army());

// getter and setter for the unit
const unit = computed({
  get: () => {
    if (isRoRUnit) {
      return list.value.regimentOfRenownUnits[unitIdx as number];
    }
    if (isAuxiliaryUnit) {
      return list.value.auxiliaryUnits[unitIdx as number];
    }
    if (unitIdx === 'leader') {
      return list.value.regiments[regimentIdx].leader;
    }
    return list.value.regiments[regimentIdx].units[unitIdx];
  },
  set: (value) => {
    if (isRoRUnit) {
      list.value.regimentOfRenownUnits[unitIdx as number] = value;
    } else if (isAuxiliaryUnit) {
      list.value.auxiliaryUnits[unitIdx as number] = value;
    } else if (unitIdx === 'leader') {
      list.value.regiments[regimentIdx].leader = value;
    } else {
      list.value.regiments[regimentIdx].units[unitIdx] = value;
    }
    list.value.modifiedAt = new Date();
  },
});

const unitData = computed(
  () => (game.value?.units.get(unit.value?.name || '') as Unit) || new Unit()
);
const bp = computed(
  () =>
    (army.value?.battleProfiles.get(unit.value?.name || '') as BattleProfile) || new BattleProfile()
);

function duplicateUnit() {
  list.value.modifiedAt = new Date();
  if (isAuxiliaryUnit) {
    list.value.auxiliaryUnits.push(new ListUnit({ ...unit.value }));
    router.back();
  } else {
    list.value.regiments[regimentIdx].units.push(new ListUnit({ ...unit.value }));
    router.back();
  }
}

function handleDeleteUnit(regimentIdx: number, unitIdx: number | string) {
  if (!isAuxiliaryUnit && !list.value.regiments[regimentIdx]) return;
  if (unitIdx === 'leader') {
    list.value.regiments[regimentIdx].leader = new ListUnit();
  } else if (isAuxiliaryUnit) {
    list.value.auxiliaryUnits.splice(Number(unitIdx), 1);
  } else {
    list.value.regiments[regimentIdx].units.splice(Number(unitIdx), 1);
  }
  list.value.modifiedAt = new Date();
}

function onDeleteUnit() {
  handleDeleteUnit(regimentIdx, unitIdx);
  router.back();
}
</script>
<style scoped>
.unit-settings-header-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1em;
}
.duplicate-btn {
  margin-left: auto;
}
.delete-row {
  display: flex;
  justify-content: center;
  margin-top: 2em;
}
.delete-btn {
  min-width: 240px;
  min-height: 38px;
  height: auto;
  font-size: 1.08em;
  background: var(--danger);
  color: #fff;
  border: 1.5px solid var(--danger);
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.1em;
  margin-right: 0;
  margin-top: 0;
  margin-bottom: 0;
  padding: 0 1em;
  box-sizing: border-box;
  transition:
    background 0.18s,
    color 0.18s,
    border 0.18s;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.delete-btn:hover {
  filter: brightness(1.1);
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
.enhancement-count {
  font-weight: 500;
  font-size: 0.9em;
  color: #666;
  margin-left: 0.3em;
}
</style>
