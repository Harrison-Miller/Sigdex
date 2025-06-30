<script setup lang="ts">
import Modal from './Modal.vue';
import ToggleBox from './ToggleBox.vue';
import AbilityCard from './AbilityCard.vue';
import Section from './Section.vue';
import CounterBox from './CounterBox.vue';
import type { Army } from '../common/ArmyData';
import type { ListUnit, ListUnitWeaponOption } from '../common/ListData';
import type { Ability } from '../common/Ability';

const props = defineProps<{
  modelValue: boolean;
  unit: ListUnit;
  army: Army;
  regimentIdx: number;
  unitIdx: number | 'leader';
}>();
const emit = defineEmits(['close', 'update:modelValue', 'save']);

const armyUnit = computed(() => props.army.units.find((u) => u.name === props.unit.name));
const isReinforceable = computed(
  () => armyUnit.value?.notReinforcable !== true && armyUnit.value?.unit_size !== 1
);

const isGeneral = ref(!!props.unit.general);
const reinforced = ref(!!props.unit.reinforced);
const selectedHeroicTrait = ref(props.unit.heroic_trait || '');
const selectedArtifact = ref(props.unit.artifact || '');
const enhancementsCollapsed = ref(true);

watch(
  () => props.unit,
  (newUnit) => {
    isGeneral.value = !!newUnit.general;
    reinforced.value = !!newUnit.reinforced;
  }
);

const isHero = computed(() => armyUnit.value?.keywords?.some((k) => k.toLowerCase() === 'hero'));

const heroicTraitOptions = computed(() => {
  // Map<string, Ability[]> from army
  const map = props.army.heroicTraits;
  const sections: { section: string; abilities: Ability[] }[] = [];
  if (map && map.size > 0) {
    for (const [section, abilities] of map.entries()) {
      sections.push({ section, abilities });
    }
  }
  return sections;
});

const selectedAbility = computed(() => {
  if (!selectedHeroicTrait.value) return null;
  for (const { abilities } of heroicTraitOptions.value) {
    const found = abilities.find((a) => a.name === selectedHeroicTrait.value);
    if (found) return found;
  }
  return null;
});

watch(
  () => props.unit.heroic_trait,
  (newVal) => {
    selectedHeroicTrait.value = newVal || '';
  }
);

const artifactOptions = computed(() => {
  const map = props.army.artifacts;
  const sections: { section: string; abilities: Ability[] }[] = [];
  if (map && map.size > 0) {
    for (const [section, abilities] of map.entries()) {
      sections.push({ section, abilities });
    }
  }
  return sections;
});

const selectedArtifactAbility = computed(() => {
  if (!selectedArtifact.value) return null;
  for (const { abilities } of artifactOptions.value) {
    const found = abilities.find((a) => a.name === selectedArtifact.value);
    if (found) return found;
  }
  return null;
});

watch(
  () => props.unit.artifact,
  (newVal) => {
    selectedArtifact.value = newVal || '';
  }
);

function onHeroicTraitChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value;
  selectedHeroicTrait.value = val;
}

function onArtifactChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value;
  selectedArtifact.value = val;
}

// --- Weapon Options Rewrite ---
import { ref, computed, watch, reactive } from 'vue';

const modelGroups = computed(() => armyUnit.value?.models ?? []);

// State for optional weapons (max)
const optionalWeaponState = reactive<Record<string, Record<string, number>>>({});
// State for group selection weapons
const groupWeaponState = reactive<Record<string, Record<string, string>>>({});

// Helper: get effective max for a weapon (doubled if reinforced)
function getEffectiveMax(w: any) {
  if (!w.max) return 99;
  return reinforced.value ? w.max * 2 : w.max;
}

function getOptionalWeapons(group: any) {
  // Weapons with max and no group
  return (group.weapons || []).filter((w: any) => w.max && !w.group);
}
function getGroupWeapons(group: any) {
  // Map group name -> array of weapons
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
  // Read from props.unit.weapon_options (Map<string, ListUnitWeaponOption[]>)
  const saved = props.unit.weapon_options;
  for (const group of modelGroups.value) {
    if (!optionalWeaponState[group.name]) optionalWeaponState[group.name] = {};
    if (!groupWeaponState[group.name]) groupWeaponState[group.name] = {};
    // Optional weapons
    for (const w of getOptionalWeapons(group)) {
      let val = 0;
      if (saved && saved instanceof Map && saved.has(group.name)) {
        const arr = saved.get(group.name) as ListUnitWeaponOption[];
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
        const arr = saved.get(group.name) as ListUnitWeaponOption[];
        // Find a saved option for this groupKey
        const found = arr.find(
          (opt) =>
            groupMap[groupKey].some((w) => w.name === opt.name) && typeof opt.count !== 'number'
        );
        if (found) selected = found.name;
      }
      // If no saved selection, default to first available option
      if (!selected && groupMap[groupKey].length > 0) {
        selected = groupMap[groupKey][0].name;
      }
      groupWeaponState[group.name][groupKey] = selected;
    }
  }
}

watch(
  () => props.unit,
  () => {
    // Clear and re-init
    for (const k in optionalWeaponState) delete optionalWeaponState[k];
    for (const k in groupWeaponState) delete groupWeaponState[k];
    initWeaponStates();
  },
  { immediate: true }
);

function updateOptionalWeapon(groupName: string, weaponName: string, value: number) {
  optionalWeaponState[groupName][weaponName] = value;
}
function updateGroupWeapon(groupName: string, groupKey: string, value: string) {
  groupWeaponState[groupName][groupKey] = value;
}

function buildWeaponOptionsForSave() {
  // Output as Map<string, ListUnitWeaponOption[]>
  const result = new Map<string, ListUnitWeaponOption[]>();
  for (const group of modelGroups.value) {
    const arr: ListUnitWeaponOption[] = [];
    // Optional weapons (with max)
    for (const w of getOptionalWeapons(group)) {
      const count = optionalWeaponState[group.name][w.name] || 0;
      if (count > 0) arr.push({ name: w.name, count });
    }
    // Grouped weapons (selected only, no count)
    const groupMap = getGroupWeapons(group);
    for (const groupKey in groupMap) {
      const selected = groupWeaponState[group.name][groupKey];
      if (selected) arr.push({ name: selected });
    }
    if (arr.length > 0) result.set(group.name, arr);
  }
  return result;
}

function save() {
  // Create a copy of the current unit with updated fields
  const updatedUnit = {
    ...props.unit,
    general: isGeneral.value,
    reinforced: reinforced.value,
    heroic_trait: isHero.value ? selectedHeroicTrait.value || undefined : undefined,
    artifact: isHero.value ? selectedArtifact.value || undefined : undefined,
    weapon_options: buildWeaponOptionsForSave(),
  };
  emit('save', {
    regimentIdx: props.regimentIdx,
    unitIdx: props.unitIdx,
    unit: updatedUnit,
  });
  emit('update:modelValue', false);
}
function close() {
  emit('close');
  emit('update:modelValue', false);
}

// Count non-default enhancements for the section title
const enhancementCount = computed(() => {
  let count = 0;
  if (selectedHeroicTrait.value) count++;
  if (selectedArtifact.value) count++;
  // In the future, add more checks here for additional enhancements
  return count;
});

// Only show the model group header if there is more than one model group
const showModelGroupHeader = computed(() => modelGroups.value.length > 1);
</script>
<template>
  <Modal :model-value="modelValue" @close="close">
    <div class="unit-settings-modal">
      <h2 class="unit-name">{{ unit.name }}</h2>
      <div v-if="unitIdx === 'leader'" class="option-row">
        <ToggleBox v-model="isGeneral">General</ToggleBox>
      </div>
      <div v-if="isReinforceable" class="option-row">
        <ToggleBox v-model="reinforced">Reinforce</ToggleBox>
      </div>
      <!-- Weapon Options Section -->
      <div v-if="modelGroups.length > 0" class="weapon-options-section">
        <div v-for="group in modelGroups" :key="group.name">
          <template
            v-if="
              getOptionalWeapons(group).length > 0 || Object.keys(getGroupWeapons(group)).length > 0
            "
          >
            <div class="model-group-block">
              <div v-if="showModelGroupHeader" class="model-group-heading">{{ group.name }}</div>
              <!-- Optional weapons -->
              <div
                v-for="w in getOptionalWeapons(group)"
                :key="w.name"
                class="weapon-option-control"
              >
                <span class="weapon-option-name">{{ w.name }}</span>
                <CounterBox
                  class="weapon-option-counter"
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
      </div>
      <!-- End Weapon Options Section -->
      <Section v-if="isHero" v-model="enhancementsCollapsed" class="enhancements-section">
        <template #title>
          Enhancements<span v-if="enhancementCount > 0"> ({{ enhancementCount }})</span>
        </template>
        <div class="scrollable-options">
          <div class="option-row">
            <label for="heroic-trait-select">Heroic Trait</label>
            <select
              id="heroic-trait-select"
              :value="selectedHeroicTrait"
              @change="onHeroicTraitChange"
            >
              <option value="">No Heroic Trait</option>
              <template v-for="section in heroicTraitOptions" :key="section.section">
                <optgroup :label="section.section">
                  <option
                    v-for="ability in section.abilities"
                    :key="ability.name"
                    :value="ability.name"
                  >
                    {{ ability.name }}
                  </option>
                </optgroup>
              </template>
            </select>
            <div v-if="selectedAbility">
              <AbilityCard :ability="selectedAbility" />
            </div>
          </div>
          <div class="option-row">
            <label for="artifact-select">Artifact</label>
            <select id="artifact-select" :value="selectedArtifact" @change="onArtifactChange">
              <option value="">No Artifact</option>
              <template v-for="section in artifactOptions" :key="section.section">
                <optgroup :label="section.section">
                  <option
                    v-for="ability in section.abilities"
                    :key="ability.name"
                    :value="ability.name"
                  >
                    {{ ability.name }}
                  </option>
                </optgroup>
              </template>
            </select>
            <div v-if="selectedArtifactAbility">
              <AbilityCard :ability="selectedArtifactAbility" />
            </div>
          </div>
        </div>
      </Section>
      <div class="modal-actions">
        <button class="save-btn" @click="save">Save</button>
        <button class="cancel-btn" @click="close">Cancel</button>
      </div>
    </div>
  </Modal>
</template>
<style scoped>
.unit-settings-modal {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
  align-items: center;
  justify-content: center;
  text-align: center;
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
.scrollable-options {
  max-height: 320px;
  overflow-y: auto;
  width: 100%;
  margin-bottom: 1em;
}
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1em;
  margin-top: 1.2em;
}
.save-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.6em 1.3em;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.save-btn:hover {
  background: #1251a2;
}
.cancel-btn {
  background: #f5f5f5;
  color: #a00;
  border: 1.5px solid #a00;
  border-radius: 6px;
  padding: 0.6em 1.3em;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s,
    border 0.18s;
}
.cancel-btn:hover {
  background: #a00;
  color: #fff;
  border-color: #a00;
}
.enhancements-section {
  width: 100%;
  margin-bottom: 1em;
}
.weapon-options-section {
  width: 100%;
  margin-bottom: 1em;
}
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
.enhancement-count {
  font-weight: 500;
  font-size: 0.9em;
  color: #666;
  margin-left: 0.3em;
}
</style>
