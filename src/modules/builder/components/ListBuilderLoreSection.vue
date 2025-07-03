<script setup lang="ts">
import OptionSelect from '../../core/components/OptionSelect.vue';
import { ref, watch, computed } from 'vue';
import Section from '../../core/components/Section.vue';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import ListButton from '../../shared/components/ListButton.vue';
import { universalManifestationLores } from '../../../common/ManifestationData';
import { loadUniversalUnits } from '../../../army';
import type { Unit } from '../../../common/UnitData';
import type { Lore } from '../../../common/ManifestationData';
import type { Army } from '../../../common/ArmyData';

const props = defineProps<{
  armyLore: any[] | null | undefined; // spellLores, prayerLores, or manifestationLores
  lores: Map<string, any> | null;
  modelValue: boolean;
  selectedLore: string;
  manifestationMode?: boolean;
  currentArmy?: Army | null;
  armyName?: string; // Optional, used for universal manifestation lores
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

const manifestationUnits = ref<Unit[]>([]);
const manifestationLoading = ref(false);

async function loadManifestationUnits() {
  manifestationLoading.value = true;
  manifestationUnits.value = [];
  if (!props.manifestationMode || !selectedLore.value || !props.lores) {
    manifestationLoading.value = false;
    return;
  }
  const lore: Lore | undefined = props.lores.get(selectedLore.value);
  if (!lore) {
    manifestationLoading.value = false;
    return;
  }
  let units: Unit[] = [];
  // Army lore: use army units, else universal units
  const isArmyLore =
    Array.isArray(props.armyLore) && props.armyLore.some((l) => l.name === selectedLore.value);
  if (isArmyLore && props.currentArmy && Array.isArray(props.currentArmy.units)) {
    units = props.currentArmy.units;
  } else {
    units = await loadUniversalUnits();
  }
  // Find all units that are referenced by any spell/ability in this lore (match logic from ManifestationLore.vue)
  const unitNames = new Set<string>();
  for (const unit of units) {
    if (unit.category !== 'Manifestation') continue;
    for (const ability of lore.abilities) {
      if (
        (ability.name && ability.name.includes(unit.name)) ||
        (ability.text && ability.text.includes(unit.name))
      ) {
        unitNames.add(unit.name);
        break; // No need to check other abilities for this unit
      }

      // to lowercase and filter out of/and/or/a/an
      const nameParts = unit.name
        .split(' ')
        .map((part) => part.toLowerCase())
        .filter((part) => !['of', 'and', 'or', 'a', 'an', 'the'].includes(part));
      if (
        nameParts.some((part) => {
          return (
            ability.name?.toLowerCase().includes(part.toLowerCase()) ||
            ability.text?.toLowerCase().includes(part.toLowerCase())
          );
        })
      ) {
        unitNames.add(unit.name);
        break; // No need to check other abilities for this unit
      }
    }
  }
  manifestationUnits.value = units.filter((u) => unitNames.has(u.name));
  manifestationLoading.value = false;
}

watch(
  [() => props.manifestationMode, selectedLore, () => props.lores],
  () => {
    if (props.manifestationMode) loadManifestationUnits();
  },
  { immediate: true }
);

const isUniversalLore = computed(() => {
  // If the selected lore is in universalManifestationLores, it's universal
  return universalManifestationLores.includes(selectedLore.value);
});
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
        <OptionSelect v-model="selectedLore" :options="computedArmyLore.map((lore) => lore.name)" />
      </template>
      <div v-if="props.manifestationMode">
        <div v-if="manifestationLoading" style="margin: 1em 0">Loading...</div>
        <ul v-else>
          <li v-for="unit in manifestationUnits" :key="unit.name">
            <router-link
              :to="{
                name: 'UnitDetail',
                params: {
                  army: isUniversalLore ? 'UniversalManifestations' : props.armyName || '',
                  unit: unit.name,
                },
              }"
              custom
              v-slot="{ navigate, href }"
            >
              <ListButton :label="unit.name" :points="unit.points" @click="navigate" :href="href" />
            </router-link>
          </li>
        </ul>
        <div
          v-if="!manifestationLoading && manifestationUnits.length === 0"
          style="margin: 1em 0; color: #a00"
        >
          No summonable Manifestations found for this lore.
        </div>
      </div>
      <div v-else-if="selectedLore && lores && lores.get(selectedLore)">
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
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  margin-bottom: 0.5em;
}
</style>
