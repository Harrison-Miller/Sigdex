<script setup lang="ts">
const props = defineProps<{
  weapons: Array<{
    name: string;
    attacks: string;
    hit: string;
    wound: string;
    rend: string;
    damage: string;
  }>,
}>();
</script>
<template>
  <div class="weapon-table-wrapper">
    <table class="weapon-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Attacks</th>
          <th>Hit</th>
          <th>Wound</th>
          <th>Rend</th>
          <th>Damage</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="w in props.weapons" :key="w.name">
          <td>{{ w.name }}</td>
          <td>{{ w.attacks }}</td>
          <td>{{ w.hit }}</td>
          <td>{{ w.wound }}</td>
          <td>{{ w.rend }}</td>
          <td>{{ w.damage }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped>
.weapon-table-wrapper {
  margin-bottom: 1.5rem;
}
.weapon-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  color: #222;
}
.weapon-table th, .weapon-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
.weapon-table th {
  background: #f7f7f7;
}
</style>
