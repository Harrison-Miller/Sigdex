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
  <Section :title="props.title">
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
          :points="getUnitByName(props.regiment.leader.name)?.points"
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
      <ListButton v-else :label="'+'" class="add-btn" @click="goToAddLeader" />
    </div>
    <div class="divider"></div>
    <div class="regiment-units">
      <div
        v-for="(unit, idx) in props.regiment.units"
        :key="unit.name + idx"
        class="regiment-unit-row"
      >
        <ListButton
          :label="unit.name"
          :points="getUnitByName(unit.name)?.points"
          @click="() => goToUnitDetail(unit.name)"
        />
        <button class="delete-unit-btn" @click="$emit('delete-unit', idx)" title="Remove unit">
          <font-awesome-icon icon="trash" />
        </button>
      </div>
    </div>
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
  margin: 1em 0;
}
.regiment-units {
  display: flex;
  flex-direction: column;
  gap: 0.7em;
}
.regiment-unit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.delete-unit-btn {
  background: none;
  color: #a00;
  border: none;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.18s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  padding: 0;
  box-shadow: none;
}
.delete-unit-btn:hover {
  color: #fff;
  background: #a00;
}
</style>
