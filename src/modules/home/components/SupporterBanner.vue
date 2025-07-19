<template>
  <div class="supporter-banner">
    <h3 class="supporter-title">Special thanks to the supporters of Sigdex</h3>
    <div class="supporter-scroll">
      <div
        class="supporter-track"
        :class="{ 'no-scroll': !scroll }"
      >
        <template v-if="scroll">
          <span
            v-for="(supporter, idx) in supporters"
            :key="`main-${idx}`"
            class="supporter-name"
            :class="supporter.class"
          >
            {{ supporter.name }}
          </span>
          <span
            v-for="(supporter, idx) in supporters"
            :key="`clone-${idx}`"
            class="supporter-name"
            :class="supporter.class"
          >
            {{ supporter.name }}
          </span>
        </template>
        <template v-else>
          <span
            v-for="(supporter, idx) in supporters"
            :key="`main-${idx}`"
            class="supporter-name"
            :class="supporter.class"
          >
            {{ supporter.name }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const scroll = false;
const supporters = [
  { name: '@srscott', class: 'text-supporter-level-1' },
];
</script>

<style scoped>
.supporter-banner {
  margin: 0em 0 1em 0;
  text-align: center;
}
.supporter-title {
  font-size: 1em;
  font-weight: 600;
  margin-bottom: 0.7em;

}
.supporter-scroll {
  width: 100%;
  overflow: hidden;
  position: relative;
  height: 2.2em;
}
.supporter-track {
  display: flex;
  gap: 0.5em;
  align-items: center;
  white-space: nowrap;
  animation: supporter-scroll 18s linear infinite;
}
.supporter-track.no-scroll {
  animation: none;
  justify-content: center;
}
.supporter-name {
  font-size: 1.1em;
  font-weight: 600;
  padding: 0.2em 0.7em;
  border-radius: 1em;
  background: var(--bg-head);
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  margin-right: 0.2em;
}
@keyframes supporter-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
