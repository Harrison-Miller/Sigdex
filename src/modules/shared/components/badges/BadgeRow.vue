<template>
  <div class="badges-row">
    <slot />
  </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
.badges-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5em;
  margin-top: 0.25em;
}
</style>