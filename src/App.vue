<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import NoticeModal from './modules/home/components/NoticeModal.vue';
import { findNextNoticeToShow, markNoticeSeen, type Notice } from './utils/notices';
import { clearGameCache, useGame } from './modules/shared/composables/useGame';
import { useDark, useStorage, useToggle } from '@vueuse/core';
import { SIGDEX_VERSION } from './version';
import BackToTop from './modules/core/components/BackToTop.vue';
import BackButton from './modules/core/components/BackButton.vue';
import { clearFAQCache } from './modules/shared/composables/useFAQ';
import ToastSystem from './modules/core/components/ToastSystem.vue';

const showNotice = ref(false);
const currentNotice = ref<Notice | null>(null);
const router = useRouter();
const isDark = useDark();
const toggleDark = useToggle(isDark);

const commit = computed(() => {
  const fullCommit = useStorage('gameCommit', '');
  if (!fullCommit.value) return '';
  return fullCommit.value.substring(0, 7);
})

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
    clearFAQCache();
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
  <BackButton />
  <RouterView />
  <BackToTop />
  <ToastSystem />
  <div class="sigdex-version">
    <div>Sigdex v{{ SIGDEX_VERSION }}</div>
    <div v-if="commit">BSData Commit: {{ commit }}</div>
  </div>
  <div class="scroll-buffer" />
</template>
<style scoped>
.sigdex-version {
  margin-top: 2rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.95em;
}
.sigdex-version div {
  margin: 0;
}
.scroll-buffer {
  height: 5em;
  width: 100%;
}
</style>