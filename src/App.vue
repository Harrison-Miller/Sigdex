<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import NoticeModal from './components/NoticeModal.vue';
import { findNextNoticeToShow, markNoticeSeen } from './utils/notices';

const showNotice = ref(false);
const currentNotice = ref<any>(null);

onMounted(() => {
  const unseen = findNextNoticeToShow();
  if (unseen) {
    currentNotice.value = unseen;
    showNotice.value = true;
  }
});

function handleNoticeClose() {
  if (currentNotice.value) markNoticeSeen(currentNotice.value);
  showNotice.value = false;
}
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
