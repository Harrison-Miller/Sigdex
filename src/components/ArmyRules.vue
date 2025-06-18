<template>
  <div v-if="loresLoading || !army">Loading rules...</div>
  <div v-else>
    <!-- 1. Battle Traits -->
    <div v-if="army.battleTraits && army.battleTraits.length">
      <div class="section-divider"></div>
      <h2 class="section-header">Battle Traits</h2>
      <AbilityCard v-for="(trait, i) in army.battleTraits" :key="trait.name + i" :ability="trait" />
    </div>
    <!-- 2. Formations -->
    <div v-if="army.formations && army.formations.size">
      <div class="section-divider"></div>
      <h2 class="section-header">Formations</h2>
      <div
        v-for="[formationName, abilities] in Array.from(army.formations.entries())"
        :key="formationName"
      >
        <h3 class="section-subheader">{{ formationName }}</h3>
        <AbilityCard v-for="(ability, i) in abilities" :key="ability.name + i" :ability="ability" />
      </div>
    </div>
    <!-- 3. Spell Lores -->
    <div v-if="army.spellLores && army.spellLores.length">
      <div class="section-divider"></div>
      <h2 class="section-header">Spell Lores</h2>
      <div v-for="lore in army.spellLores" :key="lore">
        <h3 class="section-subheader">{{ lore }}</h3>
        <AbilityCard
          v-for="(ability, i) in getLoreAbilities(lore)"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
    </div>
    <!-- 4. Prayer Lores -->
    <div v-if="army.prayerLores && army.prayerLores.length">
      <div class="section-divider"></div>
      <h2 class="section-header">Prayer Lores</h2>
      <div v-for="lore in army.prayerLores" :key="lore">
        <h3 class="section-subheader">{{ lore }}</h3>
        <AbilityCard
          v-for="(ability, i) in getLoreAbilities(lore)"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
    </div>
    <!-- 5. Manifestation Lores -->
    <div v-if="army.manifestationLores && army.manifestationLores.length">
      <div class="section-divider"></div>
      <h2 class="section-header">Manifestation Lores</h2>
      <div v-for="lore in army.manifestationLores" :key="lore">
        <h3 class="section-subheader">{{ lore }}</h3>
        <AbilityCard
          v-for="(ability, i) in getLoreAbilities(lore)"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { loadLores } from '../army';
import type { Army } from '../common/ArmyData';
import AbilityCard from './AbilityCard.vue';

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
