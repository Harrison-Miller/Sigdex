<script setup lang="ts">
const props = defineProps<{
  weapons: Array<{
    name: string;
    abilities: string[];
    attacks: string;
    hit: string;
    wound: string;
    rend: string;
    damage: string;
  }>,
  shortHeaders?: boolean;
}>();

function displayRend(rend: string) {
  if (!rend || rend === '-' || rend === '0') return rend;
  if (rend.startsWith('-')) return rend;
  return '-' + rend;
}
</script>
<template>
  <div class="weapon-table-wrapper">
    <table class="weapon-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>{{ props.shortHeaders ? 'A' : 'Attacks' }}</th>
          <th>{{ props.shortHeaders ? 'Hit' : 'Hit' }}</th>
          <th>{{ props.shortHeaders ? 'W' : 'Wound' }}</th>
          <th>{{ props.shortHeaders ? 'R' : 'Rend' }}</th>
          <th>{{ props.shortHeaders ? 'D' : 'Damage' }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="w in props.weapons" :key="w.name">
          <td>
            <div>{{ w.name }}</div>
            <div v-if="w.abilities && w.abilities.length" class="weapon-abilities">
              <span v-for="(a, i) in w.abilities" :key="i">{{ a }}<span v-if="i < w.abilities.length - 1">, </span></span>
            </div>
          </td>
          <td>{{ w.attacks }}</td>
          <td>{{ w.hit }}</td>
          <td>{{ w.wound }}</td>
          <td>{{ displayRend(w.rend) }}</td>
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
.weapon-abilities {
  font-size: 0.8em;
  color: #888;
  margin-top: 2px;
}
</style>
