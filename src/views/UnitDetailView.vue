<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AbilityCard from '../components/AbilityCard.vue';
import StatCircle from '../components/StatCircle.vue';
import KeywordsBar from '../components/KeywordsBar.vue';
import WeaponTable from '../components/WeaponTable.vue';
import FavoriteToggle from '../components/FavoriteToggle.vue';
import BackButton from '../components/BackButton.vue';
import { isFavorite, saveFavorite, removeFavorite } from '../favorites';
import { loadArmy } from '../army';
import { MOCK_UNIT } from '../army';

// Accept unit and army as props for detail view
const props = defineProps<{ unit?: any; army?: string }>();
const route = useRoute();

const unitPropIsObject = typeof props.unit === 'object' && props.unit !== null;
let unitName = unitPropIsObject ? props.unit.name : (props.unit ?? route?.params?.unit as string | undefined);
let armyName = props.army ?? (route?.params?.army as string | undefined);

const unit = ref(unitPropIsObject ? props.unit : null);

onMounted(async () => {
  if (!unit.value && armyName && unitName) {
    try {
      const armyData = await loadArmy(armyName);
      unit.value = armyData.units.find(u => u.name === unitName) ?? MOCK_UNIT;
    } catch (e) {
      unit.value = MOCK_UNIT;
    }
  }
});

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

console.log('UnitDetailView: route params', { armyName, unitName });
console.log('UnitDetailView: loaded unit', unit.value);
</script>
<template>
  <div v-if="unit && unit.stats" class="unit-detail">
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
      <StatCircle
        :value="unit.stats.control !== undefined ? unit.stats.control : (unit.stats.banishment !== undefined ? unit.stats.banishment : '-')"
        :label="unit.stats.control !== undefined ? 'Control' : (unit.stats.banishment !== undefined ? 'Banishment' : 'Control')"
      />
      <StatCircle :value="unit.stats.save" label="Save" />
    </div>
    <div v-if="unit.melee_weapons && unit.melee_weapons.length" class="section-divider"></div>
    <h2 v-if="unit.melee_weapons && unit.melee_weapons.length" class="section-title">Melee Weapons</h2>
    <WeaponTable v-if="unit.melee_weapons && unit.melee_weapons.length" :weapons="unit.melee_weapons" short-headers />
    <div v-if="unit.ranged_weapons && unit.ranged_weapons.length" class="section-divider"></div>
    <h2 v-if="unit.ranged_weapons && unit.ranged_weapons.length" class="section-title">Ranged Weapons</h2>
    <WeaponTable v-if="unit.ranged_weapons && unit.ranged_weapons.length" :weapons="unit.ranged_weapons" short-headers />
    <div v-if="unit.abilities && unit.abilities.length" class="section-divider"></div>
    <h2 v-if="unit.abilities && unit.abilities.length" class="section-title">Abilities</h2>
    <div v-if="unit.abilities && unit.abilities.length" class="abilities">
      <AbilityCard
        v-for="(a, i) in unit.abilities"
        :key="i"
        :ability="a"
      />
    </div>
    <div v-if="unit.keywords && unit.keywords.length" class="section-divider"></div>
    <h2 v-if="unit.keywords && unit.keywords.length" class="section-title">Keywords</h2>
    <KeywordsBar v-if="unit.keywords && unit.keywords.length" :keywords="unit.keywords" />
  </div>
  <div v-else>
    <p style="color: red;">Unit data is missing or incomplete.</p>
    <pre>{{ unit }}</pre>
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
  text-align: center;
  width: 100%;
}
</style>
