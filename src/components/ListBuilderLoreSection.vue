<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import Section from './Section.vue';
import AbilityCard from './AbilityCard.vue';
import { universalManifestationLores } from '../common/ManifestationData';

const props = defineProps<{
  armyLore: any[] | null | undefined; // spellLores, prayerLores, or manifestationLores
  lores: Map<string, any> | null;
  modelValue: boolean;
  selectedLore: string;
  manifestationMode?: boolean;
}>();
const emit = defineEmits(['update:modelValue', 'update:selectedLore', 'saveLore']);

const collapsed = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const selectedLore = ref(props.selectedLore);

watch(
  () => props.selectedLore,
  (val) => {
    selectedLore.value = val;
  }
);

watch(selectedLore, (val) => {
  emit('update:selectedLore', val);
  // Only emit saveLore if the value actually changed
  if (val !== props.selectedLore) {
    emit('saveLore', val);
  }
});

const computedArmyLore = computed(() => {
  if (props.manifestationMode) {
    // Merge armyLore with universalManifestationLores (avoid duplicates)
    const base = Array.isArray(props.armyLore) ? [...props.armyLore] : [];
    const names = new Set(base.map((l) => l.name));
    for (const name of universalManifestationLores) {
      if (!names.has(name)) {
        base.push({ name });
      }
    }
    return base;
  }
  return props.armyLore || [];
});

const sectionTitle = computed(() => {
  return (
    selectedLore.value ||
    (props.armyLore === undefined
      ? ''
      : props.armyLore?.[0]?.type === 'prayer'
        ? 'Prayer Lores'
        : 'Spell Lores')
  );
});

const getLorePoints = (loreName: string): number | undefined => {
  // Try to get points from armyLore first
  const armyLorePoints = Array.isArray(props.armyLore)
    ? props.armyLore.find((l) => l.name === loreName)?.points
    : undefined;
  if (typeof armyLorePoints === 'number') return armyLorePoints;
  // Fallback to lores Map
  return props.lores?.get(loreName)?.points;
};
</script>
<template>
  <Section v-if="computedArmyLore && computedArmyLore.length > 0" v-model="collapsed">
    <template #title>
      <span>{{ sectionTitle }}</span>
      <span v-if="computedArmyLore && selectedLore">
        <span v-for="lore in computedArmyLore" :key="lore.name">
          <span
            v-if="lore.name === selectedLore && getLorePoints(lore.name)"
            class="lore-points-badge"
          >
            {{ getLorePoints(lore.name) }} pts
          </span>
        </span>
      </span>
    </template>
    <div class="spell-lores-section">
      <template v-if="computedArmyLore.length > 1">
        <select v-model="selectedLore">
          <option v-for="lore in computedArmyLore" :key="lore.name" :value="lore.name">
            {{ lore.name
            }}<span v-if="getLorePoints(lore.name)"> ({{ getLorePoints(lore.name) }} pts)</span>
          </option>
        </select>
      </template>
      <div v-if="selectedLore && lores && lores.get(selectedLore)">
        <AbilityCard
          v-for="(ability, i) in lores.get(selectedLore).abilities"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
    </div>
  </Section>
</template>
<style scoped>
.spell-lores-section {
  margin: 1.5em 0 0 0;
}
.spell-lores-section select {
  width: 100%;
  padding: 0.7em;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1em;
}
.lore-points-badge {
  display: inline-block;
  background: #a00;
  color: #fff;
  border-radius: 10px;
  font-size: 0.75em;
  font-weight: 600;
  padding: 0.08em 0.4em 0.08em 0.4em;
  margin-left: 0.4em;
  vertical-align: middle;
}
</style>
