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
          <!-- Group selection weapons as CounterBoxes -->
          <div v-for="(weapons, groupKey) in getGroupWeapons(group)" :key="groupKey">
            <span class="weapon-option-name">{{ groupKey }}</span>
            <template v-if="unitData.unitSize === 1">
              <div class="weapon-option-control">
                <OptionSelect
                  :model-value="groupWeaponSingleSelect[group.name]?.[groupKey]"
                  :options="weapons.map((w) => w.name)"
                  @update:modelValue="
                    (val) => {
                      handleSingleSelectChange(group.name, groupKey, val);
                    }
                  "
                />
              </div>
            </template>
            <template v-else>
              <div v-for="w in weapons" :key="w.name" class="weapon-option-control">
                <span class="weapon-option-name">{{ w.name }}</span>
                <CounterBox
                  :model-value="groupWeaponCounterState[group.name]?.[groupKey]?.[w.name] || 0"
                  :min="0"
                  :max="
                    getGroupWeaponMax(group) - getGroupWeaponUsedExcept(group, groupKey, w.name)
                  "
                  @update:modelValue="
                    (val) => updateGroupWeaponCounter(group.name, groupKey, w.name, val)
                  "
                />
              </div>
            </template>
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
import OptionSelect from '../../core/components/OptionSelect.vue';
import type { IUnit } from '../../../parser/v3/models/unit';
import type { IWeaponOption } from '../../../parser/v3/models/weaponOption';
import type { IModel } from '../../../parser/v3/models/model';

// v-model:unit
const props = defineProps<{ modelValue: ListUnit; unitData: IUnit }>();
const emit = defineEmits(['update:modelValue']);

const modelGroups = computed(() => Array.from(props.unitData?.models?.values?.() ?? []));

// State for optional weapons (max)
const optionalWeaponState = reactive<Record<string, Record<string, number>>>({});
// State for group selection weapons (counter per weapon in group)
const groupWeaponCounterState = reactive<Record<string, Record<string, Record<string, number>>>>(
  {}
);

function getEffectiveMax(w: IWeaponOption) {
  if (w.type !== 'optional' || !w.max) return 99;
  return props.modelValue.reinforced ? w.max * 2 : w.max;
}

function getOptionalWeapons(group: IModel) {
  return Array.from(group.weapons.values()).filter(
    (w: IWeaponOption) => w.type === 'optional' && w.max
  );
}
function getGroupWeapons(group: IModel) {
  const map: Record<string, IWeaponOption[]> = {};
  for (const [_, w] of group.weapons || []) {
    if (w.type === 'grouped' && w.group) {
      if (!map[w.group]) map[w.group] = [];
      map[w.group].push(w);
    }
  }
  return map;
}

// State for single-select dropdowns for grouped weapons (for alwaysSingleModel)
const groupWeaponSingleSelect = reactive<Record<string, Record<string, string>>>({});

function handleSingleSelectChange(groupName: string, groupKey: string, weapon: string | undefined) {
  if (!weapon) {
    return; // No weapon selected, do nothing
  }

  if (!groupWeaponSingleSelect[groupName]) groupWeaponSingleSelect[groupName] = {};
  groupWeaponSingleSelect[groupName][groupKey] = weapon;
  // Set all to 0, then set selected to 1
  if (!groupWeaponCounterState[groupName]) groupWeaponCounterState[groupName] = {};
  if (!groupWeaponCounterState[groupName][groupKey])
    groupWeaponCounterState[groupName][groupKey] = {};
  // Set all to 0 for all weapons in the group, then set selected to 1
  const group = modelGroups.value.find((g) => g.name === groupName);
  const groupMap = group ? getGroupWeapons(group) : {};
  const weapons = groupMap[groupKey] || [];
  for (const w of weapons) {
    groupWeaponCounterState[groupName][groupKey][w.name] = 0;
  }
  groupWeaponCounterState[groupName][groupKey][weapon] = 1;
  emitUpdatedModelValue();
}

function initWeaponStates() {
  const saved = props.modelValue.weapon_options;
  for (const group of modelGroups.value) {
    if (!optionalWeaponState[group.name]) optionalWeaponState[group.name] = {};
    if (!groupWeaponCounterState[group.name]) groupWeaponCounterState[group.name] = {};
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
      if (!groupWeaponCounterState[group.name][groupKey])
        groupWeaponCounterState[group.name][groupKey] = {};
      if (props.unitData?.unitSize === 1) {
        // Single select: find which is selected (count==1)
        let selected = '';
        if (saved && saved instanceof Map && saved.has(group.name)) {
          const arr = saved.get(group.name) as any[];
          const found = arr.find(
            (opt) => groupMap[groupKey].some((w) => w.name === opt.name) && opt.count === 1
          );
          if (found) selected = found.name;
        }
        if (!selected && groupMap[groupKey].length > 0) {
          selected = groupMap[groupKey][0].name;
        }
        if (!groupWeaponSingleSelect[group.name]) groupWeaponSingleSelect[group.name] = {};
        groupWeaponSingleSelect[group.name][groupKey] = selected;
        // Set all to 0, then selected to 1
        for (const w of groupMap[groupKey]) {
          groupWeaponCounterState[group.name][groupKey][w.name] = w.name === selected ? 1 : 0;
        }
      } else {
        if (saved && saved instanceof Map && saved.has(group.name)) {
          const arr = saved.get(group.name) as any[];
          for (const w of groupMap[groupKey]) {
            const found = arr.find((opt) => opt.name === w.name && typeof opt.count === 'number');
            groupWeaponCounterState[group.name][groupKey][w.name] = found ? found.count || 0 : 0;
          }
        } else {
          for (const w of groupMap[groupKey]) {
            groupWeaponCounterState[group.name][groupKey][w.name] = 0;
          }
        }
      }
    }
  }
}

watch(
  () => [props.modelValue, props.unitData],
  () => {
    for (const k in optionalWeaponState) delete optionalWeaponState[k];
    for (const k in groupWeaponCounterState) delete groupWeaponCounterState[k];
    if (props.unitData) initWeaponStates();
  },
  { immediate: true, deep: true }
);

function updateOptionalWeapon(groupName: string, weaponName: string, value: number) {
  optionalWeaponState[groupName][weaponName] = value;
  emitUpdatedModelValue();
}

// Group weapon counter logic
function updateGroupWeaponCounter(
  groupName: string,
  groupKey: string,
  weaponName: string,
  value: number
) {
  if (!groupWeaponCounterState[groupName]) groupWeaponCounterState[groupName] = {};
  if (!groupWeaponCounterState[groupName][groupKey])
    groupWeaponCounterState[groupName][groupKey] = {};
  groupWeaponCounterState[groupName][groupKey][weaponName] = value;
  emitUpdatedModelValue();
}

function getGroupWeaponMax(group: any) {
  // group.count * (reinforced ? 2 : 1)
  const base = group.count || 1;
  return base * (props.modelValue.reinforced ? 2 : 1);
}

function getGroupWeaponUsedExcept(group: any, groupKey: string, exceptWeapon: string) {
  // Sum all counts in the group except the one being edited
  const state = groupWeaponCounterState[group.name]?.[groupKey] || {};
  let sum = 0;
  for (const w in state) {
    if (w !== exceptWeapon) sum += state[w] || 0;
  }
  return sum;
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
      for (const w of groupMap[groupKey]) {
        const count = groupWeaponCounterState[group.name]?.[groupKey]?.[w.name] || 0;
        if (count > 0) arr.push({ name: w.name, count });
      }
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
.weapon-option-counter {
  flex: 0 0 180px;
  display: flex;
  justify-content: flex-end;
}
</style>
