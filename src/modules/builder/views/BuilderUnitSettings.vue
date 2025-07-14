<template>
  <BackButton class="unit-settings-back-btn" />
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
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ToggleBox from '../../core/components/ToggleBox.vue';
import WeaponOptionsSelection from '../components/WeaponOptionsSelection.vue';
import EnhancementsSelection from '../components/EnhancementsSelection.vue';
import BackButton from '../../core/components/BackButton.vue';
import { useGame } from '../../shared/composables/useGame';
import { useList } from '../../shared/composables/useList';
import { Army } from '../../../parser/models/army';
import { Unit } from '../../../parser/models/unit';
import { BattleProfile } from '../../../parser/models/battleProfile';

const route = useRoute();
const listId = route.params.id as string;
const regimentIdx = Number(route.params.regimentIdx);
const unitIdx = route.params.unitIdx as number | 'leader';

const list = useList(listId);

const { game, loading } = useGame();

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
  },
});

const unitData = computed(
  () => (game.value?.units.get(unit.value?.name || '') as Unit) || new Unit()
);
const bp = computed(
  () =>
    (army.value?.battleProfiles.get(unit.value?.name || '') as BattleProfile) || new BattleProfile()
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
