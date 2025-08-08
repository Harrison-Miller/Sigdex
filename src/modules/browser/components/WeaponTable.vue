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
        <tr
          v-for="w in props.weapons"
          :key="w.name"
        >
          <td>
            <div>{{ w.name }}</div>
            <div
              v-if="w.abilities && w.abilities.filter((a) => a && a !== '-').length"
              class="weapon-abilities"
            >
              <template
                v-for="(a, i) in w.abilities.filter((a) => a && a !== '-')"
                :key="i"
              >
                <PopOver placement="top">
                  <template #trigger>
                    <span class="weapon-ability-trigger" v-html="formatText(a)" />
                  </template>
                  <div class="weapon-ability-popover">
                    <h4 v-html="formatText(a)"></h4>
                    <p>{{ getAbilityDescription(a) }}</p>
                  </div>
                </PopOver>
                <span v-if="i < w.abilities.filter((a) => a && a !== '-').length - 1">, </span>
              </template>
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
<script setup lang="ts">
import { formatText } from '../../../utils/formatter';
import type { Weapon } from '../../../parser/models/weapon';
import PopOver from '../../shared/components/PopOver.vue';
import { useGame } from '../../shared/composables/useGame';

const props = defineProps<{
  weapons: Weapon[];
  shortHeaders?: boolean;
}>();

function displayRend(rend: string | undefined | null): string {
  return rend === '' || rend === undefined || rend === null || rend === '0' ? '-' : String(rend);
}

const hasRange = props.weapons.some((w) => w.range && w.range !== '');

const { game } = useGame();

function getAbilityDescription(abilityName: string): string {
  if (!game.value?.sharedAbilityDescriptions) return '';
  // Direct match
  const desc = game.value.sharedAbilityDescriptions.get(abilityName);
  if (desc) return desc;
  // Fallback for Anti-X (+1 Rend)
  if (abilityName.startsWith('Anti-')) {
    const antiDesc = game.value.sharedAbilityDescriptions.get('Anti-X (+1 Rend)');
    return antiDesc || '';
  }
  return '';
}
</script>
<style scoped>
.weapon-table-wrapper {
  margin-bottom: 1.5rem;
}

.weapon-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-head);
  color: var(--text-main);
}

.weapon-table th,
.weapon-table td {
  border: 1px solid var(--border-color);
  padding: 8px;
  text-align: left;
}

.weapon-table th {
  background: var(--bg-sub);
}

.weapon-abilities {
  font-size: 0.8em;
  color: var(--text-muted);
  margin-top: 2px;
}

.weapon-ability-trigger {
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s;
}

.weapon-ability-trigger:hover {
  color: var(--text-main);
}

.weapon-ability-popover h4 {
  margin: 0 0 0.5em 0;
  font-size: 1.2em;
  font-weight: 600;
  color: var(--text-main);
}

.weapon-ability-popover p {
  margin: 0;
  font-size: 1em;
  line-height: 1.4;
  color: var(--text-muted);
}
</style>
