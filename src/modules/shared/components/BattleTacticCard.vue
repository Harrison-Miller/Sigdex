<script setup lang="ts">
import type { BattleTacticCard } from '../../../parser/models/game';
import { formatText } from '../../../utils/formatter';
defineProps<{ card: BattleTacticCard }>();
</script>
<template>
  <div class="battle-tactic-card">
    <div class="header-bar">{{ card.name }}</div>
    <div class="card-content">
      <div
        v-if="card.text"
        class="main-text"
        v-html="formatText(card.text)"
      />
      <div class="subsection">
        <div class="subheader">Affray</div>
        <div
          class="subtext"
          v-html="formatText(card.affray)"
        />
      </div>
      <div class="subsection">
        <div class="subheader">Strike</div>
        <div
          class="subtext"
          v-html="formatText(card.strike)"
        />
      </div>
      <div class="subsection">
        <div class="subheader">Domination</div>
        <div
          class="subtext"
          v-html="formatText(card.domination)"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
.battle-tactic-card {
  border: 1px solid var(--border-color);
  background-color: var(--bg-head);
  /* Remove fixed padding to allow content-fit */
  padding: 0;
  margin-bottom: 10px;
  display: inline-block;
  /* Fit to content */
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}
.header-bar {
  background: var(--color-yellow);
  color: var(--text-main);
  font-weight: 700;
  font-size: 1.13em;
  padding: 0.7em 1.1em;
  border-radius: 6px 6px 0 0;
  letter-spacing: 0.01em;
}
.card-content {
  padding: 1em 1.1em 1.1em 1.1em;
}
.main-text {
  margin-bottom: 0.7em;
  color: var(--text-main);
}
.subsection {
  margin-bottom: 0.5em;
}
.subheader {
  font-weight: 700;
  color: var(--text-head);
  margin-bottom: 0.1em;
  font-size: 1em;
}
.subtext {
  color: var(--text-sub);
  margin-bottom: 0.2em;
  font-size: 0.98em;
}
</style>
