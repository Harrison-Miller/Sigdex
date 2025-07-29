<script setup lang="ts">
import { computed } from 'vue';
import { useUniversalManifestationLore } from '../../shared/composables/useGame';
import ListButton from '../../shared/components/ListButton.vue';
import BackButton from '../../core/components/BackButton.vue';
import Section from '../../core/components/ContentSection.vue';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import PointsBadge from '../../shared/components/badges/PointsBadge.vue';
import { useFavorite } from '../../core/composables/useFavorite';

const props = defineProps<{ loreName: string }>();

const { isFavorited, toggleFavorite } = useFavorite('army', props.loreName);

const { lore } = useUniversalManifestationLore(props.loreName);
const units = computed(() => {
  return lore.value.abilities.flatMap((ability) => ability.summonedUnits);
});
</script>
<template>
  <BackButton
    :size="36"
    class="unit-list-back"
  />
  <div class="floating-header-buttons">
    <button
      class="favorite-icon"
      :class="{ active: isFavorited }"
      @click.stop="toggleFavorite"
    >
      <FontAwesomeIcon icon="star" />
    </button>
  </div>
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
.floating-header-buttons {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  padding: 1.2em 0.3em 0 0;
}

.favorite-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
}

.favorite-icon.active svg {
  color: var(--color-yellow);
}
.favorite-icon svg {
  color: #aaa;
  font-size: 2em;
}
.unit-list-back {
  margin-bottom: 0.5rem;
}
.error {
  color: var(--color-red);
  margin-top: 1em;
  font-weight: 500;
}
</style>
