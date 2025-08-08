<script setup lang="ts">
import { formatText } from '../../../utils/formatter';
import { computed } from 'vue';
import { useGame } from '../composables/useGame';
import PopOver from './PopOver.vue';
import AbilityCard from './AbilityCard.vue';
const props = defineProps<{ keywords?: string[] | null }>();

import type { Ability } from '../../../parser/models/ability';
const { game } = useGame();


const keywordAbilityMap = computed(() => {
  const map: Record<string, Ability | null> = {};
  if (!props.keywords || !game.value?.keywordAbilities) return map;
  for (const kw of props.keywords) {
    if (!kw) { map[kw] = null; continue; }
    // First try exact match (case-insensitive)
    let found: Ability | null = null;
    for (const [key, ability] of game.value.keywordAbilities.entries()) {
      if (key.toLowerCase() === kw.toLowerCase()) {
        found = ability;
        break;
      }
    }
    // If not found, try partial match (case-insensitive, includes)
    if (!found) {
      for (const [key, ability] of game.value.keywordAbilities.entries()) {
        if (key.toLowerCase() && kw.toLowerCase() && key.toLowerCase().includes(kw.toLowerCase())) {
          found = ability;
          break;
        }
      }
    }
    // Special case: if the keyword starts with 'ward', use 'ward save' ability
    if (!found && kw.trim().toLowerCase().startsWith('ward')) {
      const wardAbility = game.value.keywordAbilities.get('ward save') ||
        // fallback: case-insensitive search for 'ward save'
        Array.from(game.value.keywordAbilities.entries()).find(([k]) => k.toLowerCase() === 'ward save')?.[1];
      if (wardAbility) found = wardAbility;
    }
    map[kw] = found;
  }
  return map;
});
</script>
<template>
  <div
    v-if="props.keywords && props.keywords.length"
    class="keywords-bar"
  >
    <span
      v-for="kw in props.keywords"
      :key="kw"
      class="keyword"
    >
      <template v-if="keywordAbilityMap[kw]">
        <PopOver>
          <template #trigger>
            <span class="keyword-ability-underline">{{ kw }}</span>
          </template>
          <AbilityCard :ability="keywordAbilityMap[kw]" />
        </PopOver>
      </template>
      <template v-else>
        <span v-html="formatText(kw)" />
      </template>
      <img v-if="kw.toLowerCase() === 'champion'" src="/assets/icons/wreath-laurel-solid.svg" alt="Champion" class="champion-icon" />
    </span>
  </div>
</template>
<style scoped>
.keywords-bar {
  background: var(--bg-head);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  /* color: var(--color-white); */
  margin-top: 0.5rem;
  display: inline-block;
  border: 1.5px solid var(--border-color);
}

.keyword {
  background: var(--bg-selected);
  border-radius: 4px;
  padding: 0.1em 0.5em;
  font-weight: 500;
  margin-right: 0.3em;
  margin-bottom: 0.3em;
  white-space: nowrap;
  display: inline-block;

  /* For popover underline */
}

.keyword-ability-underline {
  text-decoration: underline dotted;
  cursor: pointer;
  text-underline-offset: 2px;
  color: var(--accent-color, #3b82f6);
}

.champion-icon {
  height: 1.2em;
  margin-left: 0.4em;
  vertical-align: middle;
  /* default: no filter */
}
.dark .champion-icon {
  filter: invert(1) brightness(1.6);
}
</style>
