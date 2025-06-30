<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Modal from './Modal.vue';
import ToggleBox from './ToggleBox.vue';
import AbilityCard from './AbilityCard.vue';
import Section from './Section.vue';
import type { Army } from '../common/ArmyData';
import type { ListUnit } from '../common/ListData';
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

function save() {
  // Create a copy of the current unit with updated fields
  const updatedUnit = {
    ...props.unit,
    general: isGeneral.value,
    reinforced: reinforced.value,
    heroic_trait: isHero.value ? selectedHeroicTrait.value || undefined : undefined,
    artifact: isHero.value ? selectedArtifact.value || undefined : undefined,
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
.enhancement-count {
  font-weight: 500;
  font-size: 0.9em;
  color: #666;
  margin-left: 0.3em;
}
</style>
