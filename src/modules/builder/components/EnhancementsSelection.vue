<template>
  <Section v-if="isHero && unitData && army" v-model="enhancementsCollapsed">
    <template #title>
      Enhancements<span v-if="enhancementCount > 0"> ({{ enhancementCount }})</span>
    </template>
    <div>
      <h3>Heroic Trait</h3>
      <select id="heroic-trait-select" v-model="unit.heroic_trait" class="enhancement-select">
        <option value="" id="">No Heroic Trait</option>
        <template v-for="section in army.heroicTraits.keys()" :key="section">
          <optgroup :label="section">
            <option
              v-for="ability in army.heroicTraits.get(section)"
              :key="ability.name"
              :value="ability.name"
            >
              {{ ability.name }}
            </option>
          </optgroup>
        </template>
      </select>
      <div v-if="selectedHeroicTraitAbility">
        <AbilityCard :ability="selectedHeroicTraitAbility" />
      </div>
    </div>
    <div>
      <h3>Artifact</h3>
      <select id="artifact-select" v-model="unit.artifact" class="enhancement-select">
        <option value="" id="">No Artifact</option>
        <template v-for="section in army.artifacts.keys()" :key="section">
          <optgroup :label="section">
            <option
              v-for="ability in army.artifacts.get(section)"
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
  </Section>
</template>
<script setup lang="ts">
import AbilityCard from '../../../components/AbilityCard.vue';
import Section from '../../../components/Section.vue';
import type { ListUnit } from '../../../common/ListData';
import type { Unit } from '../../../common/UnitData';
import { ref, computed, onMounted } from 'vue';
import type { Army } from '../../../common/ArmyData';

const props = defineProps<{ modelValue: ListUnit; unitData?: Unit; army?: Army }>();
const emit = defineEmits(['update:modelValue']);

const unit = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isHero = computed(() => props.unitData?.keywords?.some((k) => k.toLowerCase() === 'hero'));

const selectedHeroicTraitAbility = computed(() => {
  if (!unit.value?.heroic_trait || !props.army?.heroicTraits) return null;
  for (const abilities of props.army.heroicTraits.values()) {
    const found = abilities.find((a: any) => a.name === unit.value?.heroic_trait);
    if (found) return found;
  }
  return null;
});

const selectedArtifactAbility = computed(() => {
  if (!unit.value?.artifact || !props.army?.artifacts) return null;
  for (const abilities of props.army.artifacts.values()) {
    const found = abilities.find((a: any) => a.name === unit.value?.artifact);
    if (found) return found;
  }
  return null;
});

const enhancementCount = computed(() => {
  let count = 0;
  if (unit.value?.heroic_trait) count++;
  if (unit.value?.artifact) count++;
  return count;
});

// Only collapse on first mount if no enhancements are selected
const enhancementsCollapsed = ref(false);
onMounted(() => {
  if (enhancementCount.value === 0) enhancementsCollapsed.value = true;
});
</script>
<style scoped>
.enhancement-select {
  width: 100%;
  max-width: 420px;
  min-width: 220px;
  padding: 0.7em 1.2em 0.7em 0.9em;
  border: 1.7px solid #bbb;
  border-radius: 8px;
  background: #f7fafd;
  font-size: 1.08em;
  color: #222;
  margin-bottom: 0.7em;
  margin-top: 0.2em;
  transition: border 0.18s;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: inherit;
}
.enhancement-select:focus {
  border-color: #1976d2;
  outline: none;
  background: #f0f6ff;
}
</style>
