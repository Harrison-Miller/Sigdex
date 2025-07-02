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
    <Section v-if="army.artifacts && army.artifacts.size">
      <template #title>Artifacts</template>
      <div v-for="[group, abilities] in Array.from(army.artifacts.entries())" :key="group">
        <h3 class="section-subheader">{{ group }}</h3>
        <AbilityCard
          v-for="(artifact, j) in abilities"
          :key="artifact.name + j"
          :ability="artifact"
        />
      </div>
    </Section>
    <Section v-if="army.heroicTraits && army.heroicTraits.size">
      <template #title>Heroic Traits</template>
      <div v-for="[group, abilities] in Array.from(army.heroicTraits.entries())" :key="group">
        <h3 class="section-subheader">{{ group }}</h3>
        <AbilityCard v-for="(trait, j) in abilities" :key="trait.name + j" :ability="trait" />
      </div>
    </Section>
    <Section v-if="army.enhancementTables && army.enhancementTables.size">
      <template #title>Enhancements</template>
      <div v-for="[table, abilities] in Array.from(army.enhancementTables.entries())" :key="table">
        <h3 class="section-subheader">{{ table }}</h3>
        <AbilityCard v-for="(ability, i) in abilities" :key="ability.name + i" :ability="ability" />
      </div>
    </Section>
    <!-- Spell Lores Dropdown -->
    <Section v-if="army.spellLores && army.spellLores.length">
      <template #title>Spell Lores</template>
      <div v-if="army.spellLores.length === 1">
        <h3 class="section-subheader">
          {{ army.spellLores[0].name
          }}<span v-if="army.spellLores[0].points"> ({{ army.spellLores[0].points }} pts)</span>
        </h3>
        <AbilityCard
          v-for="(ability, i) in getLoreAbilities(army.spellLores[0].name)"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
      <div v-else>
        <select v-model="selectedSpellLore" class="lore-dropdown">
          <option v-for="lore in army.spellLores" :key="lore.name" :value="lore.name">
            {{ lore.name }}<span v-if="lore.points"> ({{ lore.points }} pts)</span>
          </option>
        </select>
        <div v-if="selectedSpellLore">
          <AbilityCard
            v-for="(ability, i) in getLoreAbilities(selectedSpellLore)"
            :key="ability.name + i"
            :ability="ability"
          />
        </div>
      </div>
    </Section>
    <!-- Prayer Lores Dropdown -->
    <Section v-if="army.prayerLores && army.prayerLores.length">
      <template #title>Prayer Lores</template>
      <div v-if="army.prayerLores.length === 1">
        <h3 class="section-subheader">
          {{ army.prayerLores[0].name
          }}<span v-if="army.prayerLores[0].points"> ({{ army.prayerLores[0].points }} pts)</span>
        </h3>
        <AbilityCard
          v-for="(ability, i) in getLoreAbilities(army.prayerLores[0].name)"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
      <div v-else>
        <select v-model="selectedPrayerLore" class="lore-dropdown">
          <option v-for="lore in army.prayerLores" :key="lore.name" :value="lore.name">
            {{ lore.name }}<span v-if="lore.points"> ({{ lore.points }} pts)</span>
          </option>
        </select>
        <div v-if="selectedPrayerLore">
          <AbilityCard
            v-for="(ability, i) in getLoreAbilities(selectedPrayerLore)"
            :key="ability.name + i"
            :ability="ability"
          />
        </div>
      </div>
    </Section>
    <!-- Manifestation Lores Dropdown -->
    <Section v-if="army.manifestationLores && army.manifestationLores.length">
      <template #title>Manifestation Lores</template>
      <div v-if="army.manifestationLores.length === 1">
        <h3 class="section-subheader">
          {{ army.manifestationLores[0].name
          }}<span v-if="army.manifestationLores[0].points">
            ({{ army.manifestationLores[0].points }} pts)</span
          >
        </h3>
        <AbilityCard
          v-for="(ability, i) in getLoreAbilities(army.manifestationLores[0].name)"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
      <div v-else>
        <select v-model="selectedManifestationLore" class="lore-dropdown">
          <option v-for="lore in army.manifestationLores" :key="lore.name" :value="lore.name">
            {{ lore.name }}<span v-if="lore.points"> ({{ lore.points }} pts)</span>
          </option>
        </select>
        <div v-if="selectedManifestationLore">
          <AbilityCard
            v-for="(ability, i) in getLoreAbilities(selectedManifestationLore)"
            :key="ability.name + i"
            :ability="ability"
          />
        </div>
      </div>
    </Section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { loadLores } from '../../../army';
import type { Army } from '../../../common/ArmyData';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import Section from '../../core/components/Section.vue';

const props = defineProps<{ army: Army | null }>();
const lores = ref<Map<string, any> | null>(null);
const loresLoading = ref(true);

const selectedSpellLore = ref<string | null>(null);
const selectedPrayerLore = ref<string | null>(null);
const selectedManifestationLore = ref<string | null>(null);

onMounted(async () => {
  loresLoading.value = true;
  lores.value = await loadLores();
  loresLoading.value = false;
});

// Set default selected lore when army changes or lores load
watch(
  () => [props.army, loresLoading.value, lores.value],
  () => {
    if (props.army?.spellLores?.length && !selectedSpellLore.value) {
      selectedSpellLore.value = props.army.spellLores[0].name;
    }
    if (props.army?.prayerLores?.length && !selectedPrayerLore.value) {
      selectedPrayerLore.value = props.army.prayerLores[0].name;
    }
    if (props.army?.manifestationLores?.length && !selectedManifestationLore.value) {
      selectedManifestationLore.value = props.army.manifestationLores[0].name;
    }
  },
  { immediate: true }
);

const getLoreAbilities = (loreName: string): any[] => {
  if (!lores.value) return [];
  const lore = lores.value.get(loreName);
  return lore?.abilities || [];
};
</script>

<style scoped>
.lore-dropdown {
  margin-bottom: 1em;
  font-size: 1.1em;
  padding: 0.4em 1em;
  border-radius: 4px;
  border: 1.5px solid #222;
  background: #f9f9f9;
}
.section-subheader {
  text-align: left;
}
</style>
