<template>
  <div class="list-button-section">
    <div class="main-grid">
      <div class="button-col">
        <div class="header-btn-row">
          <ListButton
            v-bind="buttonProps"
            class="list-button header-btn"
            @click="$emit('click')"
            @toggle-favorite="$emit('toggle-favorite', $event)"
          />
        </div>
        <transition name="section-fade">
          <div v-show="!collapsed" class="section-content-stack">
            <div class="grey-bar" />
            <div class="list-button-wrapper">
              <slot />
            </div>
          </div>
        </transition>
      </div>
      <div class="collapse-btn-col">
        <div class="collapse-btn-row">
          <button
            class="collapse-btn"
            :aria-label="collapsed ? 'Expand section' : 'Collapse section'"
            @click="toggleCollapse"
          >
            <svg
              :class="collapsed ? 'chevron-collapsed' : 'chevron-open'"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import ListButton from './ListButton.vue';
import { useCollapsableState } from '../../core/composables/useCollapsableState';

const props = defineProps({
  label: { type: String, required: true },
  favoriteType: { type: String, default: '' },
  points: { type: Number, default: 0 },
  showGeneral: { type: Boolean, default: false },
  showReinforced: { type: Boolean, default: false },
  enhancementCount: { type: Number, default: 0 },
});

const emit = defineEmits(['click', 'toggle-favorite', 'update:collapsed']);

const { collapsed, toggle } = useCollapsableState(props.label, true);

function toggleCollapse(e: Event) {
  e.stopPropagation();
  toggle();
  emit('update:collapsed', collapsed.value);
}

const buttonProps = computed(() => ({
  label: props.label,
  favoriteType: props.favoriteType === "army" || props.favoriteType === "unit"
    ? props.favoriteType as "army" | "unit"
    : undefined,
  points: props.points,
  showGeneral: props.showGeneral,
  showReinforced: props.showReinforced,
  enhancementCount: props.enhancementCount,
}));

const headerBtnRef = ref<HTMLElement | null>(null);

function setChildBtnWidth() {
  nextTick(() => {
    if (headerBtnRef.value) {
      const width = headerBtnRef.value.offsetWidth;
      const sectionEl = headerBtnRef.value.closest('.list-button-section') as HTMLElement | null;
      sectionEl?.style.setProperty('--header-btn-width', width + 'px');
    }
  });
}

onMounted(() => {
  setChildBtnWidth();
});
</script>
<style scoped>
.list-button-section {
  width: 100%;
}
.header-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: stretch;
  width: 100%;
}
.main-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: flex-start;
  width: 100%;
}
.button-col {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.header-btn-row {
  width: 100%;
}
.section-content-stack {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-top: 0.2em;
}
.grey-bar {
  width: 4px;
  background: #d0e0d0;
  border-radius: 2px;
  margin-right: 1em;
  min-height: 100%;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
}
.list-button-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.collapse-btn-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  height: 100%;
}
.collapse-btn-row {
  margin-top: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}
.collapse-btn svg {
  transition: transform 0.2s;
}
.chevron-collapsed {
  transform: rotate(-90deg);
}
.chevron-open {
  transform: rotate(0deg);
}
.collapse-btn {
  background: none;
  border: none;
  padding: 0.5em;
  cursor: pointer;
  color: #888;
  transition: color 0.2s;
}
.grey-bar-col {
  display: flex;
  align-items: stretch;
}
.content-btn-col {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.grey-bar {
  width: 4px;
  background: #d0e0d0;
  border-radius: 2px;
  margin-right: 1em;
  min-height: 100%;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
}
.section-content {
  flex: 1;
  padding-left: 0.1em;
  padding-bottom: 0.2em;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.list-button-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5em;
  margin-top: 0.5em;
}
.list-button {
  width: 100%;
  box-sizing: border-box;
}
/* All list-buttons in section share the same column and width as header */
.list-button-section .list-button {
  width: 100%;
  box-sizing: border-box;
}
.section-fade-enter-active,
.section-fade-leave-active {
  transition: opacity 0.18s;
}
.section-fade-enter-from,
.section-fade-leave-to {
  opacity: 0;
}
</style>
