<template>
  <Section>
    <template #title>
      <span>{{ title }}</span>
      <button
        class="delete-regiment-btn"
        title="Delete Regiment"
        @click="$emit('delete')"
      >
        <font-awesome-icon icon="trash" />
      </button>
    </template>
    <div class="regiment-leader">
      <div
        v-if="leader.name"
        class="regiment-unit-row"
      >
        <ListButton
          :label="leader.name"
          :points="battleProfiles.get(leader.name)?.points"
          :show-ellipsis="true"
          :show-general="leader.general"
          :enhancement-count="leader.getEnhancementCount()"
          @click="() => goToUnitDetail(leader.name)"
          @ellipsis="() => goToUnitSettings('leader')"
        />
        <button
          class="delete-unit-btn"
          title="Remove leader"
          @click="emit('delete-unit', 'leader')"
        >
          <font-awesome-icon icon="trash" />
        </button>
      </div>
      <button
        v-else
        class="add-leader-btn"
        @click="goToAddLeader"
      >
        + Add Leader
      </button>
    </div>
    <div class="divider" />
    <div class="regiment-units">
      <ul>
        <li
          v-for="(unit, idx) in units"
          :key="unit.name"
          class="regiment-unit-row"
        >
          <div class="regiment-unit-btn">
            <ListButton
              :label="unit.name"
              :points="battleProfiles.get(unit.name)?.points"
              :show-ellipsis="true"
              :show-reinforced="unit.reinforced"
              :enhancement-count="unit.getEnhancementCount()"
              class="regiment-unit-btn"
              @click="() => goToUnitDetail(unit.name)"
              @ellipsis="() => goToUnitSettings(idx)"
            />
          </div>
          <button
            class="delete-unit-btn"
            title="Remove unit"
            @click="emit('delete-unit', idx)"
          >
            <font-awesome-icon icon="trash" />
          </button>
        </li>
      </ul>
    </div>
    <button
      class="add-unit-btn"
      @click="goToAddUnit"
    >
      + Add Unit
    </button>
  </Section>
</template>
<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import type { ListRegiment } from '../../../list/models/regiment';
import type { ListUnit } from '../../../list/models/unit';
import ListButton from '../../shared/components/ListButton.vue';
import Section from '../../core/components/ContentSection.vue';
import { useRouter } from 'vue-router';
import type { BattleProfile } from '../../../parser/models/battleProfile';

const props = defineProps<{
  regimentIdx: number;
  regiment: ListRegiment;
  listId: string;
  battleProfiles: Map<string, BattleProfile>;
  armyName: string;
}>();
const emit = defineEmits(['delete', 'delete-unit']);
const router = useRouter();

const title = computed(() => `Regiment ${props.regimentIdx + 1}`);

const leader = computed(() => props.regiment.leader as ListUnit);
const units = computed(() => props.regiment.units as ListUnit[]);

function goToAddLeader() {
  router.push({
    name: 'UnitPicker',
    params: {
      id: props.listId,
      regimentIdx: props.regimentIdx.toString(),
      filter: 'leader',
    },
  });
}

function goToAddUnit() {
  router.push({
    name: 'UnitPicker',
    params: {
      id: props.listId,
      regimentIdx: props.regimentIdx.toString(),
      filter: 'unit',
    },
  });
}

function goToUnitDetail(unitName: string) {
  if (!unitName) return;
  router.push({
    name: 'UnitDetail',
    params: { armyName: props.armyName, unitName: unitName },
  });
}

function goToUnitSettings(unitIdx: number | 'leader') {
  router.push({
    name: 'BuilderUnitSettings',
    params: {
      id: props.listId,
      regimentIdx: props.regimentIdx.toString(),
      unitIdx: unitIdx.toString(),
    },
  });
}
</script>
<style scoped>
.regiment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1em;
}
.regiment-leader {
  display: flex;
  justify-content: center;
  flex: 1;
}
.add-btn {
  font-size: 1.5em;
  background: #f5f5f5;
  color: #a00;
  border: 2px dashed #a00;
  min-width: 120px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.delete-regiment-btn {
  background: none;
  color: #a00;
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
.delete-regiment-btn:hover {
  color: #fff;
  background: #a00;
}
.divider {
  border-bottom: 1px solid #ddd;
  margin: 0.5em 0;
}
.regiment-units {
  margin: 0;
  padding: 0;
}
.regiment-units ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.regiment-units li.regiment-unit-row {
  display: flex;
  align-items: stretch;
  gap: 0;
  margin-bottom: 0.7em;
  width: 100%;
}
.regiment-unit-btn {
  flex: 1 1 0;
  display: flex;
  align-items: stretch;
}
.regiment-unit-row {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  width: 100%;
}

.delete-unit-btn {
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
  padding: 0 1em;
  box-sizing: border-box;
  transition:
    background 0.18s,
    color 0.18s,
    border 0.18s;
}

.delete-unit-btn:hover {
  background: #a00;
  color: #fff;
  border-color: #a00;
}
.add-unit-btn {
  margin-top: 0.3em;
  width: 100%;
  background: #f5f5f5;
  color: #1976d2;
  border: 2px dashed #1976d2;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  padding: 0.7em 0;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-unit-btn:hover {
  background: #1976d2;
  color: #fff;
}
.add-leader-btn {
  margin-top: 0.5em;
  width: 100%;
  background: #f5f5f5;
  color: #1976d2;
  border: 2px dashed #1976d2;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  padding: 0.7em 0;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-leader-btn:hover {
  background: #1976d2;
  color: #fff;
}
</style>
