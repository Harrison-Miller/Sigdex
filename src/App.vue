<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import NoticeModal from './components/NoticeModal.vue';
import { findNextNoticeToShow, markNoticeSeen } from './utils/notices';
import { clearBSData } from './army';

const showNotice = ref(false);
const currentNotice = ref<any>(null);
const router = useRouter();

onMounted(() => {
  const unseen = findNextNoticeToShow();
  if (unseen) {
    currentNotice.value = unseen;
    showNotice.value = true;
  }
  window.addEventListener('keydown', handleClearBSDataShortcut);
});

function handleNoticeClose() {
  if (currentNotice.value) markNoticeSeen(currentNotice.value);
  showNotice.value = false;
}

function handleClearBSDataShortcut(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b' && e.code === 'KeyB' && e.shiftKey) {
    // Only trigger on Cmd+Shift+B (or Ctrl+Shift+B)
    e.preventDefault();
    clearBSData();
    router.push({ name: 'Armies' });
  }
}

// Remove event listener on unmount
onUnmounted(() => {
  window.removeEventListener('keydown', handleClearBSDataShortcut);
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
