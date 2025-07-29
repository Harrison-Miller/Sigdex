<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const isVisible = ref(false);

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleScroll() {
  isVisible.value = window.scrollY > window.innerHeight * 1.5;
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <button
    v-if="isVisible"
    class="back-to-top-btn"
    aria-label="Back to Top"
    @click="scrollToTop"
  >
    <FontAwesomeIcon
      class="bg-sub text-muted"
      icon="fa-solid fa-arrow-up"
      :style="{
        fontSize: `36px`,
        borderRadius: '50%',
		width: `36px`,
		height: `36px`,
        padding: `${36 * 0.22}px`,
      }"
    />
  </button>
</template>

<style scoped>
.back-to-top-btn {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10000;
}

.back-to-top-btn:hover {
  background: var(--bg-selected);
}
</style>
