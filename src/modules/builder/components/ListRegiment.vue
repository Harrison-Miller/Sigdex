<template>
  <Section>
    <template #title>
      <span>{{ title }}</span>
      <button
        class="delete-regiment-btn"
        title="Delete Regiment"
        @click.stop="() => emit('delete')"
      >
        <FontAwesomeIcon icon="trash" />
      </button>
    </template>
    <div>
      <div
        v-if="leader.name"
        class="unit-row"
      >
        <ListButton
          :label="leader.name"
          :points="battleProfiles.get(leader.name)?.points"
          :show-general="leader.general"
          :enhancement-count="leader.getEnhancementCount()"
          :legends="battleProfiles.get(leader.name)?.legends"
          :split-on-sub-label="true"
          :keywords="battleProfiles.get(leader.name)?.keywords"
          @click="() => goToUnitDetail(leader.name)"
        />
        <button
          class="unit-settings-btn"
          title="Leader Settings"
          @click="goToUnitSettings('leader')"
        >
          <FontAwesomeIcon icon="gear" />
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
    <div v-if="units.length > 0">
        <div
          v-for="(unit, idx) in units"
          :key="unit.name"
          class="unit-row"
        >
            <ListButton
              :label="unit.name"
              :points="battleProfiles.get(unit.name)?.points"
              :show-reinforced="unit.reinforced"
              :enhancement-count="unit.getEnhancementCount()"
              :legends="battleProfiles.get(unit.name)?.legends"
              :split-on-sub-label="true"
              :keywords="battleProfiles.get(unit.name)?.keywords"
              @click="() => goToUnitDetail(unit.name)"
            />
          <button
            class="unit-settings-btn"
            title="Unit Settings"
            @click="goToUnitSettings(idx)"
          >
            <FontAwesomeIcon icon="gear" />
          </button>
        </div>
    </div>
    <button
      class="add-unit-btn"
      @click.stop="goToAddUnit"
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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

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
.delete-regiment-btn {
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
.delete-regiment-btn:hover {
  filter: brightness(1.1);
}
.divider {
  border-bottom: 1px solid var(--border-color);
  margin: 0.5em 0;
}
.unit-row {
  display: flex;
  align-items: stretch;
  margin-bottom: 0.5em;
}

.unit-settings-btn {
  width: 67px;
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
  padding: 0 1em;
  box-sizing: border-box;
  transition:
    background 0.18s,
    color 0.18s,
    border 0.18s;
}

.unit-settings-btn:hover {
  background: var(--bg-sub);
}
.add-unit-btn {
  margin-top: 0.3em;
  width: 100%;
  background: var(--primary);
  color: #fff;
  border: 2px solid var(--border-color);
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
  background: var(--primary);
  color: #fff;
  border: 2px solid var(--border-color);
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
  filter: brightness(1.1);
}
</style>
