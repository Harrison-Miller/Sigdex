<script setup lang="ts">
import { useRoute } from 'vue-router';
import AbilityCard from '../components/AbilityCard.vue';
import StatCircle from '../components/StatCircle.vue';
const route = useRoute();
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
      keywords: ['Hero', 'Moonclan'],
    },
    {
      timing: 'Reaction: Fight',
      color: 'red',
      type: 'Offensive',
      text: 'Pick a friendly non-Hero Moonclan Infantry unit...',
      keywords: ['Infantry'],
    },
  ],
  keywords: ['HERO', 'MOONCLAN', 'INFANTRY'],
};
</script>
<template>
  <div class="unit-detail">
    <h1>{{ unit.name }}</h1>
    <div class="stats-row">
      <StatCircle :value="unit.stats.move" label="Move" />
      <StatCircle :value="unit.stats.health" label="Health" />
      <StatCircle :value="unit.stats.control ?? unit.stats.banishment" :label="unit.stats.control !== undefined ? 'Control' : 'Banishment'" />
      <StatCircle :value="unit.stats.save" label="Save" />
    </div>
    <h2>Melee Weapons</h2>
    <table class="weapon-table">
      <thead><tr><th>Name</th><th>Attacks</th><th>Hit</th><th>Wound</th><th>Rend</th><th>Damage</th></tr></thead>
      <tbody>
        <tr v-for="w in unit.melee_weapons" :key="w.name">
          <td>{{ w.name }}</td><td>{{ w.attacks }}</td><td>{{ w.hit }}</td><td>{{ w.wound }}</td><td>{{ w.rend }}</td><td>{{ w.damage }}</td>
        </tr>
      </tbody>
    </table>
    <h2>Ranged Weapons</h2>
    <table class="weapon-table">
      <thead><tr><th>Name</th><th>Attacks</th><th>Hit</th><th>Wound</th><th>Rend</th><th>Damage</th></tr></thead>
      <tbody>
        <tr v-for="w in unit.ranged_weapons" :key="w.name">
          <td>{{ w.name }}</td><td>{{ w.attacks }}</td><td>{{ w.hit }}</td><td>{{ w.wound }}</td><td>{{ w.rend }}</td><td>{{ w.damage }}</td>
        </tr>
      </tbody>
    </table>
    <h2>Abilities</h2>
    <div class="abilities">
      <AbilityCard
        v-for="(a, i) in unit.abilities"
        :key="i"
        :ability="a"
      />
    </div>
    <h2>Keywords</h2>
    <div class="keywords-card">{{ unit.keywords.join(', ') }}</div>
  </div>
</template>
<style src="./unit-detail.css" scoped></style>
