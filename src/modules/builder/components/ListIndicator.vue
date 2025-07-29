<template>
  <div class="points-validity-fab">
    <button
      class="validity-indicator"
      :class="isListValid ? 'valid' : 'invalid'"
      :title="isListValid ? 'List is valid' : 'List has issues'"
      @click="!isListValid ? (showViolationsModal = true) : null"
    >
      <FontAwesomeIcon
        v-if="isListValid"
        icon="fa-solid fa-check"
        class="valid-check"
      />
      <FontAwesomeIcon
        v-else
        icon="fa-solid fa-triangle-exclamation"
        class="valid-warning"
      />
    </button>
    <div class="points-fab" :class="{ 'over-cap': pointsTotal > pointsCap }">
      <span>
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
          <li
            v-for="msg in errors"
            :key="msg"
          >
            {{ msg }}
          </li>
        </ul>
        <button
          class="close-btn"
          @click="showViolationsModal = false"
        >
          Close
        </button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Modal from '../../core/components/ModalBox.vue';
import { calculatePoints } from '../../../validation/points';
import type { List } from '../../../list/models/list';
import type { Game } from '../../../parser/models/game';
import { validateList } from '../../../validation/run';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  list: List;
  game: Game;
}>();

const showViolationsModal = ref(false);
const pointsTotal = computed(() => calculatePoints(props.list, props.game));
const errors = computed(() => validateList(props.list, props.game));
const isListValid = computed(() => errors.value.length === 0);
const pointsCap = computed(() => props.list.pointsCap);
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
  background: var(--success);
  border-color: var(--success);
}
.validity-indicator.invalid {
  background: var(--warning);
  border-color: var(--warning);
}
.validity-indicator:focus,
.validity-indicator:hover {
  filter: brightness(1.1);
}
.points-fab {
  background: var(--bg-sub);
  color: var(--text-main);
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.13);
  padding: 0.5em 0.9em;
  font-size: 0.95em;
  font-weight: 600;
  border: 2px solid var(--danger);
  min-width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.over-cap {
  background: var(--danger);
  color: #fff;
}
.points-fab span {
  font-size: 1em;
}
.valid-check {
  color: #fff;
}
.valid-warning {
  color: var(--color-yellow);
  filter: brightness(0.8);
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
  color: var(--text-main);
  font-size: 1em;
  margin-bottom: 0.3em;
}
.close-btn {
  background: var(--primary);
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
  filter: brightness(1.1);
}
</style>
