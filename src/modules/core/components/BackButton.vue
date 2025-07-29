<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useRouter } from 'vue-router';
const props = defineProps<{ size?: number }>();
const router = useRouter();
const iconSize = props.size ?? 36;
function goBack() {
  // If there is no history or going back would leave the app, go to HomePage
  if (window.history.length > 2) {
    router.back();
  } else {
    router.replace({ path: '/' });
  }
}
</script>
<template>
  <button
    class="back-btn"
    aria-label="Back"
    @click="goBack"
  >
    <FontAwesomeIcon
class="bg-sub text-muted"
      icon="fa-solid fa-arrow-left"
      :style="{
        fontSize: iconSize + 'px',
        borderRadius: '50%',
        width: iconSize + 'px',
        height: iconSize + 'px',
        padding: iconSize * 0.22 + 'px',
      }"
    />
  </button>
</template>
<style scoped>
.back-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  position: sticky;
  top: 0.5rem;
  z-index: 10;
}
.back-btn:hover {
  background: var(--bg-selected);
}
</style>
