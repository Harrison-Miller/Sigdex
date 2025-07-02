<script setup lang="ts">
import { ref, watch, toRefs, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
const props = defineProps<{
  label: string;
  favorite?: boolean;
  showFavoriteToggle?: boolean;
  points?: number;
  showEllipsis?: boolean;
  showGeneral?: boolean;
  showReinforced?: boolean;
}>();
const emit = defineEmits(['click', 'toggle-favorite', 'ellipsis']);
const { favorite } = toRefs(props);
const isFavorite = ref(!!favorite?.value);
const showFavoriteToggle = props.showFavoriteToggle !== false;
watch(favorite, (val) => {
  isFavorite.value = !!val;
});
function toggleFavorite(e: Event) {
  e.stopPropagation();
  isFavorite.value = !isFavorite.value;
  emit('toggle-favorite', isFavorite.value);
}
function onEllipsisClick(e: Event) {
  e.stopPropagation();
  emit('ellipsis');
}
// Remove (Scourge of Ghyran) from label and detect if present
const isSoG = computed(() => /\(Scourge of Ghyran\)/.test(props.label));
const displayLabel = computed(() => props.label.replace(/\s*\(Scourge of Ghyran\)/, ''));
// Double the displayed points if showReinforced is true, as requested.
const displayPoints = computed(() => {
  if (typeof props.points !== 'number') return undefined;
  return props.showReinforced ? props.points * 2 : props.points;
});
</script>
<template>
  <button class="list-button" @click="$emit('click')">
    <span class="list-label" :class="{ center: !showFavoriteToggle }">
      {{ displayLabel }}
      <div
        class="badges-row"
        v-if="
          (typeof props.points === 'number' && props.points > 0) ||
          isSoG ||
          props.showGeneral ||
          props.showReinforced
        "
      >
        <span v-if="typeof displayPoints === 'number' && displayPoints > 0" class="points-badge">
          {{ displayPoints }} pts
        </span>
        <span v-if="isSoG" class="sog-badge">SoG</span>
        <span v-if="props.showGeneral" class="general-badge">General</span>
        <span v-if="props.showReinforced" class="reinforced-badge">Reinforced</span>
      </div>
    </span>
    <span
      v-if="showFavoriteToggle"
      class="favorite-icon"
      :class="{ active: isFavorite }"
      @click="toggleFavorite"
    >
      <svg
        v-if="isFavorite"
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="#eab308"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#aaa"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
    </span>
    <span
      v-if="props.showEllipsis"
      class="ellipsis-icon"
      @click="onEllipsisClick"
      title="More options"
    >
      <FontAwesomeIcon icon="ellipsis-v" />
    </span>
  </button>
</template>
<style scoped>
.list-button {
  width: 100%;
  min-width: 0;
  max-width: none;
  padding: 0.71rem 1.1rem 0.71rem 1.1rem;
  font-size: 1.1rem;
  border-radius: 4px;
  border: 1.5px solid #222;
  background: #fffefb;
  color: #222;
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
}

.favorite-icon.active svg {
  filter: drop-shadow(0 0 2px #ec4899);
}

.favorite-icon svg[fill='#eab308'] {
  fill: #ec4899 !important;
}

.list-button:hover {
  background: #f3f3ef;
  color: #111;
  border: 1.5px solid #111;
}

.badges-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.18em; /* Reduced gap between badges */
  margin-top: 0.18em;
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

.sog-badge {
  background: #185c2b;
  color: #fff;
  font-size: 0.78em;
  font-weight: 700;
  border-radius: 1em;
  padding: 0.08em 0.7em 0.08em 0.7em;
  margin-top: 0;
  margin-left: 0.5em;
  display: inline-block;
  vertical-align: middle;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  letter-spacing: 0.01em;
}

.general-badge,
.reinforced-badge {
  background: #ffe066;
  color: #111; /* Changed from #a08000 to black */
  font-size: 0.78em;
  font-weight: 700;
  border-radius: 1em;
  padding: 0.08em 0.7em 0.08em 0.7em;
  margin-top: 0;
  margin-left: 0.5em;
  display: inline-block;
  vertical-align: middle;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  letter-spacing: 0.01em;
}

.ellipsis-icon {
  margin-left: 0.7rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #888;
  font-size: 1.25em;
  transition: color 0.18s;
  /* Make the clickable area larger without changing the visual size */
  position: relative;
  z-index: 1;
}

.ellipsis-icon::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 2.2em;
  height: 2.2em;
  border-radius: 50%;
  /* transparent clickable area */
  background: transparent;
  z-index: -1;
}

.ellipsis-icon:hover,
.ellipsis-icon:has(:hover),
.ellipsis-icon:hover::before {
  color: #222;
}
</style>
