<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import AbilityCard from '../components/AbilityCard.vue';
import StatCircle from '../components/StatCircle.vue';
import KeywordsBar from '../components/KeywordsBar.vue';
import WeaponTable from '../components/WeaponTable.vue';
import FavoriteToggle from '../components/FavoriteToggle.vue';
import BackButton from '../components/BackButton.vue';
import { isFavorite, saveFavorite, removeFavorite, getFavorites } from '../favorites';
import { ref } from 'vue';

const route = useRoute();
const router = useRouter();
const unitName = route.params.unit as string;
// Mock unit data
const unit = {
  name: unitName,
  stats: { move: '5"', health: 5, save: '4+', control: 2 },
  melee_weapons: [
    { name: 'Moon-slicer', abilities: [], attacks: '5', hit: '4+', wound: '4+', rend: '1', damage: 'D3' },
  ],
  ranged_weapons: [
    { name: 'Spore Lobba', abilities: [], attacks: '1', hit: '5+', wound: '3+', rend: '0', damage: 'D3' },
  ],
  abilities: [
    {
      timing: 'Your Hero Phase',
      color: 'yellow',
      type: 'Special',
      text: 'Roll a dice. On a 2+, pick one of the following effects...',
      keywords: [],
    },
    {
      timing: 'Reaction: Fight',
      color: 'red',
      type: 'Offensive',
      text: 'Pick a friendly non-Hero Moonclan Infantry unit...',
      keywords: ["Cool"],
    },
  ],
  keywords: ['HERO', 'MOONCLAN', 'INFANTRY'],
};

const unitFavorite = ref(isFavorite('unit', unitName));
function toggleUnitFavoriteDetail(fav: boolean) {
  unitFavorite.value = fav;
  if (fav) {
    saveFavorite('unit', unitName);
  } else {
    removeFavorite('unit', unitName);
  }
}
const favoriteToggleSize = 36;
function goBack() {
  router.back();
}
</script>
<template>
  <div class="unit-detail">
    <div class="unit-detail-header">
      <BackButton :size="36" class="unit-detail-back" />
      <div class="unit-detail-fav">
        <FavoriteToggle
          :model-value="unitFavorite"
          @update:modelValue="toggleUnitFavoriteDetail"
          :size="favoriteToggleSize"
          no-text
        />
      </div>
      <h1>{{ unit.name }}</h1>
    </div>
    <div class="stats-row">
      <StatCircle :value="unit.stats.move" label="Move" />
      <StatCircle :value="unit.stats.health" label="Health" />
      <StatCircle :value="unit.stats.control ?? unit.stats.banishment" :label="unit.stats.control !== undefined ? 'Control' : 'Banishment'" />
      <StatCircle :value="unit.stats.save" label="Save" />
    </div>
    <div class="section-divider"></div>
    <h2 class="section-title">Melee Weapons</h2>
    <WeaponTable :weapons="unit.melee_weapons" />
    <div class="section-divider"></div>
    <h2 class="section-title">Ranged Weapons</h2>
    <WeaponTable :weapons="unit.ranged_weapons" />
    <div class="section-divider"></div>
    <h2 class="section-title">Abilities</h2>
    <div class="abilities">
      <AbilityCard
        v-for="(a, i) in unit.abilities"
        :key="i"
        :ability="a"
      />
    </div>
    <div class="section-divider"></div>
    <h2 class="section-title">Keywords</h2>
    <KeywordsBar :keywords="unit.keywords" />
  </div>
</template>
<style src="./unit-detail.css" scoped></style>
<style scoped>
.unit-detail-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  position: relative;
}
.unit-detail-fav {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
}
.unit-detail-back {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.unit-detail-back:hover {
  background: #e5e5e5;
}
.unit-detail-header h1 {
  margin-top: 2.2rem;
}
</style>
