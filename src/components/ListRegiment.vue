<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { ListRegiment } from '../common/ListData';
import ListButton from './ListButton.vue';
import Section from './Section.vue';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps<{
  regiment: ListRegiment;
  title: string;
  army: any; // Army type, but allow any for now for flexibility
  armyName: string;
  settingsOpen?: boolean; // Add prop to control settings state
}>();
const emit = defineEmits(['delete', 'delete-unit']);
const router = useRouter();
const route = useRoute();

function goToAddLeader() {
  // Expect parent route to have list name and regiment index in params
  const listName = route.params.name as string;
  const regimentIdx =
    route.params.regimentIdx !== undefined
      ? route.params.regimentIdx
      : typeof props.title === 'string' && props.title.match(/\d+/)
        ? Number(props.title.match(/\d+/)?.[0]) - 1
        : undefined;
  if (listName != null && regimentIdx != null) {
    router.push({
      name: 'UnitPicker',
      params: { listName, regimentIdx },
      query: { filter: 'leader' },
    });
  }
}

function goToAddUnit() {
  const listName = route.params.name as string;
  const regimentIdx =
    route.params.regimentIdx !== undefined
      ? route.params.regimentIdx
      : typeof props.title === 'string' && props.title.match(/\d+/)
        ? Number(props.title.match(/\d+/)?.[0]) - 1
        : undefined;
  if (listName != null && regimentIdx != null) {
    router.push({
      name: 'UnitPicker',
      params: { listName, regimentIdx },
      query: { filter: 'unit' },
    });
  }
}

function getUnitByName(name: string) {
  return props.army?.units?.find((u: any) => u.name === name);
}

function goToUnitDetail(unitName: string) {
  if (!unitName) return;
  router.push({
    name: 'UnitDetail',
    params: { army: props.armyName, unit: unitName },
  });
}
</script>
<template>
  <Section>
    <template #title>
      <span>{{ props.title }}</span>
      <button class="delete-regiment-btn" @click="$emit('delete')" title="Delete Regiment">
        <font-awesome-icon icon="trash" />
      </button>
    </template>
    <div class="regiment-leader">
      <div v-if="props.regiment.leader && props.regiment.leader.name" class="regiment-unit-row">
        <ListButton
          :label="props.regiment.leader.name"
          v-if="!props.settingsOpen"
          :points="getUnitByName(props.regiment.leader.name)?.points"
          @click="() => goToUnitDetail(props.regiment.leader.name)"
        />
        <ListButton
          v-else
          :label="props.regiment.leader.name"
          @click="() => goToUnitDetail(props.regiment.leader.name)"
        />
        <button
          class="delete-unit-btn"
          @click="$emit('delete-unit', 'leader')"
          title="Remove leader"
        >
          <font-awesome-icon icon="trash" />
        </button>
      </div>
      <button v-else class="add-leader-btn" @click="goToAddLeader">+ Add Leader</button>
    </div>
    <div class="divider"></div>
    <div class="regiment-units">
      <ul>
        <li
          v-for="(unit, idx) in props.regiment.units"
          :key="unit.name + idx"
          class="regiment-unit-row"
        >
          <div class="regiment-unit-btn">
            <ListButton
              :label="unit.name"
              v-if="!props.settingsOpen"
              :points="getUnitByName(unit.name)?.points"
              @click="() => goToUnitDetail(unit.name)"
              class="regiment-unit-btn"
            />
            <ListButton
              v-else
              :label="unit.name"
              @click="() => goToUnitDetail(unit.name)"
              class="regiment-unit-btn"
            />
          </div>
          <button class="delete-unit-btn" @click="$emit('delete-unit', idx)" title="Remove unit">
            <font-awesome-icon icon="trash" />
          </button>
        </li>
      </ul>
    </div>
    <button class="add-unit-btn" @click="goToAddUnit">+ Add Unit</button>
  </Section>
</template>
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
