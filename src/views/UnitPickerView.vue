<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAllLists, saveList } from '../utils/list-manager';
import { loadArmy } from '../army';
import type { List } from '../common/ListData';
import type { Army } from '../common/ArmyData';
import type { Unit } from '../common/UnitData';
import ListButton from '../components/ListButton.vue';
import BackButton from '../components/BackButton.vue';

const route = useRoute();
const router = useRouter();
const listName = route.params.listName as string;
const regimentIdx = Number(route.params.regimentIdx);
const filter = (route.query.filter as string) || '';

const list = ref<List | undefined>();
const army = ref<Army | null>(null);
const loading = ref(true);
const search = ref('');

onMounted(async () => {
  const found = getAllLists().find((l) => l.name === listName);
  list.value = found;
  if (found) {
    army.value = await loadArmy(found.faction);
  }
  loading.value = false;
});

const units = computed(() => (army.value ? army.value.units : []));

const filteredUnits = computed(() => {
  let us = units.value;
  if (filter) {
    const actualFilter = filter.toLowerCase() == 'leader' ? 'Hero' : filter;
    us = us.filter((u) => u.category?.toLowerCase() === actualFilter.toLowerCase());
  }
  if (search.value) {
    us = us.filter((u) => u.name.toLowerCase().includes(search.value.toLowerCase()));
  }
  return us;
});

function goToDetail(unit: Unit) {
  router.push({
    name: 'UnitDetail',
    params: { army: list.value?.faction || '', unit: unit.name },
  });
}

function addUnitToRegiment(unit: Unit) {
  if (!list.value || isNaN(regimentIdx) || !list.value.regiments[regimentIdx]) return;
  if (filter.toLowerCase() === 'leader') {
    // Set as leader
    list.value.regiments[regimentIdx].leader = { name: unit.name };
  } else {
    // Add to regiment.units
    list.value.regiments[regimentIdx].units.push({ name: unit.name });
  }
  saveList(list.value);
  router.back();
}
</script>
<template>
  <BackButton />
  <h2>Select a Unit</h2>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <div class="filters-bar">
      <input v-model="search" placeholder="Search units..." class="search-bar" />
    </div>
    <ul class="unit-list">
      <li v-for="unit in filteredUnits" :key="unit.name" class="unit-row">
        <ListButton
          :label="unit.name"
          :points="unit.points"
          @click="() => goToDetail(unit)"
          class="unit-list-btn"
        />
        <button class="add-btn" @click="() => addUnitToRegiment(unit)" title="Add to Regiment">
          +
        </button>
      </li>
    </ul>
  </div>
</template>
<style scoped>
.unit-picker-view {
  max-width: 400px;
  margin: 2rem auto;
  text-align: center;
}
.filters-bar {
  display: flex;
  gap: 1em;
  margin-bottom: 1.2em;
  justify-content: center;
}
.search-bar {
  width: 100%;
  max-width: 340px;
  font-size: 1.1em;
  padding: 0.6em 1em;
  border-radius: 6px;
  border: 1.5px solid #bbb;
  background: #fafafa;
  box-sizing: border-box;
  margin: 0 auto;
  transition: border 0.18s;
}
.search-bar:focus {
  border: 1.5px solid #1976d2;
  outline: none;
}
.unit-list {
  padding: 0;
  margin: 0;
  list-style: none;
}
.unit-row {
  display: flex;
  align-items: stretch;
  gap: 0;
  margin-bottom: 0.7em;
  width: 100%;
}
.unit-list-btn {
  flex: 1 1 0;
  margin: 0;
  border-radius: 8px 0 0 8px;
  min-width: 0;
  padding: 0;
}
.add-btn {
  flex: 0 0 56px;
  height: 44px;
  font-size: 1.3em;
  background: #f5f5f5;
  color: #1976d2;
  border: 1.5px solid #1976d2;
  border-left: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.18s,
    color 0.18s;
  margin: 0;
  padding: 0;
}
.add-btn:hover {
  background: #1976d2;
  color: #fff;
}
</style>
