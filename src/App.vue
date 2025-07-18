<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import NoticeModal from './modules/home/components/NoticeModal.vue';
import { findNextNoticeToShow, markNoticeSeen, type Notice } from './utils/notices';
import { clearGameCache, useGame } from './modules/shared/composables/useGame';
import { useDark, useToggle } from '@vueuse/core';

const showNotice = ref(false);
const currentNotice = ref<Notice | null>(null);
const router = useRouter();
const isDark = useDark();
const toggleDark = useToggle(isDark);

onMounted(() => {
  const unseen = findNextNoticeToShow();
  if (unseen) {
    currentNotice.value = unseen;
    showNotice.value = true;
  }
  window.addEventListener('keydown', handleClearBSDataShortcut);
  window.addEventListener('keydown', handleToggleDarkShortcut);
});

function handleNoticeClose() {
  if (currentNotice.value) markNoticeSeen(currentNotice.value);
  showNotice.value = false;
}

function handleClearBSDataShortcut(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b' && e.code === 'KeyB' && e.shiftKey) {
    // Only trigger on Cmd+Shift+B (or Ctrl+Shift+B)
    e.preventDefault();
    clearGameCache();
    useGame();
    router.push({ name: 'Armies' });
  }
}

function handleToggleDarkShortcut(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && e.code === 'KeyD' && e.shiftKey) {
    // Cmd+Shift+D or Ctrl+Shift+D
    e.preventDefault();
    toggleDark();
  }
}

// Remove event listener on unmount
onUnmounted(() => {
  window.removeEventListener('keydown', handleClearBSDataShortcut);
  window.removeEventListener('keydown', handleToggleDarkShortcut);
});
</script>

<template>
  <NoticeModal
    v-if="showNotice && currentNotice"
    :notice="currentNotice"
    :visible="showNotice"
    @close="handleNoticeClose"
  />
  <RouterView />
</template>
