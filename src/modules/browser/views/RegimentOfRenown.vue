<template>
  <BackButton :size="36" />
  <div class="unit-detail">
    <h1 style="margin: 0">{{ regiment?.name }}</h1>
    <h1 style="margin: 0">
      <span v-if="regiment?.points ? regiment?.points > 0 : 0" class="points-badge"
        >{{ regiment?.points }} pts</span
      >
    </h1>
    <Section v-if="regiment?.abilities.length" collapseKey="abilities">
      <template #title>Abilities</template>
      <div class="abilities">
        <AbilityCard v-for="(a, i) in regiment.abilities" :key="a.name + i" :ability="a" />
      </div>
    </Section>
    <Section v-if="unitList.length" collapseKey="warscrolls">
      <template #title>Warscrolls</template>
      <ul class="unit-list">
        <li v-for="[unit, count] in unitList" :key="unit">
          <span>{{ count }} × {{ unit }}</span>
        </li>
      </ul>
      <div class="unit-list-btns">
        <ListButton
          v-for="[unit] in unitList"
          :key="unit"
          :label="unit"
          @click="() => goToUnit(unit)" />
      </div>
    </Section>
    <Section v-if="regiment?.allowedArmies.length" collapseKey="allowedArmies">
      <template #title>Armies</template>
      <div class="allowed-armies-intro">
        This Regiment of Renown can be included in the following armies:
      </div>
      <ul class="allowed-armies-list">
        <li v-for="army in regiment.allowedArmies" :key="army">{{ army }}</li>
      </ul>
    </Section>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import ListButton from '../../shared/components/ListButton.vue';
import Section from '../../core/components/Section.vue';
import BackButton from '../../core/components/BackButton.vue';
import { useGame } from '../../shared/composables/useGame';

const route = useRoute();
const router = useRouter();
const { game } = useGame();

const regimentName = computed(() => route.params.regiment as string);
const regiment = computed(() => game.value?.regimentsOfRenown.get(regimentName.value));

const unitList = computed(() => {
  if (!regiment.value) return [];
  return Array.from(regiment.value.units.entries()); // [unitName, count][]
});

function goToUnit(unit: string) {
  // Find the first non-AoR army that has a battleProfile with the given unit name
  if (!game.value) {
    router.push({ name: 'UnitDetail', params: { unit } });
    return;
  }
  // Build a set of all main army names (not AoR)
  const mainArmyNames = new Set<string>();
  for (const armyList of game.value.armyList.values()) {
    for (const item of armyList) {
      mainArmyNames.add(item.name);
    }
  }
  let foundArmy: string | undefined = undefined;
  for (const [armyName, army] of game.value.armies.entries()) {
    if (!mainArmyNames.has(armyName)) continue;
    if (army.battleProfiles && army.battleProfiles.has(unit)) {
      foundArmy = armyName;
      break;
    }
  }
  router.push({ name: 'UnitDetail', params: { unit, army: foundArmy } });
}
</script>
<style scoped>
.points-badge {
  display: inline-block;
  background: #8b0000;
  color: #f3f4f6;
  font-weight: 600;
  font-size: 0.65em;
  border-radius: 12px;
  padding: 0.12em 0.5em;
  margin-left: 0.7em;
  vertical-align: middle;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
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
