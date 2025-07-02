<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import KeywordsBar from './KeywordsBar.vue';
import { formatText } from '../../../utils/formatter';
const props = defineProps<{
  ability: {
    timing: string;
    color: string;
    type: string;
    text: string;
    keywords: string[];
    name: string;
    declare?: string;
    castingValue?: string;
    chantingValue?: string;
    cost?: string;
    points?: number;
  };
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
  if (!type) return 'star'; // Default icon if type is not provided
  return iconMap[type.toLowerCase()] || 'star';
}
</script>
<template>
  <div class="card ability-card">
    <div v-if="props.ability.castingValue" class="casting-value-circle">
      {{ props.ability.castingValue }}
    </div>
    <div v-else-if="props.ability.chantingValue" class="chanting-value-diamond">
      <font-awesome-icon :icon="['fas', 'diamond']" class="diamond-bg" />
      <span class="diamond-chanting-text">{{ props.ability.chantingValue }}</span>
    </div>
    <div v-else-if="props.ability.cost" class="cost-hexagon-icon">
      <font-awesome-icon :icon="['fas', 'stop']" class="hexagon-bg" />
      <span class="hexagon-cost-text">{{ props.ability.cost }}</span>
    </div>
    <div class="card-header ability-header" :class="(props.ability.color || 'black').toLowerCase()">
      <span class="icon">
        <font-awesome-icon :icon="getAbilityIcon(props.ability.type)" />
      </span>
      <span class="timing" v-html="formatText(props.ability.timing)"></span>
    </div>
    <div class="card-title ability-title">{{ props.ability.name }}</div>
    <div class="card-body">
      <div
        v-if="props.ability.declare"
        class="card-text ability-text"
        v-html="formatText(`**Declare**: ${props.ability.declare}`)"
      ></div>
      <div
        class="card-text ability-text"
        v-html="formatText(`**Effect**: ${props.ability.text}`)"
      ></div>
      <KeywordsBar :keywords="props.ability.keywords" />
      <span
        v-if="typeof props.ability.points === 'number' && props.ability.points > 0"
        class="points-badge"
        style="margin-left: 0.5em"
      >
        {{ props.ability.points }} pts
      </span>
    </div>
  </div>
</template>
<style src="./AbilityCard.css" scoped></style>
<style scoped>
.casting-value-circle {
  position: absolute;
  top: -12px;
  right: -12px;
  background: #fff;
  border: 2px solid #888;
  color: #333;
  font-weight: bold;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chanting-value-diamond {
  position: absolute;
  top: -14px;
  right: -14px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.diamond-bg {
  font-size: 2.2rem;
  color: #fff;
  stroke: #000;
  stroke-width: 20px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.08));
}

.diamond-chanting-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #222;
  font-weight: bold;
  font-size: 1.1rem;
  pointer-events: none;
}

.cost-hexagon-icon {
  position: absolute;
  top: -14px;
  right: -14px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.hexagon-bg {
  font-size: 2.2rem;
  color: #fff;
  stroke: #000;
  stroke-width: 20px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.08));
}

.hexagon-cost-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #222;
  font-weight: bold;
  font-size: 1.1rem;
  pointer-events: none;
}

.ability-declare {
  font-size: 0.95em;
  color: #666;
  margin-bottom: 0.3em;
}

.card.ability-card {
  position: relative;
}

.points-badge {
  background: #8b0000;
  color: #fff;
  font-size: 0.78em;
  font-weight: 600;
  border-radius: 1em;
  padding: 0.08em 0.7em 0.08em 0.7em;
  margin-top: 0;
  margin-left: 0;
  display: inline-block;
  vertical-align: middle;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  letter-spacing: 0.01em;
}
</style>
