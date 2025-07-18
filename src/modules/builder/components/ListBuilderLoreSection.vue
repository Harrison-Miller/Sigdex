<template>
  <Section
    v-if="computedArmyLore.size > 0"
    :default-collapsed="collapsed"
    :collapse-key="title"
  >
    <template #title>
      <span>{{ selectedLoreName || title }}</span>
      <span
        v-if="lore.points > 0"
        class="lore-points-badge"
      >
        {{ lore.points }} pts
      </span>
    </template>
    <div class="spell-lores-section">
      <OptionSelect
        v-model="selectedLoreName"
        :options="Array.from(computedArmyLore.keys())"
        placeholder="No Lore Selected"
      />
      <div v-if="props.manifestationMode && !loading && !error && selectedLoreName">
        <ul>
          <li
            v-for="unitName in manifestationUnits"
            :key="unitName"
          >
            <router-link
              v-slot="{ navigate, href }"
              :to="{
                name: 'UnitDetail',
                params: {
                  armyName: isUniversalLore ? 'UniversalManifestations' : armyName,
                  unitName: unitName,
                },
              }"
              custom
            >
              <ListButton
                :label="unitName"
                :href="href"
                @click="navigate"
              />
            </router-link>
          </li>
        </ul>
        <div
          v-if="manifestationUnits.length === 0"
          style="margin: 1em 0; color: #a00"
        >
          No summonable Manifestations found for this lore.
        </div>
      </div>
      <div v-else-if="lore.name">
        <AbilityCard
          v-for="(ability, i) in lore.abilities"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
    </div>
  </Section>
</template>
<script setup lang="ts">
import OptionSelect from '../../core/components/OptionSelect.vue';
import { ref, computed } from 'vue';
import Section from '../../core/components/ContentSection.vue';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import ListButton from '../../shared/components/ListButton.vue';
import { Lore } from '../../../parser/models/lore';
import { useGame } from '../../shared/composables/useGame';

const props = defineProps<{
  armyLore: Map<string, Lore>;
  modelValue: string;
  manifestationMode?: boolean;
  armyName: string;
  title?: string;
}>();
const emit = defineEmits(['update:modelValue']);

const { game, loading, error } = useGame();

const collapsed = ref(true);

const selectedLoreName = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
});

const computedArmyLore = computed(() => {
  if (props.manifestationMode) {
    // Clone the map to avoid mutating the prop
    const base = new Map(props.armyLore);
    for (const lore of game.value?.universalManifestationLores?.values() || []) {
      base.set(lore.name, lore);
    }
    return base;
  }
  return props.armyLore;
});

const lore = computed(() => {
  return (
    computedArmyLore.value.get(selectedLoreName.value) ||
    new Lore({ name: selectedLoreName.value, abilities: [] })
  );
});

const manifestationUnits = computed(() => {
  return (
    computedArmyLore.value
      .get(selectedLoreName.value)
      ?.abilities.flatMap((ability) => {
        return ability.summonedUnits;
      })
      .filter((unit) => unit.length > 0) || []
  );
});

const isUniversalLore = computed(() => {
  return game.value?.universalManifestationLores?.has(selectedLoreName.value);
});
</script>
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
