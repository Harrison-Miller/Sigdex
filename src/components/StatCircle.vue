<script setup lang="ts">
const props = defineProps<{
  value: string | number;
  label: string;
}>();
</script>
<template>
  <div class="stat-circle">
    {{ props.value }}
    <span>{{ props.label }}</span>
  </div>
</template>
<style scoped>
.stat-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 2px solid #ccc;
}
.stat-circle span {
  font-size: 0.8rem;
  font-weight: normal;
  color: #444;
  margin-top: 0.2rem;
}
</style>
