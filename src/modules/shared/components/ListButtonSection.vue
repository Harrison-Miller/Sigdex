<template>
  <div class="list-button-section">
    <div class="header-row">
      <ListButton
        v-bind="buttonProps"
        @click="$emit('click')"
        @toggle-favorite="$emit('toggle-favorite', $event)"
        @ellipsis="$emit('ellipsis')"
      />
      <button
        class="collapse-btn"
        :aria-label="collapsed ? 'Expand section' : 'Collapse section'"
        @click="toggleCollapse"
      >
        <svg
          :class="{ collapsed }"
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
    <transition name="section-fade">
      <div
        v-show="!collapsed"
        class="section-content-row"
      >
        <div class="grey-bar" />
        <div class="section-content">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import ListButton from './ListButton.vue';
import { useCollapsableState } from '../../core/composables/useCollapsableState';

const props = defineProps({
  label: { type: String, required: true },
  favorite: { type: Boolean, default: false },
  showFavoriteToggle: { type: Boolean, default: true },
  points: { type: Number, default: 0 },
  showEllipsis: { type: Boolean, default: false },
  showGeneral: { type: Boolean, default: false },
  showReinforced: { type: Boolean, default: false },
  enhancementCount: { type: Number, default: 0 },
});

const emit = defineEmits(['click', 'toggle-favorite', 'ellipsis', 'update:collapsed']);

const { collapsed, toggle } = useCollapsableState(props.label, true);

function toggleCollapse(e: Event) {
  e.stopPropagation();
  toggle();
  emit('update:collapsed', collapsed.value);
}

const buttonProps = computed(() => {
  // Pass all ListButton props
  return {
    label: props.label,
    favorite: props.favorite,
    showFavoriteToggle: props.showFavoriteToggle,
    points: props.points,
    showEllipsis: props.showEllipsis,
    showGeneral: props.showGeneral,
    showReinforced: props.showReinforced,
    enhancementCount: props.enhancementCount,
  };
});
</script>
<style scoped>
.list-button-section {
  width: 100%;
}
.header-row {
  display: flex;
  align-items: stretch;
  width: 100%;
}
.collapse-btn {
  background: none;
  border: none;
  padding: 0 0.2em;
  margin-left: 0.2em;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.18s;
  height: 100%;
}
.collapse-btn svg {
  transition: transform 0.18s;
}
.collapse-btn svg.collapsed {
  transform: rotate(-90deg);
}
.section-content-row {
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
.section-content {
  flex: 1;
  padding-left: 0.1em;
  padding-bottom: 0.2em;
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
