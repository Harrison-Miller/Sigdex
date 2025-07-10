<script setup lang="ts">
import type { IBattleTacticCard } from '../../../parser/models/game';
import { formatText } from '../../../utils/formatter';
defineProps<{ card: IBattleTacticCard }>();
</script>
<template>
  <div class="battle-tactic-card">
    <div class="header-bar">{{ card.name }}</div>
    <div class="card-content">
      <div v-if="card.text" class="main-text" v-html="formatText(card.text)"></div>
      <div class="subsection">
        <div class="subheader">Affray</div>
        <div class="subtext" v-html="formatText(card.affray)"></div>
      </div>
      <div class="subsection">
        <div class="subheader">Strike</div>
        <div class="subtext" v-html="formatText(card.strike)"></div>
      </div>
      <div class="subsection">
        <div class="subheader">Domination</div>
        <div class="subtext" v-html="formatText(card.domination)"></div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.battle-tactic-card {
  background: #fffefb;
  border: 1.5px solid #ccc;
  border-radius: 10px;
  margin-bottom: 1.1em;
  box-shadow: 0 2px 8px rgba(191, 161, 58, 0.08);
  overflow: hidden;
  font-size: 1.08em;
}
.header-bar {
  background: linear-gradient(90deg, #b59f3b 0%, #b59f3b 100%);
  color: #222;
  font-weight: 700;
  font-size: 1.13em;
  padding: 0.7em 1.1em;
  border-bottom: 1.5px solid #b59f3b;
  letter-spacing: 0.01em;
}
.card-content {
  padding: 1em 1.1em 1.1em 1.1em;
}
.main-text {
  margin-bottom: 0.7em;
  color: #222;
}
.subsection {
  margin-bottom: 0.5em;
}
.subheader {
  font-weight: 700;
  color: #222;
  margin-bottom: 0.1em;
  font-size: 1em;
}
.subtext {
  color: #222;
  margin-bottom: 0.2em;
  font-size: 0.98em;
}
</style>
