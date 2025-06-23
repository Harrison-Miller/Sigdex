<template>
  <div v-if="loresLoading || !army">Loading rules...</div>
  <div v-else>
    <Section v-if="army.battleTraits && army.battleTraits.length">
      <template #title>Battle Traits</template>
      <AbilityCard v-for="(trait, i) in army.battleTraits" :key="trait.name + i" :ability="trait" />
    </Section>
    <Section v-if="army.formations && army.formations.size">
      <template #title>Formations</template>
      <div
        v-for="[formationName, abilities] in Array.from(army.formations.entries())"
        :key="formationName"
      >
        <h3 class="section-subheader">{{ formationName }}</h3>
        <AbilityCard v-for="(ability, i) in abilities" :key="ability.name + i" :ability="ability" />
      </div>
    </Section>
    <Section v-if="army.spellLores && army.spellLores.length">
      <template #title>Spell Lores</template>
      <div v-for="lore in army.spellLores" :key="lore">
        <h3 class="section-subheader">{{ lore }}</h3>
        <AbilityCard
          v-for="(ability, i) in getLoreAbilities(lore)"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
    </Section>
    <Section v-if="army.prayerLores && army.prayerLores.length">
      <template #title>Prayer Lores</template>
      <div v-for="lore in army.prayerLores" :key="lore">
        <h3 class="section-subheader">{{ lore }}</h3>
        <AbilityCard
          v-for="(ability, i) in getLoreAbilities(lore)"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
    </Section>
    <Section v-if="army.manifestationLores && army.manifestationLores.length">
      <template #title>Manifestation Lores</template>
      <div v-for="lore in army.manifestationLores" :key="lore">
        <h3 class="section-subheader">{{ lore }}</h3>
        <AbilityCard
          v-for="(ability, i) in getLoreAbilities(lore)"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
    </Section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { loadLores } from '../army';
import type { Army } from '../common/ArmyData';
import AbilityCard from './AbilityCard.vue';
import Section from './Section.vue';

defineProps<{ army: Army | null }>();
const lores = ref<Map<string, any> | null>(null);
const loresLoading = ref(true);

onMounted(async () => {
  loresLoading.value = true;
  lores.value = await loadLores();
  loresLoading.value = false;
});

const getLoreAbilities = (loreName: string): any[] => {
  if (!lores.value) return [];
  return lores.value.get(loreName) || [];
};
</script>

<style scoped>
h3,
h2.section-header {
  text-align: left;
}
</style>
