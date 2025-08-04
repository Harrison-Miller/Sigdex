<script setup lang="ts">
import { ref, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import BadgeRow from './badges/BadgeRow.vue';
import PointsBadge from './badges/PointsBadge.vue';
import SoGBadge from './badges/SoGBadge.vue';
import GeneralBadge from './badges/GeneralBadge.vue';
import ReinforcedBadge from './badges/ReinforcedBadge.vue';
import EnhancementsBadge from './badges/EnhancementsBadge.vue';
import LegendsBadge from './badges/LegendsBadge.vue';
import PillBadge from '../../core/components/PillBadge.vue';
import { useFavorite } from '../../core/composables/useFavorite';

const props = defineProps<{
  label: string;
  favoriteType?: 'army' | 'unit';
  points?: number;
  showGeneral?: boolean;
  showReinforced?: boolean;
  enhancementCount?: number;
  legends?: boolean;
  splitOnSubLabel?: boolean;
  overrideSubLabel?: string;
  validator?: string;
  castingValue?: string;
  chantingValue?: string;
}>();

const emit = defineEmits(['click']);

const { isFavorited, toggleFavorite } = props.favoriteType
  ? useFavorite(props.favoriteType, props.label)
  : { isFavorited: ref(false), toggleFavorite: () => {} };

// Remove (Scourge of Ghyran) from label and detect if present
const isSoG = computed(() => /\(Scourge of Ghyran\)/.test(props.label));
const withoutSoG = computed(() => props.label.replace(/\s*\(Scourge of Ghyran\)/, ''));


const splitLabel = computed(() => withoutSoG.value.split(/,| on | with /));
const displayLabel = computed(() => splitLabel.value[0]);
const displaySubLabel = computed(() => {
  if (splitLabel.value.length <= 1) return '';
  // Only preserve "on"/"with" (not ",") in the sublabel
  const original = withoutSoG.value;
  const match = original.match(/ (on|with) (.*)$/);
  return match ? match[0].trim() : splitLabel.value.slice(1).join(' ');
});
// Double the displayed points if showReinforced is true, as requested.
const displayPoints = computed(() => {
  if (typeof props.points !== 'number') return undefined;
  return props.showReinforced ? props.points * 2 : props.points;
});
</script>
<template>
  <button
    class="list-button"
    @click="() => emit('click')"
  >
    <div
      v-if="props.castingValue"
      class="casting-value-circle"
    >
      {{ props.castingValue }}
    </div>
    <div
      v-else-if="props.chantingValue"
      class="chanting-value-diamond"
    >
      <FontAwesomeIcon
        :icon="['fas', 'diamond']"
        class="diamond-bg"
      />
      <span class="diamond-chanting-text">{{ props.chantingValue }}</span>
    </div>
    <span
      class="list-label"
    >
      {{ splitOnSubLabel ? displayLabel : withoutSoG }} <span v-if="(displaySubLabel && splitOnSubLabel) || overrideSubLabel" class="list-sublabel">{{ displaySubLabel || overrideSubLabel }}</span>
      <BadgeRow>
        <PointsBadge :points="displayPoints" />
        <SoGBadge :sog="isSoG" />
        <LegendsBadge :legends="legends" />
        <GeneralBadge :general="props.showGeneral" />
        <ReinforcedBadge :reinforced="props.showReinforced" />
        <EnhancementsBadge :count="props.enhancementCount" />
        <PillBadge v-if="validator" :class="`validator-${validator}`">
          {{ validator }}
        </PillBadge>
      </BadgeRow>
    </span>
    <span
      v-if="favoriteType"
      class="favorite-icon"
      :class="{ active: isFavorited }"
      @click.stop="toggleFavorite"
    >
      <FontAwesomeIcon icon="star" />
    </span>
  </button>
</template>
<style scoped>

.list-button {
  position: relative;
  width: 100%;
  min-width: 0;
  max-width: none;
  padding: 0.71rem 1.1rem 0.71rem 1.1rem;
  font-size: 1.1rem;
  border-radius: 4px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-head);
  color: var(--text-main);
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border 0.2s;
  box-shadow: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  text-align: left;
}

.list-label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-sublabel {
  font-size: 0.9em;
  color: var(--text-muted);
  margin-top: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-label.center {
  text-align: center;
  justify-content: center;
  width: 100%;
  display: flex;
}

.favorite-icon {
  margin-left: 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: color 0.2s;
  width: 32px;
  height: 32px; 
  justify-content: center;
}

.favorite-icon.active svg {
  color: var(--color-yellow);
}

.favorite-icon svg {
  color: #aaa;
  font-size: 1.4em;
}

.list-button:hover {
  background: var(--bg-sub);
  color: var(--text-main);
  border: 1.5px solid var(--border-hover);
}

.validator-standard {
  display: none !important;
}
.validator-highlander {
	background-color: var(--color-yellow) !important;
	color: #111;
	font-weight: 800;
}
.validator-holy.havoc {
  background-color: var(--color-blue) !important;
  color: #fff;
}
.validator-legends {
  background: var(--color-purple) !important;
  color: #fff;
}
.validator-disabled {
  background: var(--color-gray) !important;
  color: #fff;
}
.casting-value-circle {
  position: absolute;
  top: -12px;
  right: -12px;
  background: var(--bg-sub);
  border: 2px solid var(--border-color);
  color: var(--text-main);
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
  color: var(--bg-sub);
  stroke: var(--border-color);
  stroke-width: 20px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.08));
}

.diamond-chanting-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-main);
  font-weight: bold;
  font-size: 1.1rem;
  pointer-events: none;
}
</style>
