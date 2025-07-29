<template>
  <BackButton :size="36" />
  <div class="floating-header-buttons">
    <button
      class="favorite-icon"
      :class="{ active: isFavorited }"
      @click.stop="toggleFavorite"
    >
      <FontAwesomeIcon icon="star" />
    </button>
  </div>
  <div class="unit-detail">
    <h1 style="margin: 0" class="fancy-text">{{ regiment?.name }}</h1>
    <PointsBadge big :points="regiment?.points" />
    <Section
      v-if="regiment?.abilities.length"
      collapse-key="abilities"
    >
      <template #title>Abilities</template>
      <div class="abilities">
        <AbilityCard
          v-for="(a, i) in regiment.abilities"
          :key="a.name + i"
          :ability="a"
        />
      </div>
    </Section>
    <Section
      v-if="unitList.length"
      collapse-key="warscrolls"
    >
      <template #title>Warscrolls</template>
      <ul class="unit-list">
        <li
          v-for="[unit, count] in unitList"
          :key="unit"
        >
          <span>{{ count }} × {{ unit }}</span>
        </li>
      </ul>
      <div class="unit-list-btns">
        <ListButton
          v-for="[unit] in unitList"
          :key="unit"
          :label="unit"
          @click="() => goToUnit(unit)"
        />
      </div>
    </Section>
    <Section
      v-if="regiment?.allowedArmies.length"
      collapse-key="allowedArmies"
    >
      <template #title>Armies</template>
      <div class="allowed-armies-intro">
        This Regiment of Renown can be included in the following armies:
      </div>
      <ul class="allowed-armies-list">
        <li
          v-for="army in regiment.allowedArmies"
          :key="army"
        >
          {{ army }}
        </li>
      </ul>
    </Section>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import ListButton from '../../shared/components/ListButton.vue';
import Section from '../../core/components/ContentSection.vue';
import BackButton from '../../core/components/BackButton.vue';
import { useGame } from '../../shared/composables/useGame';
import PointsBadge from '../../shared/components/badges/PointsBadge.vue';
import { useFavorite } from '../../core/composables/useFavorite';

const route = useRoute();
const router = useRouter();
const { game } = useGame();

const regimentName = computed(() => route.params.regimentName as string);
const regiment = computed(() => game.value?.regimentsOfRenown.get(regimentName.value));

const unitList = computed(() => {
  if (!regiment.value) return [];
  return Array.from(regiment.value.units.entries()); // [unitName, count][]
});

const { isFavorited, toggleFavorite } = useFavorite('army', regimentName.value);

function goToUnit(unit: string) {
  router.push({ name: 'UnitDetail', params: { unitName: unit, armyName: 'UniversalUnits' } });
}
</script>
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
.abilities {
  margin-bottom: 1em;
}
.unit-list {
  margin-bottom: 1em;
  padding: 0;
  list-style: disc inside;
  text-align: left;
}
.unit-list-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7em;
}
.allowed-armies-intro {
  margin-bottom: 0.7em;
}
.allowed-armies-list {
  padding: 0;
  list-style: disc inside;
  margin: 0;
  text-align: left;
}
</style>

