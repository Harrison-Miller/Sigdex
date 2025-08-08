<template>
  <Teleport to="body">
    <div class="toast-container">
      <transition-group name="toast-fade" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="toast.type"
        >
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

export type ToastType = 'info' | 'success' | 'error' | 'warning' | 'normal';
export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 1;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function addToast(message: string, type: ToastType = 'normal', duration = 3500) {
  const id = nextId++;
  const toast: Toast = { id, message, type, duration };
  toasts.value.push(toast);
  timers.set(id, setTimeout(() => removeToast(id), duration));
  return id;
}

function removeToast(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id);
  if (timers.has(id)) {
    clearTimeout(timers.get(id));
    timers.delete(id);
  }
}

onUnmounted(() => {
  timers.forEach(timer => clearTimeout(timer));
  timers.clear();
});

// Expose for global use

declare global {
  interface Window {
    $toast?: typeof addToast;
  }
}

if (!window.$toast) {
  window.$toast = addToast;
}
</script>
<style scoped>
.toast-container {
  width: 100%;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 4em;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}
.toast + .toast {
  margin-top: 0.5em;
}
.toast {
  width: 80%;
  max-width: 340px;
  min-width: 220px;
  background: var(--bg-head, #222);
  color: var(--text-main, #fff);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  padding: 1em 1.5em 1em 1em;
  font-size: 1.08em;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: auto;
  transition: opacity 0.5s, transform 0.2s;
  opacity: 1;
}
.toast-fade-enter-active, .toast-fade-leave-active {
  transition: opacity 0.5s;
}
.toast-fade-enter-from, .toast-fade-leave-to {
  opacity: 0;
}
 .toast.normal {
  background: var(--bg-selected, #22c55e);
  color: var(--text-main, #fff);
}
.toast.success {
  background: var(--success, #22c55e);
  color: #fff;
}
.toast.error {
  background: var(--danger, #e53e3e);
  color: #fff;
}
.toast.warning {
  background: var(--warning, #f59e42);
  color: #222;
}
.toast.info {
  background: var(--primary, #3b82f6);
  color: #fff;
}
.toast-message {
  flex: 1 1 auto;
  margin-right: 1em;
}
.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.3em;
  cursor: pointer;
  margin-left: 0.5em;
  padding: 0;
  pointer-events: auto;
}
</style>
