<template>
  <Section v-if="isHero || hasEnhancementTables" v-model="enhancementsCollapsed">
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
        <AbilityCard :ability="selectedHeroicTraitAbility?.ability || new Ability({ name: '' })" />
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
        <AbilityCard :ability="selectedArtifactAbility?.ability || new Ability({ name: '' })" />
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
          :ability="getSelectedEnhancementAbility(tableName)?.ability || new Ability({ name: '' })"
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
import { ref, computed, onMounted } from 'vue';
import { Ability } from '../../../parser/v3/models/ability';
import type { IArmy } from '../../../parser/v3/models/army';
import { BattleProfile } from '../../../parser/v3/models/battleProfile';

const props = defineProps<{ modelValue: ListUnit; army: IArmy }>();
const emit = defineEmits(['update:modelValue']);

const unit = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const battleProfile = computed(() => {
  return (
    props.army.battleProfiles.get(unit.value.name) || new BattleProfile({ name: unit.value.name })
  );
});

const isHero = computed(() => battleProfile.value.category === 'HERO');

const hasEnhancementTables = computed(() => {
  return availableEnhancementTables.value.length > 0;
});

const heroicTraitsOptions = computed(() => {
  const options = new Map<string, string[]>();
  for (const [section, table] of props.army.heroicTraits.entries()) {
    options.set(
      section,
      table.enhancements.map((enhancement) => enhancement.ability.name)
    );
  }
  return options;
});

const artifactsOptions = computed(() => {
  const options = new Map<string, string[]>();
  for (const [section, table] of props.army.artifacts.entries()) {
    options.set(
      section,
      table.enhancements.map((enhancement) => enhancement.ability.name)
    );
  }
  return options;
});

const selectedHeroicTraitAbility = computed(() => {
  if (!unit.value?.heroic_trait) return null;
  for (const table of props.army.heroicTraits.values()) {
    const found = table.enhancements.find((a: any) => a.name === unit.value?.heroic_trait);
    if (found) return found;
  }
  return null;
});

const selectedArtifactAbility = computed(() => {
  if (!unit.value?.artifact) return null;
  for (const table of props.army.artifacts.values()) {
    const found = table.enhancements.find((a: any) => a.name === unit.value?.artifact);
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
  if (battleProfile.value.enhancementTables.length === 0 || props.army.enhancements.size === 0)
    return [];
  return battleProfile.value.enhancementTables.filter((tableName) =>
    props.army.enhancements.has(tableName)
  );
});

const getEnhancementTableOptions = (tableName: string) => {
  const table = props.army.enhancements.get(tableName);
  if (!table) return [];
  return table.enhancements.map((enhancement) => enhancement.ability.name);
};

const getSelectedEnhancementAbility = (tableName: string) => {
  if (
    !unit.value?.enhancements ||
    props.army.enhancements.size === 0 ||
    !props.army.enhancements.has(tableName)
  )
    return null;
  const selectedName = unit.value.enhancements.get(tableName);
  if (!selectedName) return null;

  const table = props.army.enhancements.get(tableName);
  if (!table) return null;

  return (
    table.enhancements.find((enhancement) => enhancement.ability.name === selectedName) || null
  );
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
