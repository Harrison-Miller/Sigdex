<script setup lang="ts">
import { computed } from 'vue';
import { useUniversalManifestationLore } from '../../shared/composables/useGame';
import ListButton from '../../shared/components/ListButton.vue';
import Section from '../../core/components/ContentSection.vue';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import PointsBadge from '../../shared/components/badges/PointsBadge.vue';
import FavoritesToggle from '../../shared/components/FavoritesToggle.vue';

const props = defineProps<{ loreName: string }>();

const { lore } = useUniversalManifestationLore(props.loreName);
const units = computed(() => {
  return lore.value.abilities.flatMap((ability) => ability.summonedUnits);
});
</script>
<template>
  <FavoritesToggle
    type="army"
    :name="lore.name"
  />
  <div class="list-container">
    <h1 style="margin: 0" class="fancy-text">
      {{ loreName }}
    </h1>
    <PointsBadge big :points="lore.points" />
    <Section collapse-key="warscrolls">
      <template #title>Warscrolls</template>
      <ul>
        <li
          v-for="name in units"
          :key="name"
        >
          <router-link
            v-slot="{ navigate, href }"
            :to="{
              name: 'UnitDetail',
              params: { armyName: 'UniversalUnits', unitName: name },
            }"
            custom
          >
            <ListButton
              :label="name"
              :points="0"
              :href="href"
              @click="navigate"
            />
          </router-link>
        </li>
      </ul>
    </Section>
    <Section collapse-key="lore">
      <template #title>Lore</template>
      <AbilityCard
        v-for="(ability, i) in lore.abilities"
        :key="ability.name + i"
        :ability="ability"
      />
    </Section>
  </div>
</template>
<style src="../../home/views/list-shared.css" scoped></style>
<style scoped>
.error {
  color: var(--color-red);
  margin-top: 1em;
  font-weight: 500;
}
</style>
