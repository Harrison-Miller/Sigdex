<template>
  <div>
    <Section
      v-if="showAoRDetails"
      collapse-key="details"
    >
      <template #title>Details</template>
      <ul class="details-list">
        <li
          v-if="army.requiredGeneral.length"
          v-html="formatRequiredGeneral(army.requiredGeneral)"
        />
        <li
          v-if="army.mustBeGeneralIfIncluded.length"
          v-html="formatMustBeGeneralIfIncluded(army.mustBeGeneralIfIncluded)"
        />
      </ul>
    </Section>
    <Section
      v-if="army.battleTraits && army.battleTraits.length"
      collapse-key="battleTraits"
    >
      <template #title>Battle Traits</template>
      <AbilityCard
        v-for="(trait, i) in army.battleTraits"
        :key="trait.name + i"
        :ability="trait"
      />
    </Section>
    <Section
      v-if="army.formations && army.formations.size"
      collapse-key="formations"
    >
      <template #title>Formations</template>
      <div
        v-for="[formationName, abilities] in Array.from(army.formations.entries())"
        :key="formationName"
      >
        <h3 class="section-subheader">{{ formationName }}</h3>
        <AbilityCard
          v-for="(ability, i) in abilities"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
    </Section>
    <Section
      v-if="army.artifacts && army.artifacts.size"
      collapse-key="artifacts"
    >
      <template #title>Artifacts</template>
      <div
        v-for="[group, table] in Array.from(army.artifacts.entries())"
        :key="group"
      >
        <h3 class="section-subheader">{{ table.name }}</h3>
        <AbilityCard
          v-for="(enh, j) in table.enhancements"
          :key="enh.ability.name + j"
          :ability="enh.ability"
        />
      </div>
    </Section>
    <Section
      v-if="army.heroicTraits && army.heroicTraits.size"
      collapse-key="heroicTraits"
    >
      <template #title>Heroic Traits</template>
      <div
        v-for="[group, table] in Array.from(army.heroicTraits.entries())"
        :key="group"
      >
        <h3 class="section-subheader">{{ table.name }}</h3>
        <AbilityCard
          v-for="(enh, j) in table.enhancements"
          :key="enh.ability.name + j"
          :ability="enh.ability"
        />
      </div>
    </Section>
    <Section
      v-if="army.enhancements && army.enhancements.size"
      collapse-key="enhancements"
    >
      <template #title>Enhancements</template>
      <div
        v-for="[table, enhTable] in Array.from(army.enhancements.entries())"
        :key="table"
      >
        <h3 class="section-subheader">{{ enhTable.name }}</h3>
        <AbilityCard
          v-for="(enh, i) in enhTable.enhancements"
          :key="enh.ability.name + i"
          :ability="enh.ability"
        />
      </div>
    </Section>
    <!-- Spell Lores Dropdown -->
    <Section
      v-if="Array.from(army.spellLores.values()).length"
      collapse-key="spellLores"
    >
      <template #title>Spell Lores</template>
      <div v-if="Array.from(army.spellLores.values()).length === 1">
        <h3 class="section-subheader">
          {{ Array.from(army.spellLores.values())[0].name
          }}<span v-if="Array.from(army.spellLores.values())[0].points">
            ({{ Array.from(army.spellLores.values())[0].points }} pts)</span>
        </h3>
        <AbilityCard
          v-for="(ability, i) in Array.from(army.spellLores.values())[0].abilities"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
      <div v-else>
        <OptionSelect
          v-model="selectedSpellLore"
          :options="Array.from(army.spellLores.values()).map((lore) => lore.name)"
        />
        <div v-if="selectedSpellLore">
          <AbilityCard
            v-for="(ability, i) in army.spellLores.get(selectedSpellLore)?.abilities || []"
            :key="ability.name + i"
            :ability="ability"
          />
        </div>
      </div>
    </Section>
    <!-- Prayer Lores Dropdown -->
    <Section
      v-if="Array.from(army.prayerLores.values()).length"
      collapse-key="prayerLores"
    >
      <template #title>Prayer Lores</template>
      <div v-if="Array.from(army.prayerLores.values()).length === 1">
        <h3 class="section-subheader">
          {{ Array.from(army.prayerLores.values())[0].name
          }}<span v-if="Array.from(army.prayerLores.values())[0].points">
            ({{ Array.from(army.prayerLores.values())[0].points }} pts)</span>
        </h3>
        <AbilityCard
          v-for="(ability, i) in Array.from(army.prayerLores.values())[0].abilities"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
      <div v-else>
        <OptionSelect
          v-model="selectedPrayerLore"
          :options="Array.from(army.prayerLores.values()).map((lore) => lore.name)"
          class="lore-dropdown"
          placeholder="Select Prayer Lore"
        />
        <div v-if="selectedPrayerLore">
          <AbilityCard
            v-for="(ability, i) in army.prayerLores.get(selectedPrayerLore)?.abilities || []"
            :key="ability.name + i"
            :ability="ability"
          />
        </div>
      </div>
    </Section>
    <!-- Manifestation Lores Dropdown -->
    <Section
      v-if="Array.from(army.manifestationLores.values()).length"
      collapse-key="manifestationLores"
    >
      <template #title>Manifestation Lores</template>
      <div v-if="Array.from(army.manifestationLores.values()).length === 1">
        <h3 class="section-subheader">
          {{ Array.from(army.manifestationLores.values())[0].name
          }}<span v-if="Array.from(army.manifestationLores.values())[0].points">
            ({{ Array.from(army.manifestationLores.values())[0].points }} pts)</span>
        </h3>
        <AbilityCard
          v-for="(ability, i) in Array.from(army.manifestationLores.values())[0].abilities"
          :key="ability.name + i"
          :ability="ability"
        />
      </div>
      <div v-else>
        <OptionSelect
          v-model="selectedManifestationLore"
          :options="Array.from(army.manifestationLores.values()).map((lore) => lore.name)"
          class="lore-dropdown"
          placeholder="Select Manifestation Lore"
        />
        <div v-if="selectedManifestationLore">
          <AbilityCard
            v-for="(ability, i) in army.manifestationLores.get(selectedManifestationLore)
              ?.abilities || []"
            :key="ability.name + i"
            :ability="ability"
          />
        </div>
      </div>
    </Section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import OptionSelect from '../../core/components/OptionSelect.vue';
import type { Army } from '../../../parser/models/army';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import Section from '../../core/components/ContentSection.vue';

const props = defineProps<{ army: Army }>();

const showAoRDetails = computed(() => {
  return props.army.requiredGeneral.length > 0 || props.army.mustBeGeneralIfIncluded.length > 0;
});

function formatRequiredGeneral(requiredGeneral: string[]): string {
  if (requiredGeneral.length === 1) {
    return `<strong>${requiredGeneral[0]}</strong> must be your general.`;
  } else if (requiredGeneral.length > 1) {
    return `One of the following units must be your general: <strong>${requiredGeneral.join(', ')}</strong>`;
  }
  return '';
}

function formatMustBeGeneralIfIncluded(units: string[]): string {
  if (!units || units.length === 0) return '';
  if (units.length === 1) {
    return `<strong>${units[0]}</strong> must be general if included.`;
  } else {
    return `One of the following must be the general if included: <strong>${units.join(', ')}</strong>`;
  }
}

const selectedSpellLore = ref<string>('');
const selectedPrayerLore = ref<string>('');
const selectedManifestationLore = ref<string>('');

// Set default selected lore when army changes
watch(
  () => [props.army],
  () => {
    if (!selectedSpellLore.value && props.army.spellLores.size > 0) {
      selectedSpellLore.value = props.army.spellLores.values().next().value?.name || '';
    }
    if (!selectedPrayerLore.value && props.army.prayerLores.size > 0) {
      selectedPrayerLore.value = props.army.prayerLores.values().next().value?.name || '';
    }
    if (!selectedManifestationLore.value && props.army.manifestationLores.size > 0) {
      selectedManifestationLore.value =
        props.army.manifestationLores.values().next().value?.name || '';
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.details-list {
  margin: 0 0 1em 0;
  padding-left: 1.2em;
  list-style: disc inside;
}
.details-list strong {
  font-weight: bold;
}
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
