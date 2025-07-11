<script setup lang="ts">
import { formatText } from '../../../utils/formatter';
import type { Weapon } from '../../../parser/models/weapon';
const props = defineProps<{
  weapons: Weapon[];
  shortHeaders?: boolean;
}>();

function displayRend(rend: string | undefined | null): string {
  return rend === '' || rend === undefined || rend === null || rend === '0' ? '-' : String(rend);
}

const hasRange = props.weapons.some((w) => w.range && w.range !== '');
</script>
<template>
  <div class="weapon-table-wrapper">
    <table class="weapon-table">
      <thead>
        <tr>
          <th>Name</th>
          <th v-if="hasRange">{{ props.shortHeaders ? 'Rng' : 'Range' }}</th>
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
            <div
              v-if="w.abilities && w.abilities.filter((a) => a && a !== '-').length"
              class="weapon-abilities"
            >
              <span v-for="(a, i) in w.abilities.filter((a) => a && a !== '-')" :key="i">
                <span v-html="formatText(a)"></span>
                <span v-if="i < w.abilities.filter((a) => a && a !== '-').length - 1">, </span>
              </span>
            </div>
          </td>
          <td v-if="hasRange">{{ w.range || '-' }}</td>
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

.weapon-table th,
.weapon-table td {
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
