<script setup lang="ts">
import { useRouter } from 'vue-router';
const props = defineProps<{ size?: number }>();
const router = useRouter();
const iconSize = props.size ?? 36;
function goBack() {
  router.back();
}
</script>
<template>
  <button class="back-btn" @click="goBack" aria-label="Back">
    <font-awesome-icon icon="fa-solid fa-arrow-left" :style="{ fontSize: iconSize + 'px', background: '#f3f3f3', borderRadius: '50%', width: iconSize + 'px', height: iconSize + 'px', padding: (iconSize * 0.22) + 'px', color: '#555' }" />
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
}
.back-btn:hover {
  background: #e5e5e5;
}
</style>
