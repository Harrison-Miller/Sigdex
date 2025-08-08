<template>
  <div class="popover-container">
    <!-- Trigger element -->
    <div
      ref="triggerRef"
      class="popover-trigger"
      @click="togglePopover"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <slot name="trigger" />
    </div>

    <!-- Popover content -->
    <Teleport to="body">
      <div
        v-if="isVisible"
        ref="popoverRef"
        class="popover"
        :class="popoverClasses"
        :style="popoverStyles"
        @mouseenter="onPopoverMouseEnter"
        @mouseleave="onPopoverMouseLeave"
      >
        <div class="popover-arrow" :class="arrowClasses"></div>
        <div class="popover-content">
          <slot />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

interface Props {
  trigger?: 'click' | 'hover';
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  trigger: 'click',
  placement: 'top',
  offset: 8,
  disabled: false
});

const emit = defineEmits<{
  show: [];
  hide: [];
}>();

const isVisible = ref(false);
const triggerRef = ref<HTMLElement>();
const popoverRef = ref<HTMLElement>();
const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

const popoverStyles = ref<Record<string, string | number>>({
  top: '0px',
  left: '0px',
  zIndex: 1000
});

const popoverClasses = computed(() => [
  `popover-${props.placement}`
]);

const arrowClasses = computed(() => [
  `popover-arrow-${props.placement}`
]);

function showPopover() {
  if (props.disabled) return;
  
  isVisible.value = true;
  emit('show');
  nextTick(() => {
    updatePosition();
  });
}

function hidePopover() {
  isVisible.value = false;
  emit('hide');
}

function togglePopover() {
  if (props.trigger !== 'click') return;
  
  if (isVisible.value) {
    hidePopover();
  } else {
    showPopover();
  }
}

function onMouseEnter() {
  if (props.trigger !== 'hover') return;
  
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
    hoverTimeout.value = null;
  }
  showPopover();
}

function onMouseLeave() {
  if (props.trigger !== 'hover') return;
  
  hoverTimeout.value = setTimeout(() => {
    hidePopover();
  }, 100);
}

function onPopoverMouseEnter() {
  if (props.trigger !== 'hover') return;
  
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
    hoverTimeout.value = null;
  }
}

function onPopoverMouseLeave() {
  if (props.trigger !== 'hover') return;
  
  hoverTimeout.value = setTimeout(() => {
    hidePopover();
  }, 100);
}

function updatePosition() {
  if (!triggerRef.value || !popoverRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const popoverRect = popoverRef.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = 0;
  let left = 0;
  let arrowLeft = '50%'; // Default arrow position

  switch (props.placement) {
    case 'top':
      top = triggerRect.top - popoverRect.height - props.offset;
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
      break;
    case 'bottom':
      top = triggerRect.bottom + props.offset;
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
      break;
    case 'left':
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
      left = triggerRect.left - popoverRect.width - props.offset;
      break;
    case 'right':
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
      left = triggerRect.right + props.offset;
      break;
  }

  // Keep popover within viewport bounds
  if (left < 0) left = 8;
  if (left + popoverRect.width > viewportWidth) left = viewportWidth - popoverRect.width - 8;
  if (top < 0) top = 8;
  if (top + popoverRect.height > viewportHeight) top = viewportHeight - popoverRect.height - 8;

  // Adjust arrow position based on how much the popover was shifted
  if (props.placement === 'top' || props.placement === 'bottom') {
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    const popoverLeft = left;
    const arrowPosition = triggerCenter - popoverLeft;
    
    // Constrain arrow within popover bounds (with some padding)
    const minArrow = 15;
    const maxArrow = popoverRect.width - 15;
    const clampedArrowPosition = Math.max(minArrow, Math.min(maxArrow, arrowPosition));
    
    arrowLeft = `${clampedArrowPosition}px`;
  }

  popoverStyles.value = {
    top: `${top + window.scrollY}px`,
    left: `${left + window.scrollX}px`,
    zIndex: 1000,
    '--arrow-left': arrowLeft
  };
}

function handleClickOutside(event: Event) {
  if (props.trigger !== 'click' || !isVisible.value) return;
  
  const target = event.target as Node;
  if (
    triggerRef.value &&
    popoverRef.value &&
    !triggerRef.value.contains(target) &&
    !popoverRef.value.contains(target)
  ) {
    hidePopover();
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && isVisible.value) {
    hidePopover();
  }
}

function handleScroll() {
  if (isVisible.value) {
    hidePopover();
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
  document.addEventListener('scroll', handleScroll, true); // Use capture phase to catch all scroll events
  window.addEventListener('resize', updatePosition);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
  document.removeEventListener('scroll', handleScroll, true);
  window.removeEventListener('resize', updatePosition);
  
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
  }
});
</script>

<style scoped>
.popover-container {
  position: relative;
  display: inline-block;
}

.popover-trigger {
  cursor: pointer;
}

.popover {
  position: absolute;
  background: var(--bg-head);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 300px;
  word-wrap: break-word;
}

.popover-content {
  padding: 0.75rem;
  color: var(--text-main);
  font-size: 0.9rem;
  line-height: 1.4;
}

.popover-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

/* Top placement - arrow points down */
.popover-top .popover-arrow-top {
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: var(--bg-head);
  border-bottom: none;
}

.popover-top .popover-arrow-top::before {
  content: '';
  position: absolute;
  bottom: 1px;
  left: -7px;
  width: 0;
  height: 0;
  border: 7px solid transparent;
  border-top-color: var(--border-color);
  border-bottom: none;
}

/* Bottom placement - arrow points up */
.popover-bottom .popover-arrow-bottom {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: var(--bg-head);
  border-top: none;
}

.popover-bottom .popover-arrow-bottom::before {
  content: '';
  position: absolute;
  top: 1px;
  left: -7px;
  width: 0;
  height: 0;
  border: 7px solid transparent;
  border-bottom-color: var(--border-color);
  border-top: none;
}

/* Left placement - arrow points right */
.popover-left .popover-arrow-left {
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: var(--bg-head);
  border-right: none;
}

.popover-left .popover-arrow-left::before {
  content: '';
  position: absolute;
  right: 1px;
  top: -7px;
  width: 0;
  height: 0;
  border: 7px solid transparent;
  border-left-color: var(--border-color);
  border-right: none;
}

/* Right placement - arrow points left */
.popover-right .popover-arrow-right {
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: var(--bg-head);
  border-left: none;
}

.popover-right .popover-arrow-right::before {
  content: '';
  position: absolute;
  left: 1px;
  top: -7px;
  width: 0;
  height: 0;
  border: 7px solid transparent;
  border-right-color: var(--border-color);
  border-left: none;
}
</style>
