<script setup lang="ts">
const props = defineProps<{
  value: string | number;
  label: string;
}>();
</script>
<template>
  <div class="stat-circle-outer">
    <span class="stat-label">{{ props.label }}</span>
    <div class="stat-circle">
      <span class="stat-value">{{ props.value }}</span>
    </div>
  </div>
</template>
<style scoped>
.stat-circle-outer {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-label {
  font-size: 0.8rem;
  font-weight: normal;
  color: #444;
  margin-bottom: 0.2rem;
  text-align: center;
  width: 100%;
}
.stat-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 2px solid #ccc;
  aspect-ratio: 1 / 1;
}
.stat-value {
  font-size: 1.6rem;
  font-weight: bold;
  color: #222;
  line-height: 1;
  text-align: center;
}
</style>
