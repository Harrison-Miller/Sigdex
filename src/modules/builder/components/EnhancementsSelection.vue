<template>
  <Section v-if="isHero && unitData && army" v-model="enhancementsCollapsed">
    <template #title>
      Enhancements<span v-if="enhancementCount > 0"> ({{ enhancementCount }})</span>
    </template>
    <div>
      <h3>Heroic Trait</h3>
      <OptionSelect
        id="heroic-trait-select"
        v-model="unit.heroic_trait"
        :options="heroicTraitsOptions"
        placeholder="No Heroic Trait"
      />
      <div v-if="selectedHeroicTraitAbility">
        <AbilityCard :ability="selectedHeroicTraitAbility" />
      </div>
    </div>
    <div>
      <h3>Artifact</h3>
      <OptionSelect
        id="artifact-select"
        v-model="unit.artifact"
        :options="artifactsOptions"
        placeholder="No Artifact"
      />
      <div v-if="selectedArtifactAbility">
        <AbilityCard :ability="selectedArtifactAbility" />
      </div>
    </div>
  </Section>
</template>
<script setup lang="ts">
import AbilityCard from '../../shared/components/AbilityCard.vue';
import Section from '../../core/components/Section.vue';
import OptionSelect from '../../core/components/OptionSelect.vue';
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

const heroicTraitsOptions = computed(() => {
  if (!props.army?.heroicTraits) return new Map<string, string[]>();
  const options = new Map<string, string[]>();
  for (const [section, abilities] of props.army.heroicTraits.entries()) {
    options.set(
      section,
      abilities.map((ability) => ability.name)
    );
  }
  return options;
});

const artifactsOptions = computed(() => {
  if (!props.army?.artifacts) return new Map<string, string[]>();
  const options = new Map<string, string[]>();
  for (const [section, abilities] of props.army.artifacts.entries()) {
    options.set(
      section,
      abilities.map((ability) => ability.name)
    );
  }
  return options;
});

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
