<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const army = route.params.army as string;
// Mock unit names for demo
const units = [
  { name: 'Loonboss' },
  { name: 'Stabbas' },
  { name: 'Squig Herd' },
];
function selectUnit(unit: string) {
  router.push({ name: 'UnitDetail', params: { army, unit } });
}
</script>
<template>
  <div class="list-container">
    <h1>{{ army }}</h1>
    <h2>Units</h2>
    <ul>
      <li v-for="u in units" :key="u.name">
        <button class="button-standard" @click="selectUnit(u.name)">{{ u.name }}</button>
      </li>
    </ul>
  </div>
</template>
<style src="./list-shared.css" scoped></style>
