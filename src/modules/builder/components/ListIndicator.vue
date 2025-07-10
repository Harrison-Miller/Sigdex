<template>
  <div class="points-validity-fab" v-if="list && army">
    <button
      class="validity-indicator"
      :class="isListValid ? 'valid' : 'invalid'"
      @click="!isListValid ? (showViolationsModal = true) : null"
      :title="isListValid ? 'List is valid' : 'List has issues'"
    >
      <font-awesome-icon v-if="isListValid" icon="fa-solid fa-check" class="valid-check" />
      <font-awesome-icon v-else icon="fa-solid fa-triangle-exclamation" class="valid-warning" />
    </button>
    <div class="points-fab">
      <span :class="{ 'over-cap': pointsTotal > pointsCap }">
        {{ pointsTotal }} / {{ pointsCap }} pts
      </span>
    </div>
    <Modal
      v-if="showViolationsModal"
      :model-value="showViolationsModal"
      @close="showViolationsModal = false"
    >
      <div class="violations-modal">
        <h3>List Issues</h3>
        <ul>
          <li v-for="msg in violations" :key="msg">{{ msg }}</li>
        </ul>
        <button @click="showViolationsModal = false" class="close-btn">Close</button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Modal from '../../../components/Modal.vue';
import { calculatePoints } from '../../../utils/points-manager';
import { calculateViolations } from '../../../utils/violations-manager';
import type { List } from '../../../common/ListData';
import type { IGame } from '../../../parser/v3/models/game';
import { Army } from '../../../parser/v3/models/army';

const props = defineProps<{
  list: List;
  game: IGame;
  pointsCap: number;
}>();

const army = computed(
  () => props.game.armies.get(props.list.faction) || new Army({ name: props.list.faction })
);

const showViolationsModal = ref(false);
const pointsTotal = computed(() => {
  if (!props.list || !army) return 0;
  return calculatePoints(props.list, army.value, props.game.universalManifestationLores);
});
const violations = computed(() => {
  if (!props.list || !army) return [];
  return calculateViolations(props.list, props.game);
});
const isListValid = computed(() => violations.value.length === 0);
</script>

<style scoped>
.points-validity-fab {
  position: fixed;
  left: 1em;
  bottom: 1em;
  display: flex;
  align-items: center;
  gap: 0;
  z-index: 1200;
}
.validity-indicator {
  border: 2px solid;
  border-radius: 10px;
  cursor: pointer;
  padding: 0.2em 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6em;
  margin-right: 0;
  transition:
    background 0.18s,
    border 0.18s;
}
.validity-indicator.valid {
  background: #22c55e;
  border-color: #22c55e;
}
.validity-indicator.invalid {
  background: #fde047;
  border-color: #fde047;
}
.validity-indicator:focus,
.validity-indicator:hover {
  filter: brightness(0.95);
}
.points-fab {
  background: #fff;
  color: #222;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.13);
  padding: 0.5em 0.9em;
  font-size: 0.95em;
  font-weight: 600;
  border: 2px solid #a00;
  min-width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.points-fab .over-cap {
  color: #a00;
}
.points-fab span {
  font-size: 1em;
}
.valid-check {
  color: #fff;
}
.valid-warning {
  color: #a16207;
}
.violations-modal {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1em;
  min-width: 260px;
}
.violations-modal h3 {
  margin: 0 0 0.5em 0;
  font-size: 1.15em;
  font-weight: 600;
}
.violations-modal ul {
  margin: 0 0 1em 0;
  padding-left: 1.2em;
}
.violations-modal li {
  color: #a00;
  font-size: 1em;
  margin-bottom: 0.3em;
}
.close-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1.2em;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-end;
  transition: background 0.2s;
}
.close-btn:hover {
  background: #1251a2;
}
</style>
