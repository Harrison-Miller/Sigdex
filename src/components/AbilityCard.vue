<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import KeywordsBar from './KeywordsBar.vue';
const props = defineProps<{
  ability: {
    timing: string;
    color: string;
    type: string;
    text: string;
    keywords: string[];
  }
}>();
// Map ability types to Font Awesome icon names
const iconMap: Record<string, string> = {
  offensive: 'fist-raised',
  defensive: 'shield-alt',
  movement: 'running',
  special: 'star',
  damage: 'bolt',
  shooting: 'crosshairs',
  rallying: 'bullhorn',
  control: 'bullseye',
};
function getAbilityIcon(type: string) {
  return iconMap[type.toLowerCase()] || 'star';
}
</script>
<template>
  <div class="card ability-card">
    <div class="card-header ability-header" :class="props.ability.color.toLowerCase()">
      <span class="icon">
        <font-awesome-icon :icon="getAbilityIcon(props.ability.type)" />
      </span>
      <span class="timing">{{ props.ability.timing }}</span>
    </div>
    <div class="card-title ability-title">{{ props.ability.type }}</div>
    <div class="card-body">
      <div class="card-text ability-text">{{ props.ability.text }}</div>
      <KeywordsBar :keywords="props.ability.keywords" />
    </div>
  </div>
</template>
<style src="./AbilityCard.css" scoped></style>
