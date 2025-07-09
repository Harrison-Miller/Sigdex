<template>
  <Section
    v-if="(isHero || hasEnhancementTables) && unitData && army"
    v-model="enhancementsCollapsed"
  >
    <template #title>
      Enhancements<span v-if="enhancementCount > 0"> ({{ enhancementCount }})</span>
    </template>
    <div v-if="isHero">
      <h3>Heroic Trait</h3>
      <OptionSelect
        id="heroic-trait-select"
        v-model="unit.heroic_trait"
        :options="heroicTraitsOptions"
        placeholder="No Heroic Trait"
      />
      <div v-if="selectedHeroicTraitAbility">
        <AbilityCard :ability="new Ability({ name: selectedHeroicTraitAbility?.name })" />
      </div>
    </div>
    <div v-if="isHero">
      <h3>Artifact</h3>
      <OptionSelect
        id="artifact-select"
        v-model="unit.artifact"
        :options="artifactsOptions"
        placeholder="No Artifact"
      />
      <div v-if="selectedArtifactAbility">
        <AbilityCard :ability="new Ability({ name: selectedArtifactAbility?.name })" />
      </div>
    </div>
    <div v-for="tableName in availableEnhancementTables" :key="tableName">
      <h3>{{ tableName }}</h3>
      <OptionSelect
        :id="`enhancement-${tableName}-select`"
        :model-value="unit.enhancements?.get(tableName) || ''"
        :options="new Map([['', getEnhancementTableOptions(tableName)]])"
        :placeholder="`No ${tableName}`"
        @update:model-value="updateEnhancement(tableName, $event)"
      />
      <div v-if="getSelectedEnhancementAbility(tableName)">
        <AbilityCard
          :ability="new Ability({ name: getSelectedEnhancementAbility(tableName)?.name })"
        />
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
import { Ability } from '../../../parser/v3/models/ability';

const props = defineProps<{ modelValue: ListUnit; unitData?: Unit; army?: Army }>();
const emit = defineEmits(['update:modelValue']);

const unit = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isHero = computed(() => props.unitData?.keywords?.some((k) => k.toLowerCase() === 'hero'));

const hasEnhancementTables = computed(() => {
  return availableEnhancementTables.value.length > 0;
});

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
  if (unit.value?.enhancements) {
    count += unit.value.enhancements.size;
  }
  return count;
});

// Only collapse on first mount if no enhancements are selected
const enhancementsCollapsed = ref(false);
onMounted(() => {
  if (enhancementCount.value === 0) enhancementsCollapsed.value = true;
});

const availableEnhancementTables = computed(() => {
  if (!props.unitData?.enhancement_tables || !props.army?.enhancementTables) return [];
  return props.unitData.enhancement_tables.filter((tableName) =>
    props.army!.enhancementTables.has(tableName)
  );
});

const getEnhancementTableOptions = (tableName: string) => {
  const table = props.army?.enhancementTables.get(tableName);
  if (!table) return [];
  return table.map((ability) => ability.name);
};

const getSelectedEnhancementAbility = (tableName: string) => {
  if (!unit.value?.enhancements || !props.army?.enhancementTables) return null;
  const selectedName = unit.value.enhancements.get(tableName);
  if (!selectedName) return null;

  const table = props.army.enhancementTables.get(tableName);
  if (!table) return null;

  return table.find((ability) => ability.name === selectedName) || null;
};

const updateEnhancement = (tableName: string, enhancementName: string | undefined) => {
  if (!unit.value.enhancements) {
    unit.value.enhancements = new Map();
  }

  if (enhancementName) {
    unit.value.enhancements.set(tableName, enhancementName);
  } else {
    unit.value.enhancements.delete(tableName);
  }

  // Trigger reactivity by creating a new object
  unit.value = { ...unit.value, enhancements: new Map(unit.value.enhancements) };
};
</script>
