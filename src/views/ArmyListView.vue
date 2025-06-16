<script setup lang="ts">
import { useRouter } from 'vue-router';
import { armyList } from '../loader';
const router = useRouter();
function selectArmy(army: string) {
  router.push({ name: 'UnitList', params: { army } });
}
</script>
<template>
  <div class="list-container">
    <h1>Select an Army</h1>
    <ul>
      <li v-for="army in armyList" :key="army">
        <button class="button-standard" @click="selectArmy(army)">{{ army }}</button>
      </li>
    </ul>
  </div>
</template>
<style src="./list-shared.css" scoped></style>
