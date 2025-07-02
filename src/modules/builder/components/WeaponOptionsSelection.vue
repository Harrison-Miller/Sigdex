<template>
  <Section v-if="unitData && modelGroups.length > 0" class="weapon-options-section">
    <template #title> Weapon Options </template>
    <div v-for="group in modelGroups" :key="group.name">
      <template
        v-if="
          getOptionalWeapons(group).length > 0 || Object.keys(getGroupWeapons(group)).length > 0
        "
      >
        <div class="model-group-block">
          <div v-if="showModelGroupHeader" class="model-group-heading">{{ group.name }}</div>
          <!-- Optional weapons -->
          <div v-for="w in getOptionalWeapons(group)" :key="w.name" class="weapon-option-control">
            <span class="weapon-option-name">{{ w.name }}</span>
            <CounterBox
              :model-value="optionalWeaponState[group.name][w.name]"
              :min="0"
              :max="getEffectiveMax(w) || 99"
              @update:modelValue="(val) => updateOptionalWeapon(group.name, w.name, val)"
            />
          </div>
          <!-- Group selection weapons -->
          <div
            v-for="(weapons, groupKey) in getGroupWeapons(group)"
            :key="groupKey"
            class="weapon-option-control"
          >
            <span class="weapon-option-name">{{ groupKey }}</span>
            <select
              class="weapon-option-dropdown"
              :value="groupWeaponState[group.name][groupKey]"
              @change="
                (e) =>
                  updateGroupWeapon(group.name, groupKey, (e.target as HTMLSelectElement).value)
              "
            >
              <option v-for="w in weapons" :key="w.name" :value="w.name" :title="w.name">
                {{ w.name }}
              </option>
            </select>
          </div>
        </div>
      </template>
    </div>
  </Section>
</template>
<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import CounterBox from '../../core/components/CounterBox.vue';
import Section from '../../core/components/Section.vue';
import type { ListUnit } from '../../../common/ListData';
import type { Unit } from '../../../common/UnitData';

// v-model:unit
const props = defineProps<{ modelValue: ListUnit; unitData?: Unit }>();
const emit = defineEmits(['update:modelValue']);

const modelGroups = computed(() => props.unitData?.models ?? []);

// State for optional weapons (max)
const optionalWeaponState = reactive<Record<string, Record<string, number>>>({});
// State for group selection weapons
const groupWeaponState = reactive<Record<string, Record<string, string>>>({});

function getEffectiveMax(w: any) {
  if (!w.max) return 99;
  return props.modelValue.reinforced ? w.max * 2 : w.max;
}

function getOptionalWeapons(group: any) {
  return (group.weapons || []).filter((w: any) => w.max && !w.group);
}
function getGroupWeapons(group: any) {
  const map: Record<string, any[]> = {};
  for (const w of group.weapons || []) {
    if (w.group) {
      if (!map[w.group]) map[w.group] = [];
      map[w.group].push(w);
    }
  }
  return map;
}

function initWeaponStates() {
  const saved = props.modelValue.weapon_options;
  for (const group of modelGroups.value) {
    if (!optionalWeaponState[group.name]) optionalWeaponState[group.name] = {};
    if (!groupWeaponState[group.name]) groupWeaponState[group.name] = {};
    // Optional weapons
    for (const w of getOptionalWeapons(group)) {
      let val = 0;
      if (saved && saved instanceof Map && saved.has(group.name)) {
        const arr = saved.get(group.name) as any[];
        const found = arr.find((opt) => opt.name === w.name && typeof opt.count === 'number');
        if (found) val = found.count || 0;
      }
      optionalWeaponState[group.name][w.name] = val;
    }
    // Grouped weapons
    const groupMap = getGroupWeapons(group);
    for (const groupKey in groupMap) {
      let selected = '';
      if (saved && saved instanceof Map && saved.has(group.name)) {
        const arr = saved.get(group.name) as any[];
        const found = arr.find(
          (opt) =>
            groupMap[groupKey].some((w) => w.name === opt.name) && typeof opt.count !== 'number'
        );
        if (found) selected = found.name;
      }
      if (!selected && groupMap[groupKey].length > 0) {
        selected = groupMap[groupKey][0].name;
      }
      groupWeaponState[group.name][groupKey] = selected;
    }
  }
}

watch(
  () => [props.modelValue, props.unitData],
  () => {
    for (const k in optionalWeaponState) delete optionalWeaponState[k];
    for (const k in groupWeaponState) delete groupWeaponState[k];
    if (props.unitData) initWeaponStates();
  },
  { immediate: true, deep: true }
);

function updateOptionalWeapon(groupName: string, weaponName: string, value: number) {
  optionalWeaponState[groupName][weaponName] = value;
  emitUpdatedModelValue();
}
function updateGroupWeapon(groupName: string, groupKey: string, value: string) {
  groupWeaponState[groupName][groupKey] = value;
  emitUpdatedModelValue();
}

function buildWeaponOptionsForSave() {
  const result = new Map<string, any[]>();
  for (const group of modelGroups.value) {
    const arr: any[] = [];
    for (const w of getOptionalWeapons(group)) {
      const count = optionalWeaponState[group.name][w.name] || 0;
      if (count > 0) arr.push({ name: w.name, count });
    }
    const groupMap = getGroupWeapons(group);
    for (const groupKey in groupMap) {
      const selected = groupWeaponState[group.name][groupKey];
      if (selected) arr.push({ name: selected });
    }
    if (arr.length > 0) result.set(group.name, arr);
  }
  return result;
}

function emitUpdatedModelValue() {
  emit('update:modelValue', {
    ...props.modelValue,
    weapon_options: buildWeaponOptionsForSave(),
  });
}

const showModelGroupHeader = computed(() => modelGroups.value.length > 1);
</script>
<style scoped>
.model-group-block {
  margin-bottom: 1.2em;
}
.model-group-heading {
  font-weight: 600;
  margin-bottom: 0.3em;
  margin-top: 0.7em;
  text-align: left;
}
.weapon-group-label {
  font-weight: 500;
  margin-bottom: 0.2em;
  margin-top: 0.2em;
  text-align: left;
}
.weapon-options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7em;
  margin-bottom: 0.5em;
}
.weapon-option-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5em;
  margin-bottom: 0.4em;
}
.weapon-option-name {
  flex: 1 1 0;
  text-align: left;
  min-width: 0;
  padding-right: 1em;
  white-space: normal; /* allow wrapping */
  overflow-wrap: anywhere;
  word-break: break-word;
}
.weapon-option-counter,
.weapon-option-dropdown {
  flex: 0 0 180px;
  display: flex;
  justify-content: flex-end;
}
.weapon-option-dropdown {
  width: 100%;
  max-width: 180px;
  min-width: 120px;
  padding: 0.4em 1.1em 0.4em 0.7em;
  border: 1.5px solid #bbb;
  border-radius: 7px;
  background: #fafbfc;
  font-size: 1em;
  color: #222;
  transition: border 0.18s;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.weapon-group-select {
  margin-bottom: 0.7em;
}
</style>
