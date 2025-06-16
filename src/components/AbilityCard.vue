<script setup lang="ts">
const props = defineProps<{
  ability: {
    timing: string;
    color: string;
    type: string;
    text: string;
    keywords: string[];
  }
}>();
const icons = {
  offensive: '⚔️', defensive: '🛡️', movement: '🏃', special: '✨', damage: '💥',
  shooting: '🏹', rallying: '📯', control: '🎯'
};
function getAbilityIcon(type: string) {
  return icons[type.toLowerCase()] || '✨';
}
</script>
<template>
  <div class="card">
    <div class="card-header" :class="props.ability.color.toLowerCase()">
      <span class="icon">{{ getAbilityIcon(props.ability.type) }}</span>
      <span class="timing">{{ props.ability.timing }}</span>
    </div>
    <div class="card-title">{{ props.ability.type }}</div>
    <div class="card-body">
      <div class="card-text">{{ props.ability.text }}</div>
      <div class="ability-keywords">{{ props.ability.keywords.join(', ') }}</div>
    </div>
  </div>
</template>
<style src="./AbilityCard.css" scoped></style>
